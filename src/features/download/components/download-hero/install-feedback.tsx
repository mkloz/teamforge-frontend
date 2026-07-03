import CheckCircle2 from "lucide-react/dist/esm/icons/circle-check.js";

interface HeroInstallFeedbackProps {
  feedback: string | null;
  isStandalone: boolean;
}

export function HeroInstallFeedback({
  feedback,
  isStandalone,
}: HeroInstallFeedbackProps) {
  if (isStandalone) {
    return (
      <p className="mt-4 flex items-center gap-2 font-medium text-forge-teal text-sm">
        <CheckCircle2 size={15} strokeWidth={2} aria-hidden="true" />
        TeamForge is already installed on this device.
      </p>
    );
  }

  if (feedback) {
    return (
      <p className="mt-4 font-medium text-sm text-text-dark-secondary">
        {feedback}
      </p>
    );
  }

  return null;
}
