import jwt from "jsonwebtoken";

/**
 * Foolproof helper to resolve the authenticated User ID from a Next.js Request.
 * 
 * Implements a fail-safe fallback:
 * 1. Checks if middleware already verified the token and injected "x-user-id" header.
 * 2. If missing (due to middleware bypass or header stripping), directly parses the 
 *    JWT token from the Authorization header or Cookie header, verifies it, and returns the ID.
 */
export function getUserIdFromRequest(req: Request): number | null {
  // 1. Try injected middleware header
  const headerId = req.headers.get("x-user-id");
  if (headerId) {
    const num = Number(headerId);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }

  // 2. Direct Fallback: Parse from Authorization header or Cookie header
  try {
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    // Parse cookie token manually from request Cookie header
    const cookieHeader = req.headers.get("cookie") || "";
    let cookieToken = null;
    const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    if (match) {
      cookieToken = decodeURIComponent(match[1]);
    }

    const token = bearerToken || cookieToken;
    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET || "some_super_secret_key";
    const decoded = jwt.verify(token, secret) as { id: number; role?: string };
    
    return decoded?.id || null;
  } catch (err) {
    console.error("[AuthHelper Fallback] Failed to authenticate token directly:", err);
    return null;
  }
}

/**
 * Foolproof helper to resolve the authenticated User Role from a Next.js Request.
 */
export function getUserRoleFromRequest(req: Request): string | null {
  // 1. Try injected middleware header
  const headerRole = req.headers.get("x-user-role");
  if (headerRole) {
    return headerRole;
  }

  // 2. Direct Fallback
  try {
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;

    const cookieHeader = req.headers.get("cookie") || "";
    let cookieToken = null;
    const match = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    if (match) {
      cookieToken = decodeURIComponent(match[1]);
    }

    const token = bearerToken || cookieToken;
    if (!token) return null;

    const secret = process.env.JWT_SECRET || "some_super_secret_key";
    const decoded = jwt.verify(token, secret) as { id: number; role?: string };
    
    return decoded?.role || null;
  } catch {
    return null;
  }
}
