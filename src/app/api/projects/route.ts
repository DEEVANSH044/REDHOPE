import { supabase } from "@/lib/supabase";
import { ERROR_CODES } from "@/lib/errorCodes";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { createProjectSchema } from "@/lib/schemas/projectSchema";
import { ZodError } from "zod";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const { data: projects, error } = await supabase
      .from("Project")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    return sendSuccess(projects);
  } catch (error) {
    return handleError(error, "GET /api/projects");
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    const userIdRaw = (body as { userId?: unknown }).userId;
    const userId =
      typeof userIdRaw === "number"
        ? userIdRaw
        : typeof userIdRaw === "string"
          ? Number.parseInt(userIdRaw, 10)
          : NaN;

    const parsed = createProjectSchema.safeParse({
      title:
        typeof (body as { title?: unknown }).title === "string"
          ? (body as { title: string }).title.trim()
          : "",
      userId,
    });

    if (!parsed.success) {
      return sendError(
        "Invalid input",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        parsed.error.flatten()
      );
    }

    const title = parsed.data.title;

    const { data: user, error: findError } = await supabase
      .from("User")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (findError) throw findError;
    if (!user)
      return sendError("Resource not found", ERROR_CODES.NOT_FOUND, 404);

    const { data: created, error } = await supabase
      .from("Project")
      .insert({ title, userId })
      .select("*")
      .single();

    if (error) throw error;

    return sendSuccess(created, "Success", 201);
  } catch (err) {
    if (err instanceof ZodError) {
      return sendError(
        "Invalid input",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        err.flatten()
      );
    }
    return handleError(err, "POST /api/projects");
  }
}
