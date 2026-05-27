import { supabase } from "@/lib/supabase";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { sendBloodRequestEmail } from "@/lib/email";
import twilio from "twilio";
import { getUserIdFromRequest, getUserRoleFromRequest } from "@/lib/authHelper";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    const userRole = getUserRoleFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get("all") === "true" || userRole === "admin";

    let query = supabase.from("BloodRequest").select("id, bloodGroup, quantity, urgency, note, status, donorId, donorName, donorPhone, latitude, longitude, locationName, createdAt");
    
    if (!fetchAll) {
      query = query.eq("userId", userId);
    }

    const { data: requests, error } = await query.order("createdAt", { ascending: false });

    if (error) throw error;

    return sendSuccess(requests);
  } catch (error) {
    return handleError(error, "GET /api/requests");
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      console.warn("ROUTE HANDLER blocked: userId is falsy.");
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    if (userId === 9999) {
      // Ensure the admin user exists in the User database table to satisfy the foreign key constraint
      await prisma.user.upsert({
        where: { id: 9999 },
        update: { name: "Deevansh Rana", email: "deevanshrana011@gmail.com", role: "admin" },
        create: {
          id: 9999,
          name: "Deevansh Rana",
          email: "deevanshrana011@gmail.com",
          password: "dummy_admin_password",
          role: "admin"
        }
      });
    }

    const body = await req.json();
    const { bloodGroup, quantity, urgency, note, latitude, longitude, locationName } = body as {
      bloodGroup?: string;
      quantity?: number;
      urgency?: string;
      note?: string;
      latitude?: number;
      longitude?: number;
      locationName?: string;
    };

    if (!bloodGroup || !quantity) {
      return sendError(
        "Blood group and quantity are required",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validGroups.includes(bloodGroup)) {
      return sendError(
        "Invalid blood group",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    if (typeof quantity !== "number" || quantity < 1) {
      return sendError(
        "Quantity must be at least 1",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    const { data: created, error } = await supabase
      .from("BloodRequest")
      .insert({
        userId,
        bloodGroup,
        quantity,
        urgency: urgency || "Normal",
        note: note || null,
        latitude: latitude || null,
        longitude: longitude || null,
        locationName: locationName || null,
      })
      .select("id, bloodGroup, quantity, urgency, note, status, latitude, longitude, locationName, createdAt")
      .single();

    if (error) throw error;

    // Fetch user details for notifications
    const { data: user } = await supabase.from("User").select("name, phone").eq("id", userId).maybeSingle();
    const patientName = user?.name || "Unknown Patient";
    const contactPhone = user?.phone || "Not provided";

    // 1. Create a dynamic notification entry for donors, NGOs, and admins
    const isEmergency = urgency === "Emergency" || urgency === "Critical";
    await supabase.from("Notification").insert({
      type: isEmergency ? "EMERGENCY" : "REQUEST",
      title: `🩸 New Request: ${bloodGroup} Needed`,
      desc: `${quantity} units requested at ${locationName || "Location not provided"} (${urgency} Urgency) by ${patientName}. Call ${contactPhone}`,
      isRead: false,
    });

    // 2. Log a system activity so NGOs can see it in their central dashboard registry/logs
    await supabase.from("Activity").insert({
      type: "REQUEST",
      title: "Blood Request Raised",
      desc: `${patientName} requested ${quantity} units of ${bloodGroup} at ${locationName || "Location not provided"}`,
    });

    // Fire and forget email notification
    sendBloodRequestEmail(patientName, bloodGroup, urgency || "Normal", quantity, locationName || "Location not provided", contactPhone).catch(console.error);

    // If urgency is Emergency, trigger Twilio Phone Call
    if (urgency === "Emergency") {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      const adminPhone = process.env.ADMIN_PHONE_NUMBER;

      if (accountSid && authToken && twilioPhone && adminPhone && !accountSid.includes('dummy')) {
        try {
          const twilioClient = twilio(accountSid, authToken);
          twilioClient.calls.create({
            twiml: `<Response><Say>Alert! Alert! Emergency blood request received for ${quantity} units of ${bloodGroup} blood type. Location is ${locationName || 'unknown'}. Please check the redhope dashboard immediately.</Say></Response>`,
            to: adminPhone,
            from: twilioPhone
          }).then(call => console.log('Twilio Call Dispatched:', call.sid))
            .catch(err => console.error('Twilio Call Failed:', err));
        } catch (e) {
          console.error("Failed to initialize Twilio client", e);
        }
      } else {
        console.warn("Twilio variables not properly set. Skipping Emergency Phone Call.");
      }
    }

    return sendSuccess(created, "Blood request created", 201);
  } catch (error) {
    return handleError(error, "POST /api/requests");
  }
}
