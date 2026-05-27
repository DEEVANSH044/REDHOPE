## 2.14 Prisma ORM Setup & Client Initialization

### Why Prisma
Prisma provides a type-safe ORM that simplifies database access, prevents runtime SQL errors, and improves developer productivity.

### Setup Steps
- Installed Prisma and initialized it using `npx prisma init`
- Configured PostgreSQL connection using `DATABASE_URL`
- Defined models in `schema.prisma`
- Generated Prisma Client
- Verified connection using Prisma Studio

### Verification
- Prisma schema validated successfully
- Database introspected using `prisma db pull`
- Prisma Studio confirms active DB connection

### Screenshots
![Prisma Studio](image\prsima.png)

### Reflection
Prisma ensures strong type safety, clean database access patterns, and scalability for future API development.
