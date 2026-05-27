import { ERROR_CODES } from "@/lib/errorCodes";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { loginSchema } from "@/lib/schemas/authSchema";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { handleError } from "@/lib/errorHandler";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = loginSchema.safeParse(body);

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

    const secret = process.env.JWT_SECRET || "some_super_secret_key";

    // Fixed Admin credentials check
    if (email.toLowerCase() === "deevanshrana011@gmail.com") {
      if (password === "0987654321") {
        const token = jwt.sign(
          { id: 9999, email: "deevanshrana011@gmail.com", role: "admin", name: "Deevansh Rana" },
          secret,
          { expiresIn: "1h" }
        );

        const response = sendSuccess({ token });

        response.cookies.set("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: 3600,
        });

        return response;
      } else {
        return sendError("Invalid password", "INVALID_PASSWORD", 401);
      }
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, password, name, role")
      .eq("email", email)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return sendError("User not found", ERROR_CODES.NOT_FOUND, 404);
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return sendError("Invalid password", "INVALID_PASSWORD", 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || "user", name: user.name || "User" },
      secret,
      { expiresIn: "1h" }
    );

    const response = sendSuccess({ token });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600,
    });

    return response;
  } catch (error) {
    return handleError(error, "POST /api/auth/login");
  }
}
