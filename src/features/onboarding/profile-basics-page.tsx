import { useRef } from "react";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { ProfileBasicsCard } from "@/features/onboarding/components/profile-basics";
import { useProfileBasicsForm } from "@/features/onboarding/hooks/use-profile-basics-form";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";

export function ProfileBasicsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { form, watchedValues, progress, saveError, isSaving, onSubmit } =
    useProfileBasicsForm();

  useScrollToTop(["profile-basics"], scrollContainerRef);

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden">
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative h-full scroll-smooth"
        >
          <TopProgressBar progress={progress} />

          <main className="relative z-10 flex min-h-full items-center justify-center px-4 py-12 sm:px-6">
            <ProfileBasicsCard
              form={form}
              watchedValues={watchedValues}
              saveError={saveError}
              isSaving={isSaving}
              onSubmit={onSubmit}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
