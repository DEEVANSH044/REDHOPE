import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Email must be a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }).optional(),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Email must be a valid email address" })
      .optional(),
  })
  .refine((data) => !!data.name || !!data.email, {
    message: "At least one field (name or email) is required",
    path: ["name"],
  });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
