export type PwaInstallPromptOutcome = "accepted" | "dismissed";

export type PwaInstallPromptResult =
  | {
      outcome: PwaInstallPromptOutcome;
      platform: string;
    }
  | {
      outcome: "unavailable";
      platform?: never;
    };

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: PwaInstallPromptOutcome;
    platform: string;
  }>;
  prompt: () => Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notifyInstallPromptListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function hasPwaInstallPrompt() {
  return deferredPrompt !== null;
}

export function setPwaInstallPrompt(event: BeforeInstallPromptEvent) {
  deferredPrompt = event;
  notifyInstallPromptListeners();
}

export function clearPwaInstallPrompt() {
  deferredPrompt = null;
  notifyInstallPromptListeners();
}

export async function promptPwaInstall(): Promise<PwaInstallPromptResult> {
  if (!deferredPrompt) {
    return { outcome: "unavailable" };
  }

  const promptEvent = deferredPrompt;
  deferredPrompt = null;
  notifyInstallPromptListeners();

  await promptEvent.prompt();
  const choice = await promptEvent.userChoice;

  return {
    outcome: choice.outcome,
    platform: choice.platform,
  };
}

export function subscribePwaInstallPrompt(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
