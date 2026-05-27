import { supabase } from "@/lib/supabase";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { getUserIdFromRequest, getUserRoleFromRequest } from "@/lib/authHelper";

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    const { data: inventory, error } = await supabase
      .from("BloodInventory")
      .select("*")
      .order("bloodGroup");

    if (error) throw error;

    return sendSuccess(inventory);
  } catch (error) {
    return handleError(error, "GET /api/inventory");
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    const userRole = getUserRoleFromRequest(req);
    if (!userId) {
      return sendError("Unauthorized", "UNAUTHORIZED", 401);
    }

    // Role-based restrict: only admin can modify blood stocks
    if (userRole !== "admin") {
      return sendError("Only administrators can adjust inventory levels", "FORBIDDEN", 403);
    }

    const body = await req.json();
    const { bloodGroup, action, value } = body as {
      bloodGroup?: string;
      action?: "increment" | "decrement" | "set";
      value?: number;
    };

    if (!bloodGroup || !action) {
      return sendError(
        "Blood group and action ('increment' | 'decrement' | 'set') are required",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    // Find the current inventory record
    const { data: records, error: fetchError } = await supabase
      .from("BloodInventory")
      .select("*")
      .eq("bloodGroup", bloodGroup);

    if (fetchError) throw fetchError;

    const record = records?.[0];
    if (!record) {
      return sendError(`Blood group ${bloodGroup} not found in inventory`, ERROR_CODES.NOT_FOUND, 404);
    }

    let newStock = record.stock;
    if (action === "increment") {
      newStock = Math.min(record.stock + (value ?? 1), record.total);
    } else if (action === "decrement") {
      newStock = Math.max(record.stock - (value ?? 1), 0);
    } else if (action === "set") {
      if (typeof value !== "number" || value < 0) {
        return sendError("Value must be a non-negative number", ERROR_CODES.VALIDATION_ERROR, 400);
      }
      newStock = Math.min(value, record.total);
    }

    // Update DB
    const { data: updated, error: updateError } = await supabase
      .from("BloodInventory")
      .update({ stock: newStock })
      .eq("bloodGroup", bloodGroup)
      .select("*");

    if (updateError) throw updateError;

    // Check if new stock is critical (e.g. less than 15% of total capacity)
    const isCritical = newStock / record.total <= 0.15;
    if (isCritical) {
      // Fire an emergency alert notification
      await supabase.from("Notification").insert({
        type: "LOW_STOCK",
        title: "Critical Stock Warning",
        desc: `Blood group ${bloodGroup} stock level is critical (${newStock}/${record.total} units).`,
        isRead: false,
      });
    }

    // Add activity log
    await supabase.from("Activity").insert({
      type: "DONATION",
      title: "Inventory Level Adjusted",
      desc: `Blood stock for ${bloodGroup} adjusted to ${newStock} units`,
    });

    return sendSuccess(updated?.[0] || updated, "Inventory level updated successfully");
  } catch (error) {
    return handleError(error, "POST /api/inventory");
  }
}
