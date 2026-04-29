import { HTTPError } from "ky";

import { authApi, apiClient } from "@/shared/api/api";
import type { AuthTokens } from "@/shared/api/auth-session";
import type { ApiException } from "@/shared/types/api-error";

import type { LoginValues, RegisterValues } from "../schemas/auth-schemas";
import { AuthQueries } from "./auth.queries";

interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

interface UpdateProfileDto {
  age: number;
  city: string;
  gender: "MALE" | "FEMALE" | "NON_BINARY" | "OTHER";
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
): UpdateProfileDto["gender"] {
  return (
    REGISTER_PROFILE_GENDER_MAP[
      gender as keyof typeof REGISTER_PROFILE_GENDER_MAP
    ] ?? "OTHER"
  );
}

function readApiException(error: unknown): ApiException | null {
  if (!(error instanceof HTTPError)) {
    return null;
  }

  const { cause } = error as HTTPError & { cause?: unknown };

  if (!cause || typeof cause !== "object") {
    return null;
  }

  return cause as ApiException;
}

export class AuthApi {
  static getAuthErrorMessage(error: unknown, fallbackMessage: string) {
    const apiException = readApiException(error);

    if (apiException?.message && apiException.message.trim().length > 0) {
      return apiException.message;
    }

    if (error instanceof HTTPError) {
      if (error.response.status === 400) {
        return fallbackMessage;
      }

      if (error.response.status >= 500) {
        return "TeamForge is having trouble right now. Please try again in a moment.";
      }
    }

    return fallbackMessage;
  }

  static async loginWithEmail(values: Pick<LoginValues, "email" | "password">) {
    const tokens = await apiClient
      .post("auth/login", {
        json: values,
        context: {
          auth: "none",
          retryOnUnauthorized: false,
        },
      })
      .json<AuthTokens>();

    authApi.setTokens(tokens);
    AuthQueries.clearCurrentUserCache();

    return tokens;
  }

  static async registerWithEmail(values: RegisterValues) {
    const payload: RegisterDto = {
      email: values.email,
      password: values.password,
      name: values.name,
    };

    await apiClient.post("auth/register", {
      json: payload,
      context: {
        auth: "none",
        retryOnUnauthorized: false,
      },
    });

    const tokens = await AuthApi.loginWithEmail({
      email: values.email,
      password: values.password,
    });

    const profilePayload: UpdateProfileDto = {
      age: values.age,
      city: values.city,
      gender: normalizeGender(values.gender),
    };

    try {
      await apiClient.patch("users/me", {
        json: profilePayload,
      });
    } catch {
      // The account and session are already valid at this point.
      // Keep the primary auth flow successful even if profile enrichment fails.
    }

    return tokens;
  }

  static async logoutUser() {
    try {
      await apiClient.post("auth/logout", {
        context: {
          auth: "refresh",
          retryOnUnauthorized: false,
        },
      });
    } finally {
      AuthQueries.clearCurrentUserCache();
      authApi.clearSession();
    }
  }
}
