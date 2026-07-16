import { LoaderCircle, RotateCcw } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface SubmissionScreenProps {
  error: string | null;
  onRetry: () => void;
}

export function SubmissionScreen({ error, onRetry }: SubmissionScreenProps) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 py-12 text-center sm:px-6">
      <LoaderCircle
        aria-hidden="true"
        className={error ? "text-destructive" : "animate-spin text-forge-teal"}
        size={32}
        strokeWidth={1.5}
      />

      <h1 className="mt-5 text-balance font-extrabold text-2xl text-ink leading-tight">
        {error ? "Your answers are still here" : "Submitting your answers"}
      </h1>
      <p
        className="mt-3 max-w-sm text-pretty text-muted-foreground text-sm leading-relaxed"
        role={error ? "alert" : undefined}
      >
        {error ??
          "TeamForge is sending your answers for scoring. This usually takes a few seconds."}
      </p>

      {error ? (
        <Button className="mt-6" onClick={onRetry}>
          <RotateCcw size={16} strokeWidth={2} />
          Retry submission
        </Button>
      ) : null}
    </div>
  );
}
