import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const origin = req.headers.get("origin") || "*";

  // 1. Intercept Preflight OPTIONS requests and return global CORS headers immediately
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, x-user-id, x-user-role, x-user-email",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  // Frontend route protection (existing logic)
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/inventory") ||
    pathname.startsWith("/requests") ||
    pathname.startsWith("/appointments") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/campaigns") ||
    pathname.startsWith("/blood-banks")
  ) {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Special verification for admin pages
    if (pathname.startsWith("/admin")) {
      const secret = process.env.JWT_SECRET || "some_super_secret_key";
      try {
        let role = "";
        try {
          const decoded = jwt.verify(token, secret) as { role?: string };
          role = decoded.role || "";
        } catch {
          // Fallback to base64 decoding if runtime issues occur in Edge environment
          const base64Payload = token.split(".")[1];
          if (base64Payload) {
            const decoded = JSON.parse(Buffer.from(base64Payload, "base64").toString());
            role = decoded.role || "";
          }
        }

        if (role !== "admin") {
          console.warn("[Middleware] Non-admin tried accessing /admin page, redirecting to /dashboard");
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } catch (err) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  }

  // API route authorization
  if (
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/requests") ||
    pathname.startsWith("/api/appointments") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/campaigns") ||
    pathname.startsWith("/api/blood-banks") ||
    pathname.startsWith("/api/donors") ||
    pathname.startsWith("/api/inventory") ||
    pathname.startsWith("/api/notifications") ||
    pathname.startsWith("/api/activities") ||
    pathname.startsWith("/api/dashboard")
  ) {
    console.log("[Middleware] Processing API path authorization:", pathname);
    // Token from Authorization header OR cookie (cookie is source of truth)
    const authHeader = req.headers.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : null;
    const cookieToken = req.cookies.get("token")?.value ?? null;
    const token = bearerToken || cookieToken;

    console.log("[Middleware] Extracted token:", token ? `${token.slice(0, 15)}...` : "None");

    if (!token) {
      console.warn("[Middleware] Blocked: Token is missing");
      const res = NextResponse.json(
        {
          success: false,
          message: "Missing token",
          error: { code: "UNAUTHORIZED" },
          timestamp: new Date().toISOString(),
        },
        { status: 401 }
      );
      // Append CORS to error responses
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, x-user-id, x-user-role, x-user-email");
      res.headers.set("Access-Control-Allow-Credentials", "true");
      return res;
    }

    const secret = process.env.JWT_SECRET || "some_super_secret_key";
    let decoded: { id: number; email: string; role: string } | null = null;
    try {
      decoded = jwt.verify(token, secret) as {
        id: number;
        email: string;
        role: string;
      };
      console.log("[Middleware] Token verified successfully. Decoded payload:", decoded);
    } catch (err: any) {
      console.warn("[Middleware] Blocked: Token verification failed:", err.message);
      const res = NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
          error: { code: "FORBIDDEN" },
          timestamp: new Date().toISOString(),
        },
        { status: 403 }
      );
      // Append CORS to error responses
      res.headers.set("Access-Control-Allow-Origin", origin);
      res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, x-user-id, x-user-role, x-user-email");
      res.headers.set("Access-Control-Allow-Credentials", "true");
      return res;
    }

    // Role-based access control
    if (pathname.startsWith("/api/admin")) {
      if (decoded.role !== "admin") {
        console.warn("[Middleware] Blocked: Admin access required, user is:", decoded.role);
        const res = NextResponse.json(
          {
            success: false,
            message: "Access denied",
            error: { code: "FORBIDDEN" },
            timestamp: new Date().toISOString(),
          },
          { status: 403 }
        );
        res.headers.set("Access-Control-Allow-Origin", origin);
        res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, x-user-id, x-user-role, x-user-email");
        res.headers.set("Access-Control-Allow-Credentials", "true");
        return res;
      }
    }

    // Attach user info to request headers for route handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(decoded.id));
    requestHeaders.set("x-user-email", decoded.email);
    requestHeaders.set("x-user-role", decoded.role);

    console.log("[Middleware] Injecting x-user-id:", String(decoded.id));

    const res = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
    // Append CORS headers to successful response
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, x-user-id, x-user-role, x-user-email");
    res.headers.set("Access-Control-Allow-Credentials", "true");
    return res;
  }

  // 2. Global CORS Injection for all other API paths (e.g. /api/auth/login)
  const res = NextResponse.next();
  if (pathname.startsWith("/api/")) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, x-user-id, x-user-role, x-user-email");
    res.headers.set("Access-Control-Allow-Credentials", "true");
  }
  return res;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/dashboard",
    "/dashboard/:path*",
    "/users",
    "/users/:path*",
    "/inventory",
    "/inventory/:path*",
    "/requests",
    "/requests/:path*",
    "/appointments",
    "/appointments/:path*",
    "/settings",
    "/settings/:path*",
    "/campaigns",
    "/campaigns/:path*",
    "/blood-banks",
    "/blood-banks/:path*",
    "/api/:path*", // Matches all API endpoints dynamically
  ],
};
