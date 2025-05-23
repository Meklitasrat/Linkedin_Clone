import { z } from "zod";

export const signupSchema = z.object({
name: z.string(),
username: z.string(),
email: z.string(),
password: z.string().min(8, {message: "Password must be at least 8 characters"})
})