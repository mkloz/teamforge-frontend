import type { HomeNextMove } from "@/features/home/components/home-hero/home-hero.types";
import { HomeHeroMoveIcon } from "@/features/home/components/home-hero/home-hero-actions";
import { IconTile } from "@/shared/components/ui/icon-tile";

export function HomeHeroNextMoveHeader({
  nextMove,
}: {
  nextMove: HomeNextMove;
}) {
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <IconTile
        bordered
        size="lg"
        tone="teal"
        className="size-10 shadow-sm sm:size-12 md:size-14"
      >
        <HomeHeroMoveIcon
          kind={nextMove.kind}
          className="size-5 sm:size-5.5 md:size-6"
        />
      </IconTile>

      <div className="min-w-0 flex-1">
        <p className="font-bold text-forge-teal text-xs">{nextMove.eyebrow}</p>
        <h2 className="mt-1 max-w-3xl font-extrabold text-foreground text-lg leading-tight tracking-tight sm:text-2xl lg:text-3xl">
          {nextMove.title}
        </h2>
      </div>
    </div>
  );
}
