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
      return sendError("Invalid appointment ID", "VALIDATION_ERROR", 400);
    }

    const body = await req.json();
    const { status } = body as { status?: string };

    if (!status) {
      return sendError("Status is required", "VALIDATION_ERROR", 400);
    }

    // Fetch the appointment with user details
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!appointment) {
      return sendError("Appointment not found", "NOT_FOUND", 404);
    }

    // Prevent re-completing completed appointments
    if (appointment.status === "Completed") {
      return sendError("Completed appointment status cannot be changed", "VALIDATION_ERROR", 400);
    }

    // If changing status to Completed, increment donor's blood group inventory stock
    if (status === "Completed") {
      const bloodGroup = appointment.user.bloodGroup;
      
      if (bloodGroup) {
        // Run database updates inside a transaction
        const [updatedAppointment, updatedInventory] = await prisma.$transaction([
          prisma.appointment.update({
            where: { id },
            data: { status: "Completed" }
          }),
          prisma.bloodInventory.upsert({
            where: { bloodGroup },
            update: { stock: { increment: 1 } },
            create: { bloodGroup, stock: 1, total: 100 }
          }),
          prisma.activity.create({
            data: {
              type: "DONATION",
              title: "Donation Completed",
              desc: `Donor ${appointment.user.name} successfully donated 1 unit of ${bloodGroup} at ${appointment.location}. Stock level increased.`
            }
          })
        ]);

        return sendSuccess(
          { appointment: updatedAppointment, inventory: updatedInventory },
          `Appointment completed and 1 unit of ${bloodGroup} added to stock.`
        );
      } else {
        // If donor didn't set their blood group, we just complete the appointment without inventory increment
        const updatedAppointment = await prisma.appointment.update({
          where: { id },
          data: { status: "Completed" }
        });

        await prisma.activity.create({
          data: {
            type: "DONATION",
            title: "Donation Completed (No Blood Group)",
            desc: `Donor ${appointment.user.name} completed blood donation at ${appointment.location}. Profile has no blood group set, so inventory stock was not modified.`
          }
        });

        return sendSuccess(updatedAppointment, "Appointment completed (no blood group specified on donor profile)");
      }
    }

    // Otherwise perform basic status update (Scheduled, Cancelled)
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: { status }
    });

    await prisma.activity.create({
      data: {
        type: "DONATION",
        title: `Appointment Status: ${status}`,
        desc: `Blood donation appointment for ${appointment.user.name} at ${appointment.location} was marked as ${status} by system administrator.`
      }
    });

    return sendSuccess(updatedAppointment, `Appointment status updated to ${status}`);
  } catch (error) {
    return handleError(error, "PATCH /api/admin/appointments/[id]");
  }
}
