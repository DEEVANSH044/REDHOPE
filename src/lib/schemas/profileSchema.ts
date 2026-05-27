import { z } from "zod";

export const createProfileSchema = z.object({
  userId: z
    .number()
    .int({ message: "UserId must be an integer" })
    .positive({ message: "UserId must be greater than 0" }),
  bio: z.string().min(1, { message: "Bio is required" }),
});

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
