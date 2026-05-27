import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  userId: z
    .number()
    .int({ message: "UserId must be an integer" })
    .positive({ message: "UserId must be greater than 0" }),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
