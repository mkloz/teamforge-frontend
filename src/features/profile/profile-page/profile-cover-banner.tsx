import { PersonalityCoverArt } from "@/shared/components/profile/personality-cover-art";
import type { PersonalityType } from "@/shared/schemas/enums";

interface ProfileCoverBannerProps {
  personalityType?: PersonalityType | null;
}

export function ProfileCoverBanner({
  personalityType,
}: ProfileCoverBannerProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-30">
      <div className="sticky top-0 h-(--profile-cover-expanded-height) overflow-visible">
        <PersonalityCoverArt
          coverClassName="transform-[translate3d(0,var(--profile-cover-y,0px),0)_scale(var(--profile-cover-scale,1))] h-(--profile-cover-expanded-height) origin-[center_top] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none"
          personalityType={personalityType}
          watermarkClassName="text-[5.5rem] sm:text-[7.5rem] md:text-[9rem]"
          watermarkContainerClassName="mx-auto h-(--profile-cover-expanded-height) w-full max-w-lg px-4 sm:max-w-6xl sm:px-6 md:px-8"
        />
      </div>
    </div>
  );
}
