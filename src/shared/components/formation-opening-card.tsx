import {
  CalendarClock,
  Check,
  Globe2,
  MapPin,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { useRequestFormationOpening } from "@/shared/hooks/use-request-formation-opening";
import { cn } from "@/shared/lib/utils";
import type { ExploreFormationOpening } from "@/shared/schemas";

interface FormationOpeningCardProps {
  opening: ExploreFormationOpening;
  variant?: "default" | "compact";
}

export function FormationOpeningCard({
  opening,
  variant = "default",
}: FormationOpeningCardProps) {
  const application = useRequestFormationOpening(opening);
  const isCompact = variant === "compact";
  const isRequested = application.requestState === "requested";
  const isClosed = application.requestState === "closed";
  const statusMessage = getStatusMessage(application);

  return (
    <article
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-2xl border border-primary/20 bg-card text-card-foreground",
        isCompact ? "gap-4 p-4" : "gap-5 p-5 sm:p-6",
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <UsersRound className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-primary text-xs uppercase tracking-wide">
              One place open
            </p>
            <h3
              className={cn(
                "mt-1 font-black text-foreground leading-tight tracking-tight",
                isCompact ? "line-clamp-2 text-lg" : "text-xl sm:text-2xl",
              )}
            >
              {opening.activity.title}
            </h3>
          </div>
        </div>
        <StatusPill tone="teal" size="xs" numeric>
          {opening.readyCount} ready
        </StatusPill>
      </div>

      <p className="font-medium text-muted-foreground text-sm leading-relaxed">
        Request the open place. The organizer will choose one person, then the
        people in the final roster will review it before the group forms.
      </p>

      <dl className="flex flex-wrap gap-x-4 gap-y-2 border-border/70 border-y py-3 font-semibold text-muted-foreground text-xs">
        <OpeningDetail icon={CalendarClock}>
          {formatOpeningSchedule(opening)}
        </OpeningDetail>
        <OpeningDetail icon={opening.scope === "ONLINE" ? Globe2 : MapPin}>
          {opening.scope === "ONLINE" ? "Online" : opening.broadArea || "Local"}
        </OpeningDetail>
        <OpeningDetail icon={ShieldCheck}>
          {opening.cost.type === "FREE" ? "Free" : "Paid"}
        </OpeningDetail>
      </dl>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <span className="font-semibold text-muted-foreground text-xs capitalize">
          {opening.category.toLowerCase()}
        </span>
        {isRequested ? (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <StatusPill icon={Check} tone="teal" size="sm">
              Request sent
            </StatusPill>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              loading={application.isWithdrawPending}
              disabled={!application.isOnline}
              onClick={application.withdrawRequest}
            >
              <X className="size-3.5" aria-hidden="true" />
              Withdraw
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant={isClosed ? "subtle" : "primary"}
            size={isCompact ? "xs" : "sm"}
            loading={application.isApplyPending}
            disabled={!application.isOnline || isClosed}
            onClick={application.requestPlace}
          >
            {getRequestLabel(application.requestState, application.didWithdraw)}
          </Button>
        )}
      </div>

      {statusMessage ? (
        <p
          className="font-medium text-muted-foreground text-xs"
          aria-live="polite"
        >
          {statusMessage}
        </p>
      ) : null}
    </article>
  );
}

function OpeningDetail({
  children,
  icon: Icon,
}: {
  children: string;
  icon: typeof CalendarClock;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <dt className="sr-only">Plan detail</dt>
      <Icon className="size-3.5 text-primary" aria-hidden="true" />
      <dd>{children}</dd>
    </div>
  );
}

function formatOpeningSchedule(opening: ExploreFormationOpening) {
  if (opening.schedule.mode !== "FIXED" || !opening.schedule.dateTime) {
    return "Time to be decided";
  }

  const date = new Date(opening.schedule.dateTime);
  if (Number.isNaN(date.getTime())) return "Time to be decided";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    weekday: "short",
  }).format(date);
}

function getRequestLabel(
  state: ReturnType<typeof useRequestFormationOpening>["requestState"],
  didWithdraw: boolean,
) {
  if (didWithdraw) return "Request withdrawn";
  if (state === "pending") return "Sending request";
  if (state === "error") return "Try again";
  if (state === "closed") return "No longer open";
  return "Request to join";
}

function getStatusMessage(
  application: ReturnType<typeof useRequestFormationOpening>,
) {
  if (application.didWithdraw) {
    return "Your request was withdrawn.";
  }
  if (application.requestState === "requested") {
    return application.withdrawError
      ? "Your request is still active. Try withdrawing it again."
      : null;
  }
  if (application.requestState === "closed") {
    return "This opening is no longer available.";
  }
  if (application.applyError) {
    return "Your request was not sent. Try again when you're ready.";
  }
  if (!application.isOnline) {
    return "Reconnect to request or withdraw a place.";
  }
  return null;
}
