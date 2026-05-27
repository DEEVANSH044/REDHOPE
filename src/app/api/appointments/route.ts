import { supabase } from "@/lib/supabase";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { getUserIdFromRequest } from "@/lib/authHelper";

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { data: appointments, error } = await supabase
      .from("Appointment")
      .select("id, date, time, location, status, createdAt")
      .eq("userId", userId)
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return sendSuccess(appointments);
  } catch (error) {
    return handleError(error, "GET /api/appointments");
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const { date, time, location } = body as {
      date?: string;
      time?: string;
      location?: string;
    };

    if (!date || !time || !location) {
      return sendError(
        "Date, time, and location are required",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    const { data: created, error } = await supabase
      .from("Appointment")
      .insert({
        userId,
        date,
        time,
        location,
      })
      .select("id, date, time, location, status, createdAt")
      .single();

    if (error) throw error;

    return sendSuccess(created, "Appointment booked", 201);
  } catch (error) {
    return handleError(error, "POST /api/appointments");
  }
}
