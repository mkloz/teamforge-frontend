import type {
  LoginValues,
  RegisterValues,
} from "@/features/auth/schemas/auth-schemas";

const LOGIN_FIELD_MIN_LENGTH = 3;
const REGISTER_REQUIRED_FIELD_COUNT = 7;

export function calculateLoginProgress(values: Partial<LoginValues>) {
  let progress = 0;

  if (values.email && values.email.length > LOGIN_FIELD_MIN_LENGTH) {
    progress += 0.5;
  }

  if (values.password && values.password.length > LOGIN_FIELD_MIN_LENGTH) {
    progress += 0.5;
  }

  return progress;
}

export function calculateRegisterProgress(values: Partial<RegisterValues>) {
  let filled = 0;

  if (values.name && values.name.length > 2) {
    filled++;
  }

  if (values.email && values.email.length > 4) {
    filled++;
  }

  if (values.password && values.password.length > 5) {
    filled++;
  }

  if (values.otp && values.otp.length === 6) {
    filled++;
  }

  if (
    values.age !== undefined &&
    values.age !== null &&
    String(values.age) !== ""
  ) {
    filled++;
  }

  if (values.city && values.city.length > 2) {
    filled++;
  }

  if (values.gender && values.gender.length > 1) {
    filled++;
  }

  return Math.min(filled / REGISTER_REQUIRED_FIELD_COUNT, 1);
}
