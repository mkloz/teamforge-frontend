import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Don't forget your email.")
    .email("Check that email again—it looks a bit off."),
  password: z.string().min(6, "Make it at least 6 characters for safety."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(1, "What's your name?"),
  email: z
    .string()
    .min(1, "Don't forget your email.")
    .email("Check that email again—it looks a bit off."),
  password: z.string().min(6, "Make it at least 6 characters for safety."),
  otp: z.string().min(6, "We need all 6 digits to verify."),
  age: z
    .number({ error: "How old are you?" })
    .min(16, "Enter your age (we support 16 to 99).")
    .max(99, "Enter your age (we support 16 to 99)."),
  city: z.string().min(1, "Where are you based?"),
  gender: z.string().min(1, "Tell us your gender."),
});

export type RegisterValues = z.infer<typeof registerSchema>;
