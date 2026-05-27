# redhope 🩸  
*Real-Time Blood Donation & Inventory Management Platform*

redhope is a full-stack web application built to solve blood shortages caused by *poor coordination and lack of real-time data*, not the lack of donors.

---

## 🚨 Problem
- Outdated blood inventory systems  
- No real-time visibility during emergencies  
- Poor coordination between donors, hospitals, and NGOs  

---

## 💡 Solution
redhope connects *donors, hospitals, and NGOs* on a single platform to provide:
- 🧾 Live blood inventory tracking  
- 🚑 Emergency blood requests  
- 📍 Location-based donor discovery  
- 🔐 Secure role-based access  

---

## 🧠 Tech Stack
- ⚛️ **Next.js** – Frontend + Backend (API Routes)  
- 🗄️ **PostgreSQL** – Relational database  
- 🔗 **Prisma** – Type-safe ORM  
- 🐳 **Docker** – Containerization  
- ☁️ **AWS / Azure** – Cloud deployment  

---

## 🎯 MVP Features
- 👤 Role-based authentication  
- 🩸 Blood inventory dashboard  
- 🚨 Emergency request system  
- 📍 Nearby donor discovery  
- 🛠️ Admin / NGO panel  

---

## 👥 Team
- **Aryaman** – Backend (APIs, DB, Prisma)  
- **Manvi** – Frontend (UI, Dashboards)  
- **Arnav** – DevOps & Testing (Docker, CI/CD)  

---

## 🎓 Context
Built as part of **Kalvium – Simulated Work (AP)**  
Sprint #1: *Full-Stack Development with Next.js & Cloud*

---

## 🌱 Vision
To ensure **no life is lost due to missing or delayed blood availability data**.

---

🚧 *Project under active development*

---

## Input Validation with Zod

Input validation ensures our API routes reject bad data early, preventing runtime errors and keeping database writes clean and predictable.

### Where schemas live
- `src/lib/schemas/` contains shared Zod schemas used by API routes (POST/PUT).

### Example success response (global handler)

```json
{
  "success": true,
  "message": "Success",
  "data": { "id": 1, "name": "Alice", "email": "alice@example.com" },
  "timestamp": "2026-01-27T10:00:00.000Z"
}
```

### Example validation error response (400)

```json
{
  "success": false,
  "message": "Invalid input",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "formErrors": [],
      "fieldErrors": {
        "email": ["Email must be a valid email address"]
      }
    }
  },
  "timestamp": "2026-01-27T10:00:00.000Z"
}
```

### Maintainability note
Keeping schemas centralized makes validation consistent across routes and easier to update as a team without duplicating checks in every API file.

---

## Authentication APIs (Signup / Login)

### Signup flow (`POST /api/auth/signup`)
- Validates `name`, `email`, `password` using Zod
- Checks for duplicate email
- Hashes password using bcrypt (salt rounds = 10)
- Stores the hashed password in the database
- Returns the created user **without** the password

Sample request:

```json
{ "name": "Alice", "email": "alice@example.com", "password": "password123" }
```

Sample success response:

```json
{
  "success": true,
  "message": "Success",
  "data": { "id": 1, "name": "Alice", "email": "alice@example.com" },
  "timestamp": "2026-01-27T10:00:00.000Z"
}
```

### Login flow (`POST /api/auth/login`)
- Validates `email` and `password` using Zod
- Checks if the user exists
- Compares password with bcrypt
- On success, generates a JWT token (payload: user `id`, `email`, and `role`)
- Token expiry is **1 hour**

Sample request:

```json
{ "email": "alice@example.com", "password": "password123" }
```

Sample success response:

```json
{
  "success": true,
  "message": "Success",
  "data": { "token": "<jwt-token>" },
  "timestamp": "2026-01-27T10:00:00.000Z"
}
```

### JWT expiry (1 hour)
The token is signed with `process.env.JWT_SECRET` and expires in **1 hour**. After expiry, the client must log in again to get a new token.

