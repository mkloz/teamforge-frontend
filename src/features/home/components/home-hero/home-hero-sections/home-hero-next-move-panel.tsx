import type { HomeNextMove } from "@/features/home/components/home-hero/home-hero.types";
import {
  PrimaryAction,
  SecondaryAction,
} from "@/features/home/components/home-hero/home-hero-actions";
import { HomeHeroNextMoveHeader } from "@/features/home/components/home-hero/home-hero-sections/home-hero-next-move-header";
import { HomeHeroSignalMap } from "@/features/home/components/home-hero/home-hero-signal-map";

export function HomeHeroNextMovePanel({
  nextMove,
}: {
  nextMove: HomeNextMove;
}) {
  return (
    <div className="relative grid gap-4 overflow-hidden rounded-xl px-4 py-4 sm:gap-6 sm:px-5 sm:py-5 lg:px-6 2xl:min-h-80 2xl:grid-cols-[minmax(0,1fr)_minmax(17rem,20rem)] 2xl:items-center 2xl:gap-10">
      <div className="absolute inset-y-0 left-0 w-full [background:linear-gradient(112deg,color-mix(in_srgb,var(--color-forge-teal)_13%,transparent),color-mix(in_srgb,var(--color-forge-teal)_4%,transparent)_48%,transparent_76%)]" />
      <div className="absolute inset-y-5 left-2 w-px rounded-full bg-forge-teal/55 sm:inset-y-6 sm:left-3" />

      <div className="relative z-10 flex min-w-0 flex-col gap-4 pl-2 sm:gap-5 sm:pl-4">
        <HomeHeroNextMoveHeader nextMove={nextMove} />

        <p className="max-w-xl font-medium text-muted-foreground text-xs leading-relaxed lg:text-base">
          {nextMove.body}
        </p>

        <div className="flex flex-row flex-wrap gap-2 sm:gap-3">
          <PrimaryAction move={nextMove} />
          <SecondaryAction move={nextMove} />
        </div>
      </div>

      <HomeHeroSignalMap />
    </div>
  );
}
