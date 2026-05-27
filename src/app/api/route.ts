import { NextResponse } from "next/server";
import { handleError } from "@/lib/errorHandler";

export async function GET() {
  try {
    const dbUrl = process.env.DATABASE_URL;

    if (!dbUrl) {
      throw new Error("DATABASE_URL is not defined");
    }

    return NextResponse.json({ message: "Connected securely" });
  } catch (error) {
    return handleError(error, "GET /api");
  }
}
