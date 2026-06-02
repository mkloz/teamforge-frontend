import { getPersonalityBannerVariant } from "@/shared/lib/personality-banner-variants";
import { cn } from "@/shared/lib/utils";
import type { PersonalityType } from "@/shared/schemas/enums";

interface PersonalityCoverArtProps {
  coverClassName?: string;
  imageClassName?: string;
  personalityType?: PersonalityType | null;
  watermarkClassName?: string;
  watermarkContainerClassName?: string;
}

export function PersonalityCoverArt({
  coverClassName,
  imageClassName,
  personalityType,
  watermarkClassName,
  watermarkContainerClassName,
}: PersonalityCoverArtProps) {
  const variant = getPersonalityBannerVariant(personalityType ?? null);

  return (
    <>
      <div
        className={cn(
          "absolute inset-x-0 top-0 overflow-hidden bg-forge-teal",
          coverClassName,
        )}
        aria-hidden="true"
      >
        {variant ? (
          <img
            alt=""
            aria-hidden="true"
            className={cn(
              "absolute inset-0 size-full object-cover opacity-92 saturate-90",
              imageClassName,
            )}
            decoding="async"
            draggable={false}
            src={variant.imageSrc}
          />
        ) : null}

        <div
          className="absolute inset-0 bg-[radial-gradient(circle,var(--color-canvas)_1px,transparent_1px)] bg-size-[24px_24px] opacity-6"
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 bg-linear-to-r from-black/42 via-black/20 to-black/22"
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 bg-linear-to-b from-black/10 via-transparent to-black/42"
          aria-hidden="true"
        />
      </div>

      {personalityType ? (
        <div
          className={cn(
            "transform-[translate3d(0,var(--personality-cover-type-y,0px),0)] absolute inset-x-0 top-0 flex items-center justify-end transition-transform duration-300 ease-out motion-reduce:transition-none",
            watermarkContainerClassName,
          )}
          aria-hidden="true"
        >
          <span
            className={cn(
              "transform-[scale(var(--personality-cover-type-scale,1))] hidden origin-right select-none font-black text-white/58 leading-none tracking-tighter opacity-(--personality-cover-type-opacity) drop-shadow-2xl transition-[opacity,transform] duration-300 ease-out before:content-[attr(data-profile-type)] motion-reduce:transition-none sm:block",
              watermarkClassName,
            )}
            data-profile-type={personalityType}
          />
        </div>
      ) : null}
    </>
  );
}
