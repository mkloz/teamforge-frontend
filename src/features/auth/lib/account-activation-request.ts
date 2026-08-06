import { AuthCommands } from "@/features/auth/api/auth-commands";

type AccountActivationResult = Awaited<
  ReturnType<typeof AuthCommands.activateAccount>
>;

interface AccountActivationRequest {
  promise: Promise<AccountActivationResult>;
  token: string;
}

let currentRequest: AccountActivationRequest | null = null;

/**
 * Shares the one-time activation request across React Strict Mode remounts.
 * Failed requests are released for a real retry; successful requests remain
 * available until the activation route has finished navigating away.
 */
export function activateAccountFromEmail(
  token: string,
): Promise<AccountActivationResult> {
  if (currentRequest?.token === token) {
    return currentRequest.promise;
  }

  const promise = AuthCommands.activateAccount(token);
  currentRequest = { promise, token };

  void promise.catch(() => {
    if (currentRequest?.promise === promise) {
      currentRequest = null;
    }
  });

  return promise;
}

export function releaseAccountActivationRequest(token: string) {
  if (currentRequest?.token === token) {
    currentRequest = null;
  }
}
