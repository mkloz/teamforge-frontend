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
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden">
      <div className="hidden lg:flex flex-1 relative bg-hero-bg border-r border-border items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst ref={catalystRef} progress={progress} />
      </div>

      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        <BackgroundTexture />
        <OnboardingHomeLink />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 relative h-full scroll-smooth"
          onInput={handleInput}
        >
          <TopProgressBar
            progress={progress}
            className="-mx-4 -mt-2 w-[calc(100%+32px)] sticky top-0 z-50"
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
