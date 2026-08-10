import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  onboardingObservationEventNames,
  recordOnboardingExposure,
  recordOnboardingObservation,
} from "@/features/onboarding/api/onboarding-observations";

import { ONBOARDING_EDUCATION_NUDGE_SESSION_KEY } from "@/shared/api/account-session-storage";
import { useOnboardingProductStateQuery } from "@/shared/api/onboarding-product-state-query";
import { Button } from "@/shared/components/ui/button";
import {
  getBrowserSessionStorageItem,
  setBrowserSessionStorageItem,
} from "@/shared/lib/browser-environment/session-storage";
import { buildOnboardingPracticeNavigation } from "@/shared/navigation";

export function OnboardingPracticeNudge() {
  const productStateQuery = useOnboardingProductStateQuery();
  const [dismissed, setDismissed] = useState(
    () =>
      getBrowserSessionStorageItem(ONBOARDING_EDUCATION_NUDGE_SESSION_KEY) ===
      "dismissed",
  );
  const productState = productStateQuery.data;
  const practiceAllowed =
    productState?.capabilities.USE_ONBOARDING_PRACTICE.allowed === true;

  useEffect(() => {
    if (
      dismissed ||
      !productState ||
      !practiceAllowed ||
      productState.stage !== "INTRODUCTORY"
    ) {
      return;
    }
    void recordOnboardingExposure({
      routeCode: "EXPLORE",
      treatment: "EDUCATION",
    }).catch(() => undefined);
  }, [dismissed, practiceAllowed, productState]);

  if (dismissed || !practiceAllowed || productState.stage !== "INTRODUCTORY") {
    return null;
  }

  function dismiss() {
    setBrowserSessionStorageItem(
      ONBOARDING_EDUCATION_NUDGE_SESSION_KEY,
      "dismissed",
    );
    setDismissed(true);
    recordDecision("DISMISSED");
  }

  function recordDecision(outcomeCode: "SELECTED" | "DISMISSED") {
    if (!productState) return;
    void recordOnboardingObservation({
      eventName: onboardingObservationEventNames.educationDecision,
      experimentVersion: "ONB-GATE-EDUCATION-V1",
      outcomeCode,
      productState,
      routeCode: "EXPLORE",
      tutorialVersion: "education-v1",
    }).catch(() => undefined);
  }

  return (
    <aside className="flex flex-col gap-4 rounded-[1.25rem] bg-card px-4 py-4 sm:flex-row sm:items-center sm:px-5">
      <Compass className="size-5 shrink-0 text-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm">See how Findafew fits together.</p>
        <p className="mt-1 text-muted-foreground text-sm">
          Follow the three moves that take an idea from discovery to action.
        </p>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <Button asChild size="sm">
          <Link
            {...buildOnboardingPracticeNavigation("/explore")}
            onClick={() => recordDecision("SELECTED")}
          >
            Take the quick tour
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss practice suggestion"
          onClick={dismiss}
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </aside>
  );
}
