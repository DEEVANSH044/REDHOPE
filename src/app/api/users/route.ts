import { supabase } from "@/lib/supabase";
import { ERROR_CODES } from "@/lib/errorCodes";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { createUserSchema } from "@/lib/schemas/userSchema";
import { ZodError } from "zod";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    // Authorization handled by middleware
    const { data: users, error } = await supabase
      .from("User")
      .select("id, name, email")
      .order("id", { ascending: true });

    if (error) throw error;

    return sendSuccess(users);
  } catch (error) {
    return handleError(error, "GET /api/users");
  }
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return sendError(
        "Invalid input",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        parsed.error.flatten()
      );
    }

    const name = parsed.data.name.trim();
    const email = parsed.data.email.trim();
    const password = parsed.data.password;

    if (!name || !email || !password) {
      return sendError(
        "Missing required fields",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    const { data: created, error } = await supabase
      .from("User")
      .insert({ name, email, password })
      .select("id, name, email")
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
    return handleError(err, "POST /api/users");
  }
}
