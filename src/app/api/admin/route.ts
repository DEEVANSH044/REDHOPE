import { supabase } from "@/lib/supabase";
import { sendSuccess } from "@/lib/responseHandler";
import { headers } from "next/headers";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    // Authorization handled by middleware (admin-only access)
    const requestHeaders = await headers();
    const userEmail = requestHeaders.get("x-user-email");
    const userRole = requestHeaders.get("x-user-role");

    // Get admin dashboard data
    const { count: totalUsers, error: countError } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    const { count: adminUsers, error: adminCountError } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    if (adminCountError) throw adminCountError;

    const validTotal = totalUsers ?? 0;
    const validAdmin = adminUsers ?? 0;

    return sendSuccess({
      message: "Admin dashboard data",
      currentUser: {
        email: userEmail,
        role: userRole,
      },
      stats: {
        totalUsers: validTotal,
        adminUsers: validAdmin,
        regularUsers: validTotal - validAdmin,
      },
    });
  } catch (error) {
    return handleError(error, "GET /api/admin");
  }
}
