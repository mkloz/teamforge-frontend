import { z } from "zod";

import {
  DateOfBirthValidator,
  getAgeFromDateOfBirth,
} from "@/shared/validators/date-of-birth.validator";
import { PasswordValidator } from "@/shared/validators/password.validator";

const REGISTER_MINIMUM_AGE = 16;
const REGISTER_MAXIMUM_AGE = 99;

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
});

export const authResultSchema = authTokensSchema.extend({
  isNewUser: z.boolean(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Don't forget your email.")
    .email("Check that email again. It looks a little off."),
  password: z.string().min(6, "Make it at least 6 characters for safety."),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "What's your name?"),
  email: z
    .string()
    .min(1, "Don't forget your email.")
    .email("Check that email again. It looks a little off."),
  password: PasswordValidator,
  otp: z.string().min(6, "We need all 6 digits to verify."),
  dateOfBirth: DateOfBirthValidator.refine((value) => {
    const age = getAgeFromDateOfBirth(value);
    return (
      value.length === 0 ||
      (age !== null &&
        age >= REGISTER_MINIMUM_AGE &&
        age <= REGISTER_MAXIMUM_AGE)
    );
  }, "Enter a date of birth for someone aged 16 to 99."),
  city: z.string().min(1, "Where are you based?"),
  gender: z.string().min(1, "Tell us your gender."),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Don't forget your email.")
    .email("Check that email again. It looks a little off."),
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
