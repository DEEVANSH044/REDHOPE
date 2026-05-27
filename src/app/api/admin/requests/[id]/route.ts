import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

const prisma = new PrismaClient();

function parseId(value: string) {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) {
      return sendError("Invalid request ID", "VALIDATION_ERROR", 400);
    }

    const body = await req.json();
    const { status } = body as { status?: string };

    if (!status) {
      return sendError("Status is required", "VALIDATION_ERROR", 400);
    }

    // 1. Fetch current blood request
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!bloodRequest) {
      return sendError("Blood request not found", "NOT_FOUND", 404);
    }

    // If already fulfilled, block status changes
    if (bloodRequest.status === "Fulfilled") {
      return sendError("Fulfillment status cannot be changed", "VALIDATION_ERROR", 400);
    }

    // If changing to "Fulfilled", perform transaction and inventory checks
    if (status === "Fulfilled") {
      const inventory = await prisma.bloodInventory.findUnique({
        where: { bloodGroup: bloodRequest.bloodGroup }
      });

      if (!inventory) {
        return sendError(`Blood group ${bloodRequest.bloodGroup} not found in inventory record`, "NOT_FOUND", 404);
      }

      if (inventory.stock < bloodRequest.quantity) {
        return sendError(
          `Insufficient inventory stock. Requested: ${bloodRequest.quantity} units of ${bloodRequest.bloodGroup}, Available: ${inventory.stock} units.`,
          "VALIDATION_ERROR",
          400
        );
      }

      const [updatedRequest, updatedInventory] = await prisma.$transaction([
        prisma.bloodRequest.update({
          where: { id },
          data: { status: "Fulfilled" }
        }),
        prisma.bloodInventory.update({
          where: { bloodGroup: bloodRequest.bloodGroup },
          data: { stock: { decrement: bloodRequest.quantity } }
        }),
        prisma.activity.create({
          data: {
            type: "FULFILLMENT",
            title: "Request Fulfilled by Admin",
            desc: `${bloodRequest.quantity} units of ${bloodRequest.bloodGroup} dispatched to ${bloodRequest.locationName || 'unknown location'} for patient ${bloodRequest.user.name}.`
          }
        })
      ]);

      // Check threshold for notifications
      const newStockRatio = updatedInventory.stock / updatedInventory.total;
      if (newStockRatio <= 0.15) {
        await prisma.notification.create({
          data: {
            type: "LOW_STOCK",
            title: "Critical Stock Warning",
            desc: `Blood group ${updatedInventory.bloodGroup} stock level is critical (${updatedInventory.stock}/${updatedInventory.total} units) following dispatch.`,
            isRead: false,
          }
        });
      }

      return sendSuccess(updatedRequest, "Blood request fulfilled and stock updated successfully");
    }

    // Otherwise perform basic status update (Approved, Rejected, Pending)
    const updatedRequest = await prisma.bloodRequest.update({
      where: { id },
      data: { status }
    });

    // Log general activity
    await prisma.activity.create({
      data: {
        type: "REQUEST",
        title: `Request Status Updated: ${status}`,
        desc: `Blood request for ${bloodRequest.quantity} units of ${bloodRequest.bloodGroup} was marked as ${status} by system administrator.`
      }
    });

    return sendSuccess(updatedRequest, `Blood request status updated to ${status}`);
  } catch (error) {
    return handleError(error, "PATCH /api/admin/requests/[id]");
  }
}
