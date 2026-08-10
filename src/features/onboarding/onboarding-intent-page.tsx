import { useRef } from "react";
import { useWatch } from "react-hook-form";

import { OnboardingIntentField } from "@/features/onboarding/components/intent/onboarding-intent-field";
import { useOnboardingIntentForm } from "@/features/onboarding/hooks/use-onboarding-intent-form";
import { ProfileBasicsPageContent } from "@/features/onboarding/onboarding-page-content";
import type { OnboardingIntentValues } from "@/features/onboarding/schemas/onboarding-intent.schema";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Notice } from "@/shared/components/ui/notice";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";
import type { VoronoiFormationTarget } from "@/shared/lib/voronoi/voronoi-contract";

const INTENT_METADATA = createFindafewPageMetadata({
  title: "Choose your Findafew starting point",
  description:
    "Choose whether you want to start a plan, explore plans, or both.",
});

const INTENT_FORMATION = {
  kind: "symbol",
  value: "pathways",
} as const satisfies VoronoiFormationTarget;

const SELECTED_INTENT_FORMATIONS = {
  BRING_A_PLAN: INTENT_FORMATION,
  EXPLORE_AND_JOIN: {
    kind: "symbol",
    value: "constellation",
  },
  BOTH_OR_UNSURE: {
    kind: "symbol",
    value: "convergence",
  },
} as const satisfies Record<
  NonNullable<OnboardingIntentValues["onboardingIntent"]>,
  VoronoiFormationTarget
>;

export function OnboardingIntentPage() {
  usePageMetadata(INTENT_METADATA);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { form, isOnline, isSaving, onBack, onSkip, onSubmit, saveError } =
    useOnboardingIntentForm();
  const selectedIntent = useWatch({
    control: form.control,
    name: "onboardingIntent",
  });
  const intentFormation = selectedIntent
    ? SELECTED_INTENT_FORMATIONS[selectedIntent]
    : INTENT_FORMATION;

  useScrollToTop(["onboarding-intent"], scrollContainerRef);

  return (
    <ProfileBasicsPageContent
      formation={intentFormation}
      progress={selectedIntent ? 1 : 0}
      scrollContainerRef={scrollContainerRef}
    >
      <div className="flex w-full flex-col">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-balance font-extrabold text-3xl text-ink leading-tight tracking-tight sm:text-4xl">
            Why are you here<span className="text-foreground">?</span>
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-slate-muted text-sm leading-6 sm:text-base">
            Pick the closest answer so your first suggestions feel useful. You
            can also skip this.
          </p>
        </div>

        <Form {...form}>
          <form className="flex flex-col" onSubmit={onSubmit}>
            <OnboardingIntentField form={form} />

            {saveError ? (
              <Notice
                role="alert"
                tone="danger"
                size="md"
                statusIcon
                className="mt-4"
              >
                {saveError}
              </Notice>
            ) : null}

            <div className="mt-6 grid gap-2 sm:grid-cols-[auto_1fr]">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSaving}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="group"
                disabled={!isOnline || isSaving}
                loading={isSaving}
                title={
                  isOnline ? undefined : "Reconnect before saving your choice."
                }
              >
                Continue
                <ArrowRightAnimated />
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              className="mt-2"
              onClick={onSkip}
              disabled={!isOnline || isSaving}
            >
              Skip for now
            </Button>
          </form>
        </Form>
      </div>
    </ProfileBasicsPageContent>
  );
}
