import { z } from "zod";

import { PasswordValidator } from "@/shared/validators/password.validator";

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
});

export type AuthTokensPayload = z.infer<typeof authTokensSchema>;

export const authResultSchema = authTokensSchema.extend({
  isNewUser: z.boolean(),
});

export type AuthResult = z.infer<typeof authResultSchema>;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Don't forget your email.")
    .email("Check that email again—it looks a bit off."),
  password: z.string().min(6, "Make it at least 6 characters for safety."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "What's your name?"),
  email: z
    .string()
    .min(1, "Don't forget your email.")
    .email("Check that email again—it looks a bit off."),
  password: PasswordValidator,
  otp: z.string().min(6, "We need all 6 digits to verify."),
  age: z
    .number({ error: "How old are you?" })
    .min(16, "Enter your age (we support 16 to 99).")
    .max(99, "Enter your age (we support 16 to 99)."),
  city: z.string().min(1, "Where are you based?"),
  gender: z.string().min(1, "Tell us your gender."),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Don't forget your email.")
    .email("Check that email again—it looks a bit off."),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: PasswordValidator,
    confirmPassword: PasswordValidator,
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Those passwords don't match yet.",
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