### Token storage (cookies vs localStorage)
- Cookies (HttpOnly) are safer against XSS and are commonly used for auth tokens.
- localStorage is simpler for demos but can be accessed by injected scripts if XSS exists.

### Password hashing
Passwords are never stored in plain text. We hash passwords using bcrypt so even if the database is exposed, raw passwords are not directly readable.

### Maintainability reflection
Keeping validation + auth logic consistent (Zod + global response handler + clear status codes) makes it easier for a team to extend endpoints without breaking API behavior.

## Deployment Verification & Rollback

- Health check endpoint: /api/health
- CI verifies deployment using curl
- Smoke tests using Jest
- Automatic rollback on failure

Metrics Impact:
- MTTD reduced by immediate health checks
- MTTR reduced by rollback automation
- CFR reduced by blocking bad deployments

---

## Authorization Middleware (RBAC)

The authorization middleware enforces role-based access control (RBAC) for protected API routes, ensuring that only authenticated users with appropriate permissions can access sensitive endpoints.

### Flow explanation: request → middleware → route

1. **Request arrives**: Client sends a request to `/api/users` or `/api/admin` with an `Authorization` header containing a Bearer token.
2. **Middleware intercepts**: The Next.js middleware (`middleware.ts`) intercepts the request before it reaches the route handler.
3. **Token verification**: Middleware extracts the token from the `Authorization` header and verifies it using `JWT_SECRET`.
4. **Role-based authorization**: Based on the decoded token's role, middleware either:
   - Allows the request to proceed (attaching user info to headers)
   - Returns a 401 (missing token) or 403 (invalid token / insufficient permissions)
5. **Route handler executes**: If authorized, the request reaches the route handler with user information available via headers (`x-user-email`, `x-user-role`).

### JWT verification explanation

The middleware uses `jsonwebtoken` to verify tokens:
- **Token extraction**: Reads `Authorization: Bearer <token>` header
- **Secret verification**: Uses `process.env.JWT_SECRET` to verify token signature
- **Expiry check**: Automatically rejects expired tokens (JWT library handles this)
- **Payload extraction**: Decodes user `id`, `email`, and `role` from the token

### Role-based access rules

| Route | Required Role | Description |
|-------|--------------|-------------|
| `/api/users` | Any authenticated user (`user` or `admin`) | Accessible to all logged-in users |
| `/api/admin` | `admin` only | Restricted to users with admin role |

**Access denied scenarios:**
- Missing token → `401 UNAUTHORIZED`
- Invalid/expired token → `403 FORBIDDEN`
- Non-admin accessing `/api/admin` → `403 FORBIDDEN`

### Least privilege principle

The middleware implements the principle of least privilege:
- Users only receive access to routes appropriate for their role
- Default role is `user` (assigned during signup)
- Admin routes require explicit `admin` role assignment
- Each route handler receives only the minimum user information needed (email, role)

### How new roles (editor/moderator) can be added

To add new roles like `editor` or `moderator`:

1. **Update Prisma schema** (if needed): Add role validation or enum if you want to restrict valid roles
2. **Update middleware**: Add role checks for new protected routes:
   ```typescript
   if (pathname.startsWith("/api/editor")) {
     if (decoded.role !== "editor" && decoded.role !== "admin") {
       return NextResponse.json(/* 403 */);
     }
   }
   ```
3. **Update matcher config**: Add new routes to the middleware matcher:
   ```typescript
   export const config = {
     matcher: [
       "/api/users/:path*",
       "/api/admin/:path*",
       "/api/editor/:path*", // Add new route
     ],
   };
   ```
4. **Create route handlers**: Implement routes in `src/app/api/editor/route.ts`

### Example allowed vs denied requests

**✅ Allowed Request (User accessing `/api/users`):**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <valid-user-token>"
```
Response: `200 OK` with user list

**✅ Allowed Request (Admin accessing `/api/admin`):**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <valid-admin-token>"
```
Response: `200 OK` with admin dashboard data

