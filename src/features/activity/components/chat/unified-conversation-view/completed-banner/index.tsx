import { Link } from "@tanstack/react-router";
import {
  Ban,
  CalendarClock,
  CircleDashed,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Star,
  UserCheck,
  UserRoundPlus,
  UserStar,
} from "lucide-react";
import { memo, type ReactNode, useMemo } from "react";
import type {
  Group,
  GroupMember,
} from "@/features/activity/lib/activity-contract";
import { buildActivityDmNavigation } from "@/features/activity/lib/activity-route";
import { usePublicProfileActions } from "@/features/profile/hooks/use-public-profile-actions";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { LoadingBlock } from "@/shared/components/loading/loading-block";
import { Button } from "@/shared/components/ui/button";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import { Textarea } from "@/shared/components/ui/textarea";
import { MemberRatingPicker } from "./member-rating-picker";
import { StarRatingInput } from "./star-rating-input";
import { useCompletedGroupRating } from "./use-completed-group-rating";

interface CompletedReviewGateProps {
  children: ReactNode;
  group: Group;
}

type CompletedGroupRating = ReturnType<typeof useCompletedGroupRating>;

interface CompletedReviewGateViewState {
  deferralDisabled: boolean;
  deferralTitle: string | undefined;
  groupTitle: string;
  isReviewFormBusy: boolean;
  pendingCountLabel: number | "No";
  ratingLabel: string;
  shouldShowGate: boolean;
  showOfflineNotice: boolean;
  submitDisabled: boolean;
  submitTitle: string | undefined;
}

export const CompletedReviewGate = memo(function CompletedReviewGate({
  children,
  group,
}: CompletedReviewGateProps) {
  const rating = useCompletedGroupRating(group);
  const viewState = getCompletedReviewGateViewState(group, rating);

  if (!viewState.shouldShowGate) {
    return <>{children}</>;
  }

  return (
    <div className="relative z-10 shrink-0 border-border border-t bg-canvas/60 backdrop-blur-sm">
      <CompletedReviewGateHeader
        pendingCountLabel={viewState.pendingCountLabel}
      />
      <CompletedReviewGateBody rating={rating} viewState={viewState} />
    </div>
  );
});

function getCompletedReviewGateViewState(
  group: Group,
  rating: CompletedGroupRating,
): CompletedReviewGateViewState {
  const isReviewFormBusy = rating.isSubmitting || rating.isDeferring;
  const selectedMemberUser = rating.selectedMember?.user;

  return {
    deferralDisabled: !rating.isOnline || rating.isSubmitting,
    deferralTitle: rating.isOnline
      ? undefined
      : "Reconnect before moving review prompts.",
    groupTitle: group.plan?.title ?? group.name,
    isReviewFormBusy,
    pendingCountLabel: rating.pendingCount || "No",
    ratingLabel: selectedMemberUser
      ? `Rating for ${selectedMemberUser.name}`
      : "Rating",
    shouldShowGate:
      group.plan?.status === "COMPLETED" &&
      (rating.isLoading || rating.isError || rating.shouldBlockReview),
    showOfflineNotice: !rating.isOnline,
    submitDisabled:
      !rating.isOnline || !rating.activeUserId || rating.score === 0,
    submitTitle: rating.isOnline
      ? undefined
      : "Reconnect before submitting reviews.",
  };
}

function CompletedReviewGateHeader({
  pendingCountLabel,
}: {
  pendingCountLabel: CompletedReviewGateViewState["pendingCountLabel"];
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-accent/20 border-b bg-accent/8 px-4 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <UserStar className="size-4 shrink-0 text-accent" />
        <span className="truncate font-semibold text-accent text-xs">
          Review checkpoint
        </span>
      </div>
      <span className="inline-flex min-h-6 shrink-0 items-center rounded-full border border-accent/30 bg-accent/12 px-2.5 py-0.5 font-black text-accent text-xs tabular-nums leading-none shadow-sm">
        {pendingCountLabel} left
      </span>
    </div>
  );
}

function CompletedReviewGateBody({
  rating,
  viewState,
}: {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}) {
  return (
    <div className="mx-auto grid w-full max-w-2xl gap-3 px-4 py-3">
      <CompletedReviewGatePrompt groupTitle={viewState.groupTitle} />
      <CompletedReviewGateState rating={rating} viewState={viewState} />
    </div>
  );
}

function CompletedReviewGatePrompt({ groupTitle }: { groupTitle: string }) {
  return (
    <div className="flex flex-col gap-1 text-center">
      <p className="font-semibold text-foreground text-sm">
        How was {groupTitle}?
      </p>
      <p className="text-muted-foreground text-xs">
        Leave the teammate reviews still missing for this group.
      </p>
    </div>
  );
}

function CompletedReviewGateState({
  rating,
  viewState,
}: {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}) {
  if (rating.isLoading) {
    return <CompletedRatingsSkeleton />;
  }

  if (rating.isError) {
    return <ReviewErrorState onRetry={() => void rating.refetch()} />;
  }

  return <CompletedReviewForm rating={rating} viewState={viewState} />;
}

function CompletedReviewForm({
  rating,
  viewState,
}: {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}) {
  return (
    <div className="grid gap-3">
      {viewState.showOfflineNotice ? <CompletedReviewOfflineNotice /> : null}
      <CompletedReviewMemberSelection rating={rating} viewState={viewState} />
      <CompletedReviewFields rating={rating} viewState={viewState} />
      <CompletedReviewActions rating={rating} viewState={viewState} />
    </div>
  );
}

function CompletedReviewOfflineNotice() {
  return (
    <OfflineNotice
      withIcon={false}
      tone="neutral"
      size="xs"
      className="rounded-lg border-border/70 bg-muted/30 text-center text-slate-muted"
      contentClassName="font-medium"
    >
      Reconnect to submit teammate reviews.
    </OfflineNotice>
  );
}

