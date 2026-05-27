import { NextResponse } from "next/server";
import { logger } from "./logger";
import { ERROR_CODES } from "./errorCodes";

interface ErrorContext {
  route?: string;
  method?: string;
  [key: string]: unknown;
}

export function handleError(
  error: unknown,
  context: string | ErrorContext = "Unknown"
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === "development";

  // Extract error details
  let errorMessage = "An unexpected error occurred";
  let errorName = "UnknownError";
  let errorStack = undefined;
  let rawError = error;

  if (error instanceof Error) {
    errorMessage = error.message;
    errorName = error.name;
    errorStack = error.stack;
  } else if (typeof error === "object" && error !== null) {
    // Handle Supabase/Postgrest errors or other object errors
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === "string") {
      errorMessage = errObj.message;
    }
    if (typeof errObj.code === "string") {
      errorName = errObj.code; // Use error code as name if available (common in DB errors)
    }
    if (typeof errObj.details === "string") {
      errorMessage += ` (${errObj.details})`;
    }
    // Try to stringify the whole object for logging
    try {
      rawError = JSON.stringify(error);
    } catch {
      rawError = String(error);
    }
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // Prepare context for logging
  const logContext: Record<string, unknown> =
    typeof context === "string" ? { route: context } : { ...context };

  // Log full error details internally
  logger.error(errorMessage, {
    ...logContext,
    errorName,
    stack: errorStack,
    error: rawError,
  });

  // Return response based on environment
  if (isDevelopment) {
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: {
          code: ERROR_CODES.INTERNAL_ERROR,
          details: {
            name: errorName,
            stack: errorStack,
          },
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  // Production: return generic user-safe message
  return NextResponse.json(
    {
      success: false,
      message: "An internal server error occurred. Please try again later.",
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}
