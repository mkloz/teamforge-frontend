import { useRef } from "react";
import { ProfileBasicsCard } from "@/features/onboarding/components/profile-basics";
import { useProfileBasicsForm } from "@/features/onboarding/hooks/use-profile-basics-form";
import { ProfileBasicsPageContent } from "@/features/onboarding/onboarding-page-content";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import type {
  VoronoiCatalystHandle,
  VoronoiFormationTarget,
} from "@/shared/lib/voronoi/voronoi-contract";

const PROFILE_BASICS_METADATA = createTeamForgePageMetadata({
  title: "Profile Setup",
  description:
    "Add the basic profile details TeamForge needs before forming a group.",
});

const PROFILE_FORMATION = {
  kind: "symbol",
  value: "location",
} as const satisfies VoronoiFormationTarget;

export function ProfileBasicsPage() {
  usePageMetadata(PROFILE_BASICS_METADATA);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const catalystRef = useRef<VoronoiCatalystHandle>(null);
  const {
    form,
    watchedValues,
    progress,
    requiresDateOfBirth,
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
      formation={PROFILE_FORMATION}
      onInput={handleInput}
      progress={progress}
      scrollContainerRef={scrollContainerRef}
    >
      <ProfileBasicsCard
        form={form}
        watchedValues={watchedValues}
        requiresDateOfBirth={requiresDateOfBirth}
        saveError={saveError}
        isOnline={isOnline}
        isSaving={isSaving}
        onSubmit={onSubmit}
      />
    </ProfileBasicsPageContent>
  );
}
