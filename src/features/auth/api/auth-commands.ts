import type {
  LoginValues,
  RegisterValues,
} from "@/features/auth/schemas/auth-schemas";
import type { AuthTokens } from "@/shared/api/auth-session";
import { logoutCurrentSession } from "@/shared/api/auth-session-commands";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";

import { AuthApi } from "./auth.api";
import type { GoogleAuthIntent } from "./auth.types";
import { AuthCache } from "./auth-cache";

export class AuthCommands {
  static getAuthErrorMessage(error: unknown, fallbackMessage: string) {
    return getApiErrorMessage(error, fallbackMessage);
  }

  static async loginWithEmail(values: Pick<LoginValues, "email" | "password">) {
    return AuthCommands.startSessionFromResult(
      await AuthApi.loginWithEmail(values),
    );
  }

  static async registerWithEmail(values: RegisterValues) {
    return AuthApi.registerWithEmail(values);
  }

  static async verifyEmailOtp(values: Pick<RegisterValues, "email" | "otp">) {
    return AuthCommands.startSessionFromResult(
      await AuthApi.verifyEmailOtp(values),
    );
  }

  static async resendEmailOtp(email: string) {
    return AuthApi.resendEmailOtp(email);
  }

  static async activateAccount(token: string) {
    return AuthCommands.startSessionFromResult(
      await AuthApi.activateAccount(token),
    );
  }

  static async sendResetPasswordLink(email: string) {
    return AuthApi.sendResetPasswordLink(email);
  }

  static async resetPassword(token: string, password: string) {
    return AuthApi.resetPassword(token, password);
  }

  static async loginWithGoogle(code: string, intent: GoogleAuthIntent) {
    const result = await AuthApi.loginWithGoogle(code, intent);

    AuthCache.startAuthenticatedSession({
      accessToken: result.data.accessToken,
      refreshToken: result.data.refreshToken,
    });

    return result;
  }

  static async logoutUser() {
    await logoutCurrentSession();
  }

  private static startSessionFromResult<T extends AuthTokens>(result: {
    data: T;
    requestId: string | null;
  }) {
    AuthCache.startAuthenticatedSession(result.data);

    return result;
  }
}
