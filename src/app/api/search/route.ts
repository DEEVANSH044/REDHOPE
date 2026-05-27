import { supabase } from "@/lib/supabase";
import { sendSuccess } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";
    const type = url.searchParams.get("type") || "all"; // 'banks', 'requests', 'campaigns', 'all'
    const bloodGroup = url.searchParams.get("bloodGroup") || "";

    const results: any = {};

    if (type === "all" || type === "banks") {
      let qb = supabase.from("BloodBank").select("*");
      // Basic mock filtering, Prisma mock doesn't support advanced ILIKE yet
      const { data: banks } = await qb;
      results.banks = (banks || []).filter((b: any) => 
        (b.name.toLowerCase().includes(query.toLowerCase()) || b.location.toLowerCase().includes(query.toLowerCase())) &&
        (bloodGroup ? b.availableGroups?.includes(bloodGroup) : true)
      );
    }

    if (type === "all" || type === "requests") {
      let qb = supabase.from("BloodRequest").select("*, user(*)");
      const { data: requests } = await qb;
      results.requests = (requests || []).filter((r: any) => 
        (r.locationName ? r.locationName.toLowerCase().includes(query.toLowerCase()) : true) &&
        (bloodGroup ? r.bloodGroup === bloodGroup : true) &&
        r.status !== "Completed" // only active requests
      );
    }

    if (type === "all" || type === "campaigns") {
      let qb = supabase.from("Campaign").select("*");
      const { data: campaigns } = await qb;
      results.campaigns = (campaigns || []).filter((c: any) => 
        (c.title.toLowerCase().includes(query.toLowerCase()) || c.location.toLowerCase().includes(query.toLowerCase()))
      );
    }

    return sendSuccess(results);
  } catch (error) {
    return handleError(error, "GET /api/search");
  }
}
