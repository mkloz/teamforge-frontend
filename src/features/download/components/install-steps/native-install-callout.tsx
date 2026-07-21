import Download from "lucide-react/dist/esm/icons/download.js";
import type { InstallState } from "@/features/download/download-page-view-state";
import { Button } from "@/shared/components/ui/button";

interface NativeInstallCalloutProps {
  feedback: string | null;
  installState: InstallState;
  onInstallClick: () => void;
}

export function NativeInstallCallout({
  installState,
  feedback,
  onInstallClick,
}: NativeInstallCalloutProps) {
  return (
    <div className="mb-8 rounded-2xl border border-primary/20 bg-primary/6 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <p className="font-bold text-ink">Direct install is available here</p>
        <p className="mt-1 max-w-xl text-pretty text-slate-muted text-sm leading-relaxed">
          This browser can add TeamForge directly. Use the manual steps below
          only if the prompt does not appear.
        </p>
        {feedback && (
          <p
            className="mt-2 font-medium text-primary text-sm"
            aria-hidden="true"
          >
            {feedback}
          </p>
        )}
      </div>
      <Button
        size="lg"
        loading={installState === "prompting"}
        className="mt-4 w-full text-white sm:mt-0 sm:w-auto"
        onClick={onInstallClick}
      >
        <Download size={16} strokeWidth={2} aria-hidden="true" />
        Install TeamForge
      </Button>
    </div>
  );
}
