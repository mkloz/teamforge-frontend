import { useRef } from "react";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { OnboardingHomeLink } from "@/features/onboarding/components/onboarding-home-link";
import { ProfileBasicsCard } from "@/features/onboarding/components/profile-basics";
import { useProfileBasicsForm } from "@/features/onboarding/hooks/use-profile-basics-form";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";
import type { VoronoiCatalystHandle } from "@/shared/lib/voronoi/voronoi-contract";

export function ProfileBasicsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const catalystRef = useRef<VoronoiCatalystHandle>(null);
  const { form, watchedValues, progress, saveError, isSaving, onSubmit } =
    useProfileBasicsForm();

  useScrollToTop(["profile-basics"], scrollContainerRef);

  const handleInput = () => {
    catalystRef.current?.pulseTyping();
  };

  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div className="relative hidden h-full flex-1 items-center justify-center overflow-hidden border-r border-border bg-hero-bg lg:flex">
        <VoronoiCatalyst ref={catalystRef} progress={progress} />
      </div>

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <BackgroundTexture />
        <OnboardingHomeLink />

        <div
          ref={scrollContainerRef}
          className="relative h-full flex-1 overflow-x-hidden overflow-y-auto scroll-smooth px-4 pb-4"
          onInput={handleInput}
        >
          <TopProgressBar
            progress={progress}
            className="sticky top-0 z-50 -mx-4 -mt-2 w-[calc(100%+32px)]"
          />

          <main className="relative z-10 flex min-h-full items-start justify-center pt-20 pb-10 lg:items-center lg:py-8">
            <div className="w-full max-w-sm px-2 sm:px-10 lg:p-0">
              <ProfileBasicsCard
                form={form}
                watchedValues={watchedValues}
                saveError={saveError}
                isSaving={isSaving}
                onSubmit={onSubmit}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
