import { supabase } from "@/lib/supabase";
import { sendSuccess } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const { data: activities, error } = await supabase
      .from("Activity")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return sendSuccess(activities);
  } catch (error) {
    return handleError(error, "GET /api/admin/activities");
  }
}
