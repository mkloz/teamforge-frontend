import { HomeHeroView } from "@/features/home/components/home-hero/home-hero-view";
import { useHomeHeroData } from "@/features/home/components/home-hero/use-home-hero-data";
import { HomeHeroSkeleton } from "@/features/home/components/home-skeletons";

export function HomeHero() {
  const { heroData, isLoading } = useHomeHeroData();

  if (isLoading) {
    return <HomeHeroSkeleton />;
  }

  return <HomeHeroView {...heroData} />;
}
