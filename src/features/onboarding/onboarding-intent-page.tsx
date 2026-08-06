import { useRef } from "react";

import { OnboardingIntentField } from "@/features/onboarding/components/intent/onboarding-intent-field";
import { useOnboardingIntentForm } from "@/features/onboarding/hooks/use-onboarding-intent-form";
import { ProfileBasicsPageContent } from "@/features/onboarding/onboarding-page-content";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Notice } from "@/shared/components/ui/notice";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";

const INTENT_METADATA = createTeamForgePageMetadata({
  title: "Your first TeamForge mission",
  description:
    "Choose the kind of TeamForge experience you want to begin with.",
});

export function OnboardingIntentPage() {
  usePageMetadata(INTENT_METADATA);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { form, isOnline, isSaving, onBack, onSkip, onSubmit, saveError } =
    useOnboardingIntentForm();

  useScrollToTop(["onboarding-intent"], scrollContainerRef);

  return (
    <ProfileBasicsPageContent
      progress={1}
      scrollContainerRef={scrollContainerRef}
    >
      <div className="flex w-full flex-col">
        <div className="mb-6 text-center sm:mb-8">
          <p className="font-bold text-forge-teal text-xs uppercase tracking-[0.18em]">
            Your first mission
          </p>
          <h1 className="mt-2 text-balance font-extrabold text-3xl text-ink leading-tight tracking-tight sm:text-4xl">
            Why are you here<span className="text-forge-teal">?</span>
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-slate-muted text-sm leading-6 sm:text-base">
            Pick the closest answer so your first mission feels useful. You can
            also skip this.
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