**❌ Denied Request (Missing token):**
```bash
curl -X GET http://localhost:3000/api/users
```
Response: `401 UNAUTHORIZED` - "Missing token"

**❌ Denied Request (User accessing admin route):**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer <valid-user-token>"
```
Response: `403 FORBIDDEN` - "Access denied"

**❌ Denied Request (Expired token):**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <expired-token>"
```
Response: `403 FORBIDDEN` - "Invalid or expired token"

---

## Error Handling Middleware

Centralized error handling ensures consistent error responses across all API routes, improves debugging capabilities through structured logging, and protects sensitive information in production environments.

### Why centralized error handling is important

- **Consistency**: All errors follow the same response format, making API consumption predictable
- **Security**: Prevents accidental exposure of stack traces, database errors, or internal implementation details to clients
- **Debugging**: Structured logs with context help developers quickly identify and fix issues
- **Maintainability**: Single source of truth for error handling logic reduces code duplication

### Difference between dev vs prod behavior

**Development (`NODE_ENV=development`):**
- Returns detailed error messages and stack traces
- Helps developers debug issues quickly
- Example response:
```json
{
  "success": false,
  "message": "Database connection failed",
  "error": {
    "code": "INTERNAL_ERROR",
    "details": {
      "name": "Error",
      "stack": "Error: Database connection failed\n    at ..."
    }
  },
  "timestamp": "2026-02-02T10:00:00.000Z"
}
```

**Production (`NODE_ENV=production`):**
- Returns generic user-safe messages
- No stack traces or internal details exposed
- Example response:
```json
{
  "success": false,
  "message": "An internal server error occurred. Please try again later.",
  "error": {
    "code": "INTERNAL_ERROR"
  },
  "timestamp": "2026-02-02T10:00:00.000Z"
}
```

### How structured logs help debugging

Structured JSON logs include:
- **Level**: `info` or `error`
- **Message**: Human-readable error description
- **Meta**: Additional context (route, method, error name, stack trace)
- **Timestamp**: ISO 8601 formatted timestamp

Example log entry:
```json
{
  "level": "error",
  "message": "Database connection failed",
  "route": "GET /api/users",
  "errorName": "PrismaClientInitializationError",
  "stack": "Error: ...",
  "timestamp": "2026-02-02T10:00:00.000Z"
}
```

These logs can be easily parsed by log aggregation tools (e.g., ELK stack, Datadog, CloudWatch) for monitoring and alerting.

### Implementation

**Logger utility (`src/lib/logger.ts`):**
```typescript
export const logger = {
  info(message: string, meta?: Record<string, unknown>): void {
    const logEntry = formatLog("info", message, meta);
    console.log(JSON.stringify(logEntry));
  },

  error(message: string, meta?: Record<string, unknown>): void {
    const logEntry = formatLog("error", message, meta);
    console.error(JSON.stringify(logEntry));
  },
};
```

**Error handler (`src/lib/errorHandler.ts`):**
```typescript
export function handleError(
  error: unknown,
  context: string | ErrorContext = "Unknown"
): NextResponse {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Log full error details internally
  logger.error(errorMessage, { route: context, stack: errorStack });
  
  // Return environment-appropriate response
  if (isDevelopment) {
    return NextResponse.json({ /* detailed error */ }, { status: 500 });
  }
  return NextResponse.json({ /* generic error */ }, { status: 500 });
}
```

**Usage in API routes:**
```typescript
export async function GET() {
  try {
    // Route logic
    return sendSuccess(data);
  } catch (error) {
    return handleError(error, "GET /api/users");
  }
}
```

### Best practices

- Always use `handleError()` in catch blocks for unexpected errors
- Validation errors (ZodError) should still use `sendError()` with appropriate status codes
- Provide meaningful context strings (e.g., "GET /api/users") for better log traceability
- Never expose database errors, API keys, or internal paths in production responses
