export type GoogleAuthPhase = "gsi-load" | "oauth-popup" | "oauth-response";

interface GoogleCodeResponse {
  code?: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

interface GoogleNonOAuthError {
  type: "popup_failed_to_open" | "popup_closed" | "unknown";
}

interface GoogleCodeClient {
  requestCode: () => void;
}

interface GoogleIdentityServices {
  accounts?: {
    oauth2?: {
      initCodeClient: (config: {
        callback: (response: GoogleCodeResponse) => void;
        client_id: string;
        error_callback: (error: GoogleNonOAuthError) => void;
        scope: string;
      }) => GoogleCodeClient;
    };
  };
}

const GOOGLE_GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_AUTH_SCOPE = "openid profile email";

let googleIdentityScriptPromise: Promise<GoogleIdentityServices> | null = null;

export class GoogleAuthFlowError extends Error {
  phase: GoogleAuthPhase;

  constructor(message: string, phase: GoogleAuthPhase) {
    super(message);
    this.name = "GoogleAuthFlowError";
    this.phase = phase;
  }
}

function getGoogleIdentityServices() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    (window as Window & { google?: GoogleIdentityServices }).google ?? null
  );
}

function loadGoogleIdentityScript() {
  const loadedGoogle = getGoogleIdentityServices();

  if (loadedGoogle?.accounts?.oauth2) {
    return Promise.resolve(loadedGoogle);
  }

  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise;
  }

  if (typeof document === "undefined") {
    return Promise.reject(
      new GoogleAuthFlowError(
        "Google sign-in needs a browser window. Please try again.",
        "gsi-load",
      ),
    );
  }

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src^="${GOOGLE_GSI_SCRIPT_SRC}"]`,
    );
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      const google = getGoogleIdentityServices();

      if (google?.accounts?.oauth2) {
        resolve(google);
        return;
      }

      googleIdentityScriptPromise = null;
      reject(
        new GoogleAuthFlowError(
          "Google sign-in did not finish loading. Please try again.",
          "gsi-load",
        ),
      );
    };

    const handleError = () => {
      googleIdentityScriptPromise = null;
      reject(
        new GoogleAuthFlowError(
          "Google sign-in is unavailable right now. Please try again.",
          "gsi-load",
        ),
      );
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.src = GOOGLE_GSI_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.teamforgeGoogleIdentity = "true";
      document.body.appendChild(script);
    }
  });

  return googleIdentityScriptPromise;
}

function getGooglePopupErrorMessage(error: GoogleNonOAuthError) {
  if (error.type === "popup_closed") {
    return "Google sign-in didn't finish. Please try again.";
  }

  if (error.type === "popup_failed_to_open") {
    return "Your browser blocked the Google sign-in window. Allow popups and try again.";
  }

  return "Google sign-in didn't finish. Please try again.";
}

export async function preloadGoogleIdentityScript() {
  await loadGoogleIdentityScript();
}

export async function requestGoogleAuthCode(clientId: string) {
  const google = await loadGoogleIdentityScript();

  return new Promise<string>((resolve, reject) => {
    const codeClient = google.accounts?.oauth2?.initCodeClient({
      client_id: clientId,
      scope: GOOGLE_AUTH_SCOPE,
      callback: (response) => {
        if (response.error) {
          reject(
            new GoogleAuthFlowError(
              response.error_description ??
                "Google sign-in didn't finish. Please try again.",
              "oauth-response",
            ),
          );
          return;
        }

        if (!response.code) {
          reject(
            new GoogleAuthFlowError(
              "Google sign-in did not return a verification code. Please try again.",
              "oauth-response",
            ),
          );
          return;
        }

        resolve(response.code);
      },
      error_callback: (error) => {
        reject(
          new GoogleAuthFlowError(
            getGooglePopupErrorMessage(error),
            "oauth-popup",
          ),
        );
      },
    });

    if (!codeClient) {
      reject(
        new GoogleAuthFlowError(
          "Google sign-in is unavailable right now. Please try again.",
          "gsi-load",
        ),
      );
      return;
    }

    codeClient.requestCode();
  });
}
