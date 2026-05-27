import { supabase } from "@/lib/supabase";
import { sendSuccess } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    // 1. Total Users count
    const { count: totalUsers } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true });

    // 2. Total Donors count
    const { count: totalDonors } = await supabase
      .from("Donor")
      .select("*", { count: "exact", head: true });

    // 3. Active Pending Blood Requests count
    const { data: pendingRequests } = await supabase
      .from("BloodRequest")
      .select("*")
      .eq("status", "Pending");
    const activeRequests = pendingRequests?.length || 0;

    // 4. Scheduled Appointments count
    const { data: scheduledAppointments } = await supabase
      .from("Appointment")
      .select("*")
      .eq("status", "Scheduled");
    const activeAppointments = scheduledAppointments?.length || 0;

    // 5. Total Stock count from BloodInventory
    const { data: inventory } = await supabase.from("BloodInventory").select("*");
    const totalStock = (inventory || []).reduce((acc: number, curr: any) => acc + (curr.stock || 0), 0);

    // 6. Fulfillments count
    const { data: fulfilledRequests } = await supabase
      .from("BloodRequest")
      .select("*")
      .eq("status", "Fulfilled");
    const totalFulfilled = fulfilledRequests?.length || 0;

    // 7. Fetch recent 10 activities from Activity log
    const { data: recentActivities } = await supabase
      .from("Activity")
      .select("*")
      .order("createdAt", { ascending: false });
    
    const activities = (recentActivities || []).slice(0, 10);

    return sendSuccess({
      stats: {
        totalUsers: totalUsers || 0,
        totalDonors: totalDonors || 0,
        activeRequests,
        activeAppointments,
        totalStock,
        totalFulfilled,
      },
      recentActivities: activities,
    });
  } catch (error) {
    return handleError(error, "GET /api/admin/overview");
  }
}
