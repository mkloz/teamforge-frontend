import { MapPin } from "lucide-react";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import { PersonalityCoverArt } from "@/shared/components/profile/personality-cover-art";
import { scrollWindowToTop } from "@/shared/lib/scroll-to-top";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/schemas";

interface ProfileCompactHeaderProps {
  user: User;
  visible: boolean;
}

export function ProfileCompactHeader({
  user,
  visible,
}: ProfileCompactHeaderProps) {
  const hasAge = typeof user.age === "number";
  const hasCity = Boolean(user.city);

  return (
    <div
      className={cn(
        "pointer-events-none fixed top-0 right-0 left-(--profile-shell-offset,0px) z-40 origin-left overflow-hidden border-white/10 border-b bg-forge-teal text-white shadow-[0_16px_50px_rgba(0,0,0,0.24)] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none",
        visible
          ? "profile-compact-banner-shown"
          : "profile-compact-banner-hidden",
      )}
      aria-hidden={!visible}
    >
      <PersonalityCoverArt
        coverClassName="h-full"
        personalityType={user.personalityType}
        watermarkClassName="block text-[4.25rem] text-white/42 sm:text-[5.5rem] md:text-[6.25rem] lg:text-[4.5rem]"
        watermarkContainerClassName="z-10 mx-auto h-full w-full max-w-lg px-4 [--personality-cover-type-opacity:1] [--personality-cover-type-scale:1] [--personality-cover-type-y:0px] sm:max-w-6xl sm:px-6 md:px-8"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/12 via-black/22 to-black/38" />

      <div className="relative mx-auto flex h-20 w-full max-w-lg items-center gap-3 px-4 py-2 sm:max-w-6xl sm:px-6 md:px-8 lg:h-16">
        <button
          type="button"
          aria-label="Scroll profile to top"
          tabIndex={visible ? 0 : -1}
          onClick={scrollWindowToTop}
          className="pointer-events-auto absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-forge-teal"
        />

        {visible ? (
          <div className="pointer-events-none relative z-10 shrink-0">
            <Avatar
              src={user.avatar}
              name={user.name}
              className="size-14 border-2 border-canvas bg-muted text-2xl shadow-sm ring-1 ring-border/70 sm:size-16 sm:text-3xl lg:size-11 lg:text-lg"
              fallbackClassName="bg-muted text-forge-teal"
              imageSize={80}
              loading="eager"
            />
            <AvatarStatus
              status={user.onlineStatus ?? "ONLINE"}
              borderClassName="border-forge-teal"
              sizeClassName="size-3.5 sm:size-4 lg:size-3"
            />
          </div>
        ) : null}

        <div className="pointer-events-none relative z-10 flex min-w-0 flex-col justify-center">
          <p className="truncate font-bold text-2xl leading-tight tracking-tight sm:text-3xl lg:text-xl">
            {user.name}
          </p>

          <div className="mt-1 flex min-w-0 items-center gap-1.5 font-semibold text-white/82 text-xs leading-4 sm:text-sm lg:mt-0.5">
            {hasAge ? <span className="shrink-0">{user.age} yrs</span> : null}
            {hasAge && hasCity ? (
              <span className="size-1 rounded-full bg-white/45" />
            ) : null}
            {hasCity ? (
              <span className="flex min-w-0 items-center gap-1">
                <MapPin
                  aria-hidden="true"
                  className="size-3 shrink-0 text-white/85 sm:size-3.5"
                />
                <span className="truncate">{user.city}</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
