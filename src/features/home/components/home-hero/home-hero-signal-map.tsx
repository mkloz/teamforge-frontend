import { HomeHeroActivityWorkbenchVisual } from "@/assets/home-hero/activity-workbench";

export function HomeHeroSignalMap() {
  return (
    <div
      className="relative hidden min-h-72 overflow-hidden 2xl:block"
      aria-hidden="true"
    >
      <HomeHeroActivityWorkbenchVisual className="absolute inset-0 m-auto w-full text-foreground" />
    </div>
  );
}
