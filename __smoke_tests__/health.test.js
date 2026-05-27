/* eslint-disable @typescript-eslint/no-require-imports */
const request = require("supertest");

test("Health endpoint returns 200", async () => {
  const res = await request("http://localhost:3000").get("/api/health");

  expect(res.statusCode).toBe(200);
});
