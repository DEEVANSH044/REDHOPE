import { NextRequest, NextResponse } from "next/server";

import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/errorHandler";

function parseId(value: string) {
  const id = Number.parseInt(value, 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const userId = parseId(rawId);
    if (!userId)
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });

    const { data: profile, error } = await supabase
      .from("Profile")
      .select("*")
      .eq("userId", userId)
      .maybeSingle();

    if (error) throw error;

    if (!profile)
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );

    return NextResponse.json(profile);
  } catch (error) {
    return handleError(error, "GET /api/profile/[id]");
  }
}
