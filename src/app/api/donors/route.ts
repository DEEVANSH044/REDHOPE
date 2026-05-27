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

    const { searchParams } = new URL(req.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const city = searchParams.get("city");

    let query = supabase.from("Donor").select("*");

    const { data: donors, error } = await query;
    if (error) throw error;

    // Filter in-memory if needed (due to mock supabase client simple filters)
    let filtered = donors || [];
    if (bloodGroup) {
      filtered = filtered.filter((d: any) => d.bloodGroup.toLowerCase() === bloodGroup.toLowerCase());
    }
    if (city) {
      filtered = filtered.filter((d: any) => d.city.toLowerCase().includes(city.toLowerCase()));
    }

    return sendSuccess(filtered);
  } catch (error) {
    return handleError(error, "GET /api/donors");
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const { name, bloodGroup, phone, city, lastDonationDate } = body as {
      name?: string;
      bloodGroup?: string;
      phone?: string;
      city?: string;
      lastDonationDate?: string;
    };

    if (!name || !bloodGroup || !phone || !city) {
      return sendError(
        "Name, blood group, phone, and city are required fields",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    const validGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
    if (!validGroups.includes(bloodGroup)) {
      return sendError("Invalid blood group", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    // Insert the new donor
    const { data: created, error } = await supabase
      .from("Donor")
      .insert({
        name,
        bloodGroup,
        phone,
        city,
        lastDonationDate: lastDonationDate || null,
      })
      .select("*")
      .single();

    if (error) throw error;

    // Create a new activity feed entry
    await supabase.from("Activity").insert({
      type: "REGISTRATION",
      title: "New Donor Registered",
      desc: `${name} (${bloodGroup}) has been registered in ${city}`,
    });

    // Create a new notification entry
    await supabase.from("Notification").insert({
      type: "REGISTRATION",
      title: `New Donor: ${name}`,
      desc: `${name} joined as a new ${bloodGroup} donor in ${city}.`,
      isRead: false,
    });

    return sendSuccess(created, "Donor registered successfully", 201);
  } catch (error) {
    return handleError(error, "POST /api/donors");
  }
}
