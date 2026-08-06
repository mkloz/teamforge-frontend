import type { ReactNode } from "react";
import { getGreeting } from "@/features/home/components/home-hero/home-hero-copy";
import { HomeHeroNotificationButton } from "@/features/home/components/home-hero/home-hero-notification-button";
import { useHomeViewer } from "@/features/home/hooks/use-home-viewer";
import { cn } from "@/shared/lib/utils";

interface HomeDayJourneyProps {
  accountReadiness?: ReactNode;
  attention: ReactNode;
  availability?: ReactNode;
  forgeRequest?: ReactNode;
  groups: ReactNode;
  invitationReview?: ReactNode;
  inviteSomeone: ReactNode;
  openPlans: ReactNode;
  upcomingPlans: ReactNode;
}

export function HomeDayJourney({
  accountReadiness,
  attention,
  availability,
  forgeRequest,
  groups,
  invitationReview,
  inviteSomeone,
  openPlans,
  upcomingPlans,
}: HomeDayJourneyProps) {
  const viewer = useHomeViewer();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-app-bottom-nav sm:px-5 md:pt-10 md:pb-14 lg:px-8">
      <HomeJourneyHeader firstName={viewer.firstName} />
      {accountReadiness}

      <div className="relative mt-10 min-w-0">
        <div
          className="absolute top-2 bottom-2 left-2 w-px bg-border/70"
          aria-hidden="true"
        />

        <JourneyMoment
          id="home-journey-attention"
          timeLabel="Now"
          tone="active"
        >
          {invitationReview}
          {attention}
        </JourneyMoment>

        <JourneyMoment id="home-journey-plans" timeLabel="Next up">
          {upcomingPlans}
        </JourneyMoment>

        <JourneyMoment id="home-journey-circle" timeLabel="Your circle" isLast>
          <div className="grid min-w-0 items-start gap-10 lg:grid-cols-2 lg:gap-0">
            <div className="min-w-0 lg:order-2">{openPlans}</div>
            <div className="min-w-0 lg:order-1">{groups}</div>
          </div>
        </JourneyMoment>
      </div>

      <HomeNextMoves
        availability={availability}
        forgeRequest={forgeRequest}
        inviteSomeone={inviteSomeone}
      />
    </div>
  );
}

function HomeJourneyHeader({ firstName }: { firstName: string }) {
  const currentDate = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="max-w-3xl" data-onboarding-tour="home-overview">
      <div className="flex items-start justify-between gap-4">
        <p className="font-semibold text-forge-teal text-sm">{currentDate}</p>
        <div className="shrink-0 md:hidden">
          <HomeHeroNotificationButton />
        </div>
      </div>
      <h1 className="mt-2 max-w-2xl text-balance font-black text-3xl text-foreground leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
        {getGreeting(firstName)}
      </h1>
      <p className="mt-3 max-w-xl text-pretty font-medium text-base text-muted-foreground leading-7 sm:text-lg">
        A clear view of what needs you now and what is coming next.
      </p>
    </header>
  );
}

interface JourneyMomentProps {
  children: ReactNode;
  id: string;
  isLast?: boolean;
  timeLabel: string;
  tone?: "active" | "default";
}

function JourneyMoment({
  children,
  id,
  isLast = false,
  timeLabel,
  tone = "default",
}: JourneyMomentProps) {
  return (
    <div
      className={cn(
        "relative grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 sm:gap-x-4",
        isLast ? "pb-0" : "pb-10 md:pb-14",
      )}
    >
      <div className="relative z-10 flex justify-center pt-1">
        <span
          className={cn(
            "block size-3 rounded-full border-2 border-background ring-1",
            tone === "active"
              ? "bg-forge-teal ring-forge-teal"
              : "bg-card ring-border",
          )}
          aria-hidden="true"
        />
      </div>

      <div id={id} className="min-w-0 scroll-mt-8">
        <p
          className={cn(
            "mb-3 font-semibold text-xs",
            tone === "active" ? "text-forge-teal" : "text-muted-foreground",
          )}
        >
          {timeLabel}
        </p>
        {children}
      </div>
    </div>
  );
}

function HomeNextMoves({
  availability,
  forgeRequest,
  inviteSomeone,
}: {
  availability?: ReactNode;
  forgeRequest?: ReactNode;
  inviteSomeone: ReactNode;
}) {
  return (
    <section
      id="home-journey-more"
      aria-labelledby="home-next-moves-heading"
      className="mt-12 scroll-mt-8 border-border/60 border-t pt-8 md:mt-14 md:pt-10"
    >
      <header className="max-w-2xl">
        <p className="font-semibold text-forge-teal text-xs">
          More ways to connect
        </p>
        <h2
          id="home-next-moves-heading"
          className="mt-2 text-balance font-black text-2xl text-foreground leading-tight tracking-tight sm:text-3xl"
        >
          Your next move
        </h2>
        <p className="mt-2 text-pretty font-medium text-muted-foreground text-sm leading-6">
          Receive relevant group proposals, or bring someone you already know.
        </p>
      </header>

      {forgeRequest ? <div className="mt-8">{forgeRequest}</div> : null}

      <div className="mt-8 grid min-w-0 items-start gap-10 lg:grid-cols-2 lg:gap-12">
        {availability}
        {inviteSomeone}
      </div>
    </section>
  );
}
