interface ProfileCoverBannerProps {
  personalityType?: string | null;
}

export function ProfileCoverBanner({
  personalityType,
}: ProfileCoverBannerProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 bottom-0 z-30">
      <div className="sticky top-0 h-(--profile-cover-expanded-height) overflow-visible">
        <div className="transform-[translate3d(0,var(--profile-cover-y,0px),0)_scale(var(--profile-cover-scale,1))] absolute inset-x-0 top-0 h-(--profile-cover-expanded-height) origin-[center_top] overflow-hidden bg-forge-teal transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none">
          <div
            className="absolute inset-0 bg-[radial-gradient(circle,var(--color-canvas)_1px,transparent_1px)] bg-size-[24px_24px] opacity-15"
            aria-hidden="true"
          />

          <div
            className="absolute inset-0 bg-linear-to-b from-black/5 via-black/10 to-black/35"
            aria-hidden="true"
          />
        </div>

        {personalityType ? (
          <div
            className="transform-[translate3d(0,var(--profile-cover-type-y,0px),0)] absolute inset-x-0 top-0 mx-auto flex h-(--profile-cover-expanded-height) w-full max-w-lg items-center justify-end px-4 transition-transform duration-300 ease-out motion-reduce:transition-none sm:max-w-6xl sm:px-6 md:px-8"
            aria-hidden="true"
          >
            <span className="transform-[scale(var(--profile-cover-type-scale,1))] origin-right select-none font-black text-[5.5rem] text-white leading-none tracking-tighter opacity-(--profile-cover-type-opacity) mix-blend-overlay transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none sm:text-[7.5rem] md:text-[9rem]">
              {personalityType}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
