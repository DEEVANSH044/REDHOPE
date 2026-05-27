import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleError } from "@/lib/errorHandler";

function parseId(value: string) {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) {
      return sendError("Invalid user ID", "VALIDATION_ERROR", 400);
    }

    const body = await req.json();
    const { role, bloodGroup } = body as { role?: string; bloodGroup?: string };

    // Fetch user first to log its details
    const { data: existingUser } = await supabase
      .from("User")
      .select("name, email, role")
      .eq("id", id)
      .maybeSingle();

    if (!existingUser) {
      return sendError("User not found", "NOT_FOUND", 404);
    }

    const updateFields: any = {};
    if (role !== undefined) updateFields.role = role;
    if (bloodGroup !== undefined) updateFields.bloodGroup = bloodGroup;

    const { data: updated, error } = await supabase
      .from("User")
      .update(updateFields)
      .eq("id", id)
      .select("id, name, email, phone, bloodGroup, role")
      .single();

    if (error) throw error;

    // Log the activity
    await supabase.from("Activity").insert({
      type: "REGISTRATION",
      title: "User Profile Updated by Admin",
      desc: `User ${existingUser.name} (${existingUser.email}) profile was updated by the system administrator.`,
    });

    return sendSuccess(updated, "User updated successfully");
  } catch (error) {
    return handleError(error, "PATCH /api/admin/users/[id]");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id) {
      return sendError("Invalid user ID", "VALIDATION_ERROR", 400);
    }

    // Fetch user details first
    const { data: existingUser } = await supabase
      .from("User")
      .select("name, email")
      .eq("id", id)
      .maybeSingle();

    if (!existingUser) {
      return sendError("User not found", "NOT_FOUND", 404);
    }

    const { error } = await supabase
      .from("User")
      .delete()
      .eq("id", id);

    if (error) throw error;

    // Log the activity
    await supabase.from("Activity").insert({
      type: "REGISTRATION",
      title: "User Account Deleted by Admin",
      desc: `User account for ${existingUser.name} (${existingUser.email}) was deleted by the system administrator.`,
    });

    return sendSuccess(null, "User deleted successfully");
  } catch (error) {
    return handleError(error, "DELETE /api/admin/users/[id]");
  }
}
