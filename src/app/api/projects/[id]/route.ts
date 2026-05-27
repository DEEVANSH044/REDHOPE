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
    const id = parseId(rawId);
    if (!id)
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });

    const { data: project, error } = await supabase
      .from("Project")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;

    if (!project)
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );

    return NextResponse.json(project);
  } catch (error) {
    return handleError(error, "GET /api/projects/[id]");
  }
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseId(rawId);
    if (!id)
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });

    const { data: existing, error: findError } = await supabase
      .from("Project")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (findError) throw findError;

    if (!existing)
      return NextResponse.json(
        { message: "Resource not found" },
        { status: 404 }
      );

    const { error: deleteError } = await supabase
      .from("Project")
      .delete()
      .eq("id", id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    return handleError(error, "DELETE /api/projects/[id]");
  }
}
