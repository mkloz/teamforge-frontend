import { RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export function ReviewErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-lg border border-destructive/15 bg-destructive/5 p-3 text-center">
      <p className="font-semibold text-destructive text-xs">
        Reviews could not load.
      </p>
      <Button className="mt-2" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}
