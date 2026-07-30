import {
  authResultSchema,
  authTokensSchema,
  type LoginValues,
  type RegisterValues,
} from "@/features/auth/schemas/auth-schemas";
import {
  apiClient,
  getResponseRequestId,
  parseJsonWithRequestId,
} from "@/shared/api/api";
import { sendResetPasswordLink as sharedSendResetPasswordLink } from "@/shared/api/auth-session-commands";
import { getAgeFromDateOfBirth } from "@/shared/validators/date-of-birth.validator";
import type { GoogleAuthIntent } from "./auth.types";

interface RegisterDto {
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
  age: number;
  city: string;
  gender: "MALE" | "FEMALE" | "NON_BINARY" | "OTHER";
}

interface VerifyEmailOtpDto {
  email: string;
  code: string;
}

interface AuthMutationResult<T> {
  data: T;
  requestId: string | null;
}

const REGISTER_PROFILE_GENDER_MAP = {
  male: "MALE",
  female: "FEMALE",
  non_binary: "NON_BINARY",
  prefer_not_to_say: "OTHER",
  MALE: "MALE",
  FEMALE: "FEMALE",
  NON_BINARY: "NON_BINARY",
  OTHER: "OTHER",
} as const;

function normalizeGender(
  gender: RegisterValues["gender"],
): RegisterDto["gender"] {
  return isRegisterProfileGender(gender)
    ? REGISTER_PROFILE_GENDER_MAP[gender]
    : "OTHER";
}

function isRegisterProfileGender(
  gender: string,
): gender is keyof typeof REGISTER_PROFILE_GENDER_MAP {
  return Object.hasOwn(REGISTER_PROFILE_GENDER_MAP, gender);
}

function createEmptyAuthMutationResult(
  response: Response,
): AuthMutationResult<null> {
  return {
    data: null,
    requestId: getResponseRequestId(response),
  };
}

export class AuthApi {
  static async loginWithEmail(values: Pick<LoginValues, "email" | "password">) {
    const response = await apiClient.post("auth/login", {
      json: values,
      context: {
        auth: "none",
        retryOnUnauthorized: false,
      },
    });

    return parseJsonWithRequestId(response, (responsePayload) =>
      authTokensSchema.parse(responsePayload),
    );
  }

  static async registerWithEmail(values: RegisterValues) {
    const age = getAgeFromDateOfBirth(values.dateOfBirth);

    if (age === null) {
      throw new TypeError("Registration date of birth was not valid.");
    }

    const payload: RegisterDto = {
      email: values.email,
      password: values.password,
      name: values.name,
      dateOfBirth: values.dateOfBirth,
      age,
      city: values.city,
      gender: normalizeGender(values.gender),
    };

    const response = await apiClient.post("auth/register", {
      json: payload,
      context: {
        auth: "none",
        retryOnUnauthorized: false,
      },
    });

    return createEmptyAuthMutationResult(response);
  }

  static async verifyEmailOtp(values: Pick<RegisterValues, "email" | "otp">) {
    const payload: VerifyEmailOtpDto = {
      email: values.email,
      code: values.otp,
    };

    const response = await apiClient.post("auth/verify-email-otp", {
      json: payload,
      context: {
        auth: "none",
        retryOnUnauthorized: false,
      },
    });

    return parseJsonWithRequestId(response, (responsePayload) =>
      authTokensSchema.parse(responsePayload),
    );
  }

  static async resendEmailOtp(email: string) {
    const response = await apiClient.post("auth/resend-email-otp", {
      json: { email },
      context: {
        auth: "none",
        retryOnUnauthorized: false,
      },
    });

    return createEmptyAuthMutationResult(response);
  }

  static async activateAccount(token: string) {
    const response = await apiClient.post(`auth/activate/${token}`, {
      context: {
        auth: "none",
        retryOnUnauthorized: false,
      },
    });

    return parseJsonWithRequestId(response, (payload) =>
      authTokensSchema.parse(payload),
    );
  }

  static async sendResetPasswordLink(email: string) {
    return sharedSendResetPasswordLink(email);
  }

  static async resetPassword(token: string, password: string) {
    const response = await apiClient.post("auth/reset-password", {
      json: { token, password },
      context: {
        auth: "none",
        retryOnUnauthorized: false,
      },
    });

    return createEmptyAuthMutationResult(response);
  }

  static async loginWithGoogle(code: string, intent: GoogleAuthIntent) {
    const response = await apiClient.post("auth/google/login", {
      json: { code, intent },
      context: {
        auth: "none",
        retryOnUnauthorized: false,
      },
    });

    return parseJsonWithRequestId(response, (payload) =>
      authResultSchema.parse(payload),
    );
  }
}
