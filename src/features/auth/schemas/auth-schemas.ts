import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Full name is required."),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  otp: z.string().min(6, "Enter a complete 6-digit code."),
  age: z
    .number({ error: "Age is required." })
    .min(16, "Enter a valid age (16–99).")
    .max(99, "Enter a valid age (16–99)."),
  city: z.string().min(1, "City is required."),
  gender: z.string().min(1, "Please select a gender."),
});

export type RegisterValues = z.infer<typeof registerSchema>;
