import { PrismaClient } from "@prisma/client";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { getUserIdFromRequest, getUserRoleFromRequest } from "@/lib/authHelper";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    const userRole = getUserRoleFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    // Restrict request fulfillment to administrators or staff
    if (userRole !== "admin") {
      return sendError("Only administrators can fulfill requests", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const { requestId } = body as { requestId?: number };

    if (!requestId) {
      return sendError("Request ID is required", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // 1. Fetch the blood request
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!bloodRequest) {
      return sendError("Blood request not found", ERROR_CODES.NOT_FOUND, 404);
    }

    if (bloodRequest.status === "Fulfilled") {
      return sendError("This blood request has already been fulfilled", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // 2. Fetch the corresponding inventory stock
    const inventory = await prisma.bloodInventory.findUnique({
      where: { bloodGroup: bloodRequest.bloodGroup }
    });

    if (!inventory) {
      return sendError(`Blood group ${bloodRequest.bloodGroup} not found in inventory record`, ERROR_CODES.NOT_FOUND, 404);
    }

    // 3. Verify stock level
    if (inventory.stock < bloodRequest.quantity) {
      return sendError(
        `Insufficient inventory stock. Requested: ${bloodRequest.quantity} units of ${bloodRequest.bloodGroup}, Available: ${inventory.stock} units.`,
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // 4. Perform the updates inside a transaction to maintain integrity
    const [updatedRequest, updatedInventory] = await prisma.$transaction([
      prisma.bloodRequest.update({
        where: { id: requestId },
        data: { status: "Fulfilled" }
      }),
      prisma.bloodInventory.update({
        where: { bloodGroup: bloodRequest.bloodGroup },
        data: { stock: { decrement: bloodRequest.quantity } }
      }),
      prisma.activity.create({
        data: {
          type: "FULFILLMENT",
          title: "Request Fulfilled",
          desc: `${bloodRequest.quantity} units of ${bloodRequest.bloodGroup} dispatched to ${bloodRequest.locationName || 'unknown hospital'}`
        }
      })
    ]);

    // Check if new stock fell below low stock threshold (15% of capacity)
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

    return sendSuccess({ request: updatedRequest, inventory: updatedInventory }, "Blood request fulfilled and stock updated successfully");
  } catch (error) {
    return handleError(error, "POST /api/requests/fulfill");
  }
}