function CompletedReviewMemberSelection({
  rating,
  viewState,
}: {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}) {
  return (
    <div className="sm:main-action-grid grid gap-2 sm:items-center">
      <div className="min-w-0">
        <MemberRatingPicker
          activeUserId={rating.activeUserId}
          disabled={viewState.isReviewFormBusy}
          members={rating.rateableMembers}
          onSelect={rating.selectMember}
          ratedUserIds={rating.ratedUserIds}
        />
      </div>

      {rating.selectedMember ? (
        <ReviewMemberActions member={rating.selectedMember} />
      ) : null}
    </div>
  );
}

function CompletedReviewFields({
  rating,
  viewState,
}: {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}) {
  return (
    <div className="grid gap-2">
      <StarRatingInput
        disabled={viewState.isReviewFormBusy}
        label={viewState.ratingLabel}
        onChange={rating.setScore}
        score={rating.score}
      />

      <Textarea
        value={rating.comment}
        disabled={viewState.isReviewFormBusy}
        maxLength={500}
        rows={2}
        placeholder="Optional note"
        onChange={(event) => rating.setComment(event.target.value)}
        className="min-h-18 resize-none rounded-lg border-border/70 bg-card/65 text-ink text-xs placeholder:text-slate-muted/70 focus-visible:border-primary/40"
      />
    </div>
  );
}

function CompletedReviewActions({
  rating,
  viewState,
}: {
  rating: CompletedGroupRating;
  viewState: CompletedReviewGateViewState;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="subtle"
          size="sm"
          disabled={viewState.deferralDisabled}
          loading={rating.isDeferring}
          onClick={() => rating.deferActiveReview("NOT_PRESENT")}
          title={viewState.deferralTitle}
        >
          <CalendarClock className="size-4" />
          <span>I wasn't there</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={viewState.deferralDisabled}
          loading={rating.isDeferring}
          onClick={() => rating.deferActiveReview("NEED_MORE_TIME")}
          title={viewState.deferralTitle}
        >
          <CalendarClock className="size-4" />
          <span>Ask next time</span>
        </Button>
      </div>

      <Button
        size="sm"
        className="ml-auto gap-1.5"
        disabled={viewState.submitDisabled}
        loading={rating.isSubmitting}
        onClick={rating.submitActiveRating}
        title={viewState.submitTitle}
      >
        <Star className="size-4" />
        <span>Submit review</span>
      </Button>
    </div>
  );
}

function ReviewMemberActions({ member }: { member: GroupMember }) {
  const profileUser = useMemo(() => ({ id: member.userId }), [member.userId]);
  const {
    connectDisabled,
    connectLabel,
    connectLoading,
    isOnline,
    messageChatId,
    messageDisabled,
    onConnect,
  } = usePublicProfileActions(profileUser);
  const memberName = member.user?.name ?? "teammate";
  const ConnectIcon = getConnectIcon(connectLabel);

  return (
    <div className="flex flex-wrap gap-2 sm:justify-end">
      <Button
        variant="subtle"
        size="xs"
        disabled={connectDisabled}
        loading={connectLoading}
        onClick={() => onConnect()}
        aria-label={`${connectLabel} with ${memberName}`}
        title={isOnline ? undefined : "Reconnect before changing connections."}
      >
        <ConnectIcon className="size-3.5" />
        <span>{connectLabel}</span>
      </Button>

      {messageChatId ? (
        <Button asChild variant="subtle" size="xs">
          <Link
            {...buildActivityDmNavigation(messageChatId)}
            aria-label={`Message ${memberName}`}
          >
            <MessageCircle className="size-3.5" />
            <span>Message</span>
          </Link>
        </Button>
      ) : (
        <Button
          variant="subtle"
          size="xs"
          disabled={messageDisabled}
          aria-label={`Message ${memberName}`}
        >
          <MessageCircle className="size-3.5" />
          <span>Message</span>
        </Button>
      )}

      <Button asChild variant="subtle" size="xs">
        <Link
          {...buildProfileNavigation(member.userId)}
          aria-label={`Open ${memberName}'s profile`}
        >
          <ExternalLink className="size-3.5" />
          <span>Profile</span>
        </Link>
      </Button>
    </div>
  );
}

function getConnectIcon(label: string) {
  if (label === "Accept" || label === "Connected") {
    return UserCheck;
  }

  if (label === "Requested") {
    return CircleDashed;
  }

  if (label === "Blocked") {
    return Ban;
  }

  return UserRoundPlus;
}

function ReviewErrorState({ onRetry }: { onRetry: () => void }) {
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

function CompletedRatingsSkeleton() {
  return (
    <div className="flex flex-col gap-3 py-1">
      <span className="sr-only">Loading reviews</span>
      <div className="flex gap-2 overflow-hidden pb-1">
        <LoadingBlock className="h-8 w-24 shrink-0 rounded-lg bg-primary/12" />
        <LoadingBlock className="h-8 w-28 shrink-0 rounded-lg" />
        <LoadingBlock className="h-8 w-24 shrink-0 rounded-lg" />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card/65 p-3">
        <div className="mb-3 flex items-center justify-center gap-1.5">
          <LoadingBlock className="size-6 rounded-full bg-accent/18" />
          <LoadingBlock className="size-6 rounded-full bg-accent/18" />
          <LoadingBlock className="size-6 rounded-full bg-accent/18" />
          <LoadingBlock className="size-6 rounded-full" />
          <LoadingBlock className="size-6 rounded-full" />
        </div>
        <LoadingBlock className="h-16 rounded-lg" />
      </div>
    </div>
  );
}
