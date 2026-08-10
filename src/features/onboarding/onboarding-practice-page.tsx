import { useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Compass } from "lucide-react";

import { ONBOARDING_COACHMARK_REPLAY_EVENT } from "@/features/onboarding/components/education/onboarding-coachmarks";
import { Button } from "@/shared/components/ui/button";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";

const PRACTICE_METADATA = createFindafewPageMetadata({
  title: "Findafew Guidance",
  description: "Replay Findafew’s focused product tour.",
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
        <Compass className="size-7 text-foreground" aria-hidden="true" />
        <p className="mt-5 font-bold text-muted-foreground text-sm">
          Quick product tour
        </p>
        <h1
          id="guidance-title"
          className="mt-2 text-balance font-black text-4xl leading-none tracking-[-0.04em] sm:text-5xl"
        >
          Learn the workflow that matters.
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-muted-foreground leading-relaxed sm:text-lg">
          See how to find a plan, create one when nothing fits, and keep it
          moving once people are involved. Three useful stops, then you are
          done.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={replayNavigationTutorial}>
            Replay quick tour
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
