import { NextResponse } from "next/server";

import type { ErrorCode } from "@/lib/errorCodes";

export function sendSuccess<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export function sendError(
  message = "Something went wrong",
  code: ErrorCode | string = "INTERNAL_ERROR",
  status = 500,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      message,
      error: {
        code,
        ...(typeof details === "undefined" ? {} : { details }),
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}
