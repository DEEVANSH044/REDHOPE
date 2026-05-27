import { supabase } from "@/lib/supabase";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";
import { getUserIdFromRequest } from "@/lib/authHelper";

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { data: activities, error } = await supabase
      .from("Activity")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return sendSuccess(activities || []);
  } catch (error) {
    return handleError(error, "GET /api/activities");
  }
}
