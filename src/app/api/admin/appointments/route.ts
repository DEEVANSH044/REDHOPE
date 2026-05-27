import { supabase } from "@/lib/supabase";
import { sendSuccess } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const { data: appointments, error } = await supabase
      .from("Appointment")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return sendSuccess(appointments);
  } catch (error) {
    return handleError(error, "GET /api/admin/appointments");
  }
}
