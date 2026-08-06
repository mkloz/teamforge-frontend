import { config } from "@/config/config";
import { AuthApi } from "@/features/auth/api/auth.api";

const GOOGLE_NOT_CONFIGURED_MESSAGE = "Google sign-in is not configured yet.";

export async function preloadGoogleAccountConnection() {
  if (!config.googleClientId) {
    return;
  }

  const { preloadGoogleIdentityScript } = await import(
    "@/features/auth/lib/google-auth-flow"
  );
  await preloadGoogleIdentityScript();
}

export async function connectGoogleAccount() {
  const clientId = config.googleClientId;

  if (!clientId) {
    throw new Error(GOOGLE_NOT_CONFIGURED_MESSAGE);
  }

  const { requestGoogleAuthCode } = await import(
    "@/features/auth/lib/google-auth-flow"
  );
  const code = await requestGoogleAuthCode(clientId);

  return AuthApi.linkGoogleAccount(code);
}
