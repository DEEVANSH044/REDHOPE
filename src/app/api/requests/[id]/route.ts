import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { getUserIdFromRequest } from "@/lib/authHelper";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    // Resolve params safely for Next.js dynamic parameters
    const resolvedParams = typeof (params as any).then === "function" ? await params : params;
    const requestId = Number((resolvedParams as any).id);

    if (isNaN(requestId)) {
      return sendError("Invalid Request ID", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const body = await req.json();
    const { status, donorId, donorName, donorPhone } = body as {
      status?: string;
      donorId?: number;
      donorName?: string;
      donorPhone?: string;
    };

    if (!status) {
      return sendError("Status is required", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // 1. Fetch current request
    const bloodRequest = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
      include: { user: true }
    });

    if (!bloodRequest) {
      return sendError("Blood request not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // 2. Perform updates
    const updateData: any = { status };
    if (status === "Accepted") {
      updateData.donorId = donorId || userId;
      updateData.donorName = donorName || "Verified Blood Donor";
      updateData.donorPhone = donorPhone || "+91 99999 99999";
    }

    const updated = await prisma.bloodRequest.update({
      where: { id: requestId },
      data: updateData
    });

    // 3. Log activity
    await prisma.activity.create({
      data: {
        type: status === "Accepted" ? "DONATION" : "FULFILLMENT",
        title: `Request Status: ${status}`,
        desc: `Blood request for ${bloodRequest.bloodGroup} was marked as ${status} by donor.`
      }
    });

    return sendSuccess(updated, `Request updated to ${status} successfully`);
  } catch (error) {
    return handleError(error, `PATCH /api/requests/[id]`);
  }
}
