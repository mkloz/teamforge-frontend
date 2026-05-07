interface ProfileCoverBannerProps {
  personalityType?: string | null;
}

export function ProfileCoverBanner({
  personalityType,
}: ProfileCoverBannerProps) {
  return (
    <div className="absolute top-0 right-0 left-0 z-0 h-32 overflow-hidden bg-forge-teal sm:h-36 md:h-44">
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/20"
        aria-hidden="true"
      />

      <div
        className="profile-cover-dot-grid absolute inset-0 opacity-15"
        aria-hidden="true"
      />

      {personalityType ? (
        <span
          className="pointer-events-none absolute top-1/2 w-full -translate-y-1/2 text-center text-[6rem] leading-none font-black tracking-tighter text-white/10 mix-blend-overlay select-none sm:px-6 sm:text-right sm:text-[9rem] md:text-[11rem]"
          aria-hidden="true"
        >
          {personalityType}
        </span>
      ) : null}

      <div className="absolute right-0 bottom-0 left-0 h-px bg-black/10" />
    </div>
  );
}
