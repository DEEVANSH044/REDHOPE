import { supabase } from "@/lib/supabase";
import { sendSuccess } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const { data: bloodBanks, error } = await supabase
      .from("BloodBank")
      .select("id, name, location, contact, availableGroups")
      .order("name", { ascending: true });

    if (error) throw error;

    return sendSuccess(bloodBanks);
  } catch (error) {
    return handleError(error, "GET /api/blood-banks");
  }
}
