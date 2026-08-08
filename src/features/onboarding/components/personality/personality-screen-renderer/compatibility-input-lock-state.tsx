import type { CompatibilityInputLockStatus } from "@/features/forge-proposals/public/proposal-review";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { PersonalityScreenShell } from "./personality-screen-layout";

interface CompatibilityInputLockStateProps {
  backLabel: string;
  message: string | null;
  onBack: () => void;
  onRetry: () => unknown;
  status: CompatibilityInputLockStatus;
}

export function CompatibilityInputLockState({
  backLabel,
  message,
  onBack,
  onRetry,
  status,
}: CompatibilityInputLockStateProps) {
  const isChecking = status === "checking";
  const title = getLockStateTitle(status);

  return (
    <PersonalityScreenShell className="max-w-md justify-center text-center">
      {isChecking ? (
        <Spinner
          className="mx-auto mb-4 size-6 text-foreground"
          aria-hidden="true"
        />
      ) : null}
      <h1 className="font-bold text-2xl text-ink">{title}</h1>
      <p className="mt-3 text-muted-foreground text-sm leading-relaxed">
        {message ?? "This assessment cannot be changed right now."}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="outline" onClick={onBack}>
          {backLabel}
        </Button>
        {status === "error" ? (
          <Button onClick={() => void onRetry()}>Try again</Button>
        ) : null}
      </div>
    </PersonalityScreenShell>
  );
}

function getLockStateTitle(status: CompatibilityInputLockStatus) {
  if (status === "blocked") {
    return "Assessment changes are paused";
  }

  if (status === "error") {
    return "Proposal status unavailable";
  }

  return "Checking your proposal";
}
