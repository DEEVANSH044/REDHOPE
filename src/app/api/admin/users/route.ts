import { supabase } from "@/lib/supabase";
import { sendSuccess } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const { data: users, error } = await supabase
      .from("User")
      .select("id, name, email, phone, bloodGroup, role, createdAt")
      .order("id", { ascending: true });

    if (error) throw error;

    return sendSuccess(users);
  } catch (error) {
    return handleError(error, "GET /api/admin/users");
  }
}
