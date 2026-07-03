import { RECOMMENDED_GROUP_CARD_KEYS } from "@/features/home/components/home-skeletons/home-skeleton-constants";
import { getFirstItemTone } from "@/features/home/components/home-skeletons/home-skeleton-helpers";
import {
  HomeRecommendedGroupCardSkeleton,
  HomeSectionHeadingSkeleton,
} from "@/features/home/components/home-skeletons/shared-skeletons";

export function HomeRecommendedGroupsSkeleton() {
  return (
    <section aria-busy="true" className="flex w-full flex-col gap-5">
      <output className="sr-only">Loading recommended groups</output>
      <HomeSectionHeadingSkeleton actionWidth="w-16" />
      <div className="w-full overflow-hidden md:hidden">
        <HomeRecommendedGroupCardSkeleton className="w-full" />
      </div>
      <ul className="responsive-card-grid hidden list-none gap-5 p-0 md:grid">
        {RECOMMENDED_GROUP_CARD_KEYS.map((item, index) => (
          <li key={item} className="min-w-0">
            <HomeRecommendedGroupCardSkeleton tone={getFirstItemTone(index)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
