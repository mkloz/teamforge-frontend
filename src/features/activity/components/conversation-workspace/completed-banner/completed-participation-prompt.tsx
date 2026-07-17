import { CircleCheck, CircleMinus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import type {
  CompletedGroupRating,
  CompletedReviewGateViewState,
} from "./view-state";

interface CompletedParticipationPromptProps {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}

export function CompletedParticipationPrompt({
  rating,
  viewState,
}: CompletedParticipationPromptProps) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-foreground text-sm">
          Did you take part in this plan?
        </p>
        <p className="text-muted-foreground text-xs">
          Your answer is private and can't be changed. If you took part, you can
          continue with the group review.
        </p>
      </div>

      {viewState.showOfflineNotice ? (
        <OfflineNotice
          withIcon={false}
          tone="neutral"
          size="xs"
          className="rounded-lg border-border/70 bg-muted/30 text-slate-muted"
          contentClassName="font-medium"
        >
          Reconnect to answer this check-in.
        </OfflineNotice>
      ) : null}

      <div className="flex w-full flex-col-reverse justify-center gap-2 sm:w-auto sm:flex-row">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={viewState.participationDisabled}
          loading={
            rating.isSubmittingParticipation &&
            rating.pendingParticipationStatus === "DID_NOT_PARTICIPATE"
          }
          onClick={() => rating.submitParticipation("DID_NOT_PARTICIPATE")}
          title={viewState.participationTitle}
        >
          <CircleMinus className="size-4" aria-hidden="true" />
          No, I didn't take part
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={viewState.participationDisabled}
          loading={
            rating.isSubmittingParticipation &&
            rating.pendingParticipationStatus === "PARTICIPATED"
          }
          onClick={() => rating.submitParticipation("PARTICIPATED")}
          title={viewState.participationTitle}
        >
          <CircleCheck className="size-4" aria-hidden="true" />
          Yes, I took part
        </Button>
      </div>
    </div>
  );
}
