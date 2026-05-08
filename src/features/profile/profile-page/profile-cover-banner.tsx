interface ProfileCoverBannerProps {
  personalityType?: string | null;
}

export function ProfileCoverBanner({
  personalityType,
}: ProfileCoverBannerProps) {
  return (
    <div className="absolute top-0 right-0 left-0 z-0 h-32 overflow-hidden bg-forge-teal sm:h-36 md:h-44">
      <div
        className="absolute inset-0 bg-linear-to-b from-black/5 to-black/20"
        aria-hidden="true"
      />

      <div
        className="profile-cover-dot-grid absolute inset-0 opacity-15"
        aria-hidden="true"
      />

      {personalityType ? (
        <span
          className="pointer-events-none absolute top-1/2 w-full -translate-y-1/2 select-none text-center font-black text-[6rem] text-white/10 leading-none tracking-tighter mix-blend-overlay sm:px-6 sm:text-right sm:text-[9rem] md:text-[11rem]"
          aria-hidden="true"
        >
          {personalityType}
        </span>
      ) : null}

      <div className="absolute right-0 bottom-0 left-0 h-px bg-black/10" />
    </div>
  );
}
