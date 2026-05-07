import { z } from "zod";

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 32;

export const PasswordValidator = z
  .string()
  .min(PASSWORD_MIN_LENGTH, "Must be at least 8 characters")
  .max(PASSWORD_MAX_LENGTH, "Must be at most 32 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character");
