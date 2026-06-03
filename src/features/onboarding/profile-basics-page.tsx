import { useRef } from "react";
import { ProfileBasicsCard } from "@/features/onboarding/components/profile-basics";
import { useProfileBasicsForm } from "@/features/onboarding/hooks/use-profile-basics-form";
import { ProfileBasicsPageContent } from "@/features/onboarding/onboarding-page-content";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import type { VoronoiCatalystHandle } from "@/shared/lib/voronoi/voronoi-contract";

export function ProfileBasicsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const catalystRef = useRef<VoronoiCatalystHandle>(null);
  const {
    form,
    watchedValues,
    progress,
    saveError,
    isOnline,
    isSaving,
    onSubmit,
  } = useProfileBasicsForm();

  useScrollToTop(["profile-basics"], scrollContainerRef);

  const handleInput = () => {
    catalystRef.current?.pulseTyping();
  };

  return (
    <ProfileBasicsPageContent
      catalystRef={catalystRef}
      onInput={handleInput}
      progress={progress}
      scrollContainerRef={scrollContainerRef}
    >
      <ProfileBasicsCard
        form={form}
        watchedValues={watchedValues}
        saveError={saveError}
        isOnline={isOnline}
        isSaving={isSaving}
        onSubmit={onSubmit}
      />
    </ProfileBasicsPageContent>
  );
}
