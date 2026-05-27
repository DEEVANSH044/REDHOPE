import { supabase } from "@/lib/supabase";
import { sendSuccess } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const { data: requests, error } = await supabase
      .from("BloodRequest")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return sendSuccess(requests);
  } catch (error) {
    return handleError(error, "GET /api/admin/requests");
  }
}
