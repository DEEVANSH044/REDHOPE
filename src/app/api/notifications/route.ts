import { supabase } from "@/lib/supabase";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { getUserIdFromRequest } from "@/lib/authHelper";

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { data: notifications, error } = await supabase
      .from("Notification")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;

    return sendSuccess(notifications || []);
  } catch (error) {
    return handleError(error, "GET /api/notifications");
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const { action, notificationId, type, title, desc } = body as {
      action?: "read" | "read_all" | "create";
      notificationId?: number;
      type?: string;
      title?: string;
      desc?: string;
    };

    if (!action) {
      return sendError("Action is required", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    if (action === "create") {
      if (!title || !desc || !type) {
        return sendError("Type, Title, and Description are required", ERROR_CODES.VALIDATION_ERROR, 400);
      }

      // Create new notification
      const { data, error } = await supabase
        .from("Notification")
        .insert({
          type,
          title,
          desc,
          isRead: false,
        })
        .select("*")
        .single();

      if (error) throw error;

      // Log a custom emergency activity if the type is EMERGENCY
      await supabase.from("Activity").insert({
        type: type === "EMERGENCY" ? "EMERGENCY" : "REQUEST",
        title: `Broadcast Alert: ${title}`,
        desc: desc,
      });

      return sendSuccess(data, "Notification broadcasted successfully", 201);
    }

    if (action === "read_all") {
      const { data, error } = await supabase
        .from("Notification")
        .update({ isRead: true })
        .eq("isRead", false);

      if (error) throw error;
      return sendSuccess(data, "All notifications marked as read");
    }

    if (action === "read") {
      if (!notificationId) {
        return sendError("notificationId is required for read action", ERROR_CODES.VALIDATION_ERROR, 400);
      }

      const { data, error } = await supabase
        .from("Notification")
        .update({ isRead: true })
        .eq("id", notificationId);

      if (error) throw error;
      return sendSuccess(data, "Notification marked as read");
    }

    return sendError("Invalid action type", ERROR_CODES.VALIDATION_ERROR, 400);
  } catch (error) {
    return handleError(error, "POST /api/notifications");
  }
}
