import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Compass } from "lucide-react";

import { ONBOARDING_COACHMARK_REPLAY_EVENT } from "@/features/onboarding/components/education/onboarding-coachmarks";
import { Button } from "@/shared/components/ui/button";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const PRACTICE_METADATA = createTeamForgePageMetadata({
  title: "TeamForge Guidance",
  description: "Replay TeamForge’s guided main-navigation tutorial.",
});

function replayNavigationTutorial() {
  window.dispatchEvent(new Event(ONBOARDING_COACHMARK_REPLAY_EVENT));
}

export function OnboardingPracticePage() {
  usePageMetadata(PRACTICE_METADATA);
  const navigate = useNavigate();
  const search = useSearch({ from: "/app-shell/practice" });
  const returnTo = search.returnTo === "/home" ? "/home" : "/explore";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6">
      <section aria-labelledby="guidance-title" className="w-full">
        <Compass className="size-7 text-forge-teal" aria-hidden="true" />
        <p className="mt-5 font-bold text-forge-teal text-sm">
          Navigation tutorial
        </p>
        <h1
          id="guidance-title"
          className="mt-2 text-balance font-black text-4xl leading-none tracking-[-0.04em] sm:text-5xl"
        >
          Learn the main pages in one clear tour.
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-muted-foreground leading-relaxed sm:text-lg">
          The tutorial highlights the exact navigation and page area it is
          explaining. When a page is complete, it continues to the next one. You
          can go back, exit at any time, or replay it later.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={replayNavigationTutorial}>
            Replay navigation tutorial
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            onClick={() => void navigate({ to: returnTo })}
          >
            Back without replaying
          </Button>
        </div>
      </section>
    </main>
  );
}
