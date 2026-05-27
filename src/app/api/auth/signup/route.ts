import bcrypt from "bcryptjs";

import { supabase } from "@/lib/supabase";
import { ERROR_CODES } from "@/lib/errorCodes";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { signupSchema } from "@/lib/schemas/authSchema";
import { handleError } from "@/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return sendError(
        "Invalid input",
        ERROR_CODES.VALIDATION_ERROR,
        400,
        parsed.error.flatten()
      );
    }

    const email = parsed.data.email.trim();
    const password = parsed.data.password;

    if (email.toLowerCase() === "deevanshrana011@gmail.com") {
      return sendError(
        "This email is reserved for system administrator.",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    const { data: existing, error: findError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (findError) throw findError;

    if (existing) {
      return sendError(
        "User already exists",
        ERROR_CODES.VALIDATION_ERROR,
        400
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: created, error } = await supabase
      .from("users")
      .insert({
        name: parsed.data.name,
        email,
        password: hashedPassword,
        role: parsed.data.role || "user",
      })
      .select("id,email,role")
      .single();

    if (error) throw error;

    return sendSuccess(created, "Success", 201);
  } catch (error) {
    return handleError(error, "POST /api/auth/signup");
  }
}
