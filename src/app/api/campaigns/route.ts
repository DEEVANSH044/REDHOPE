import { supabase } from "@/lib/supabase";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const { data: campaigns, error } = await supabase
      .from("Campaign")
      .select("id, title, date, location, organizer, createdAt")
      .order("date", { ascending: true });

    if (error) throw error;

    return sendSuccess(campaigns);
  } catch (error) {
    return handleError(error, "GET /api/campaigns");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, date, location, organizer, latitude, longitude } = body as {
      title?: string;
      date?: string;
      location?: string;
      organizer?: string;
      latitude?: number;
      longitude?: number;
    };

    if (!title || !date || !location) {
      return sendError("Title, date, and location are required", "VALIDATION_ERROR", 400);
    }

    const { data: created, error } = await supabase
      .from("Campaign")
      .insert({
        title,
        date,
        location,
        latitude: latitude || null,
        longitude: longitude || null,
        organizer: organizer || "redhope NGO Partner",
      })
      .select("*")
      .single();

    if (error) throw error;

    // Log this system activity
    await supabase.from("Activity").insert({
      type: "REGISTRATION",
      title: "New Campaign Launched",
      desc: `${title} campaign registered by ${organizer || "redhope NGO Partners"}`,
    });

    return sendSuccess(created, "Campaign created successfully", 201);
  } catch (error) {
    return handleError(error, "POST /api/campaigns");
  }
}
