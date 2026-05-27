import { supabase } from "@/lib/supabase";
import { ERROR_CODES } from "@/lib/errorCodes";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { createProfileSchema } from "@/lib/schemas/profileSchema";
import { ZodError } from "zod";
import { handleError } from "@/lib/errorHandler";

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

    const parsed = createProfileSchema.safeParse({
      userId,
      bio:
        typeof (body as { bio?: unknown }).bio === "string"
          ? (body as { bio: string }).bio.trim()
          : "",
    });

    if (!parsed.success) {
      return sendError(
        "Invalid input",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        parsed.error.flatten()
      );
    }

    const bio = parsed.data.bio;

    const { data: user, error: findUserError } = await supabase
      .from("User")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (findUserError) throw findUserError;
    if (!user)
      return sendError("Resource not found", ERROR_CODES.NOT_FOUND, 404);

    const { data: existingProfile, error: findProfileError } = await supabase
      .from("Profile")
      .select("id")
      .eq("userId", userId)
      .maybeSingle();

    if (findProfileError) throw findProfileError;

    if (existingProfile) {
      return sendError("Invalid input", ERROR_CODES.VALIDATION_ERROR, 400);
    }

    const { data: created, error } = await supabase
      .from("Profile")
      .insert({ userId, bio })
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
    return handleError(err, "POST /api/profile");
  }
}
