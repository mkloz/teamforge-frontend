import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, type LucideIcon, Users, Wifi } from "lucide-react";

import { ICON_MAP } from "@/features/forge/components/steps/step1-activity/activity-icon-map";
import {
  buildCategoryFitHighlights,
  buildCrossCategoryTemplateSuggestions,
  type SuggestedTemplate,
} from "@/features/forge/lib/forge-template-suggestions";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { PlanCover } from "@/shared/components/common/plan-cover";
import {
  EDITORIAL_BENTO_SLOTS,
  EditorialBentoGrid,
  EditorialBentoItem,
  type EditorialBentoSlot,
  getEditorialBentoSlot,
} from "@/shared/components/ui/bento-grid";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface ForgeTemplateRecommendationsProps {
  onSelect: (templateId: string) => void;
}

export function ForgeTemplateRecommendations({
  onSelect,
}: ForgeTemplateRecommendationsProps) {
  const currentUser = useQuery(currentUserQueryOptions());

  if (currentUser.isPending) {
    return <ForgeTemplateRecommendationsSkeleton />;
  }

  const recommendations = buildCrossCategoryTemplateSuggestions(
    currentUser.data,
    RECOMMENDATION_LIMIT,
  );
  const isPersonalized =
    buildCategoryFitHighlights(currentUser.data).length > 0;

  return (
    <section aria-labelledby="forge-recommendations-title">
      <div>
        <h2
          id="forge-recommendations-title"
          className="text-balance font-black text-2xl text-foreground leading-tight"
        >
          {isPersonalized ? "Recommended for you" : "Explore activity ideas"}
        </h2>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          {isPersonalized
            ? "Ready-to-use templates from different categories, ranked using your profile."
            : "Ready-to-use templates from across TeamForge."}
        </p>
      </div>

      <RecommendationMosaic
        recommendations={recommendations}
        onSelect={onSelect}
      />
    </section>
  );
}

function RecommendationMosaic({
  onSelect,
  recommendations,
}: {
  onSelect: (templateId: string) => void;
  recommendations: SuggestedTemplate[];
}) {
  return (
    <EditorialBentoGrid className="mt-5">
      {recommendations.map((recommendation, index) => {
        const slot = getEditorialBentoSlot(index);

        return (
          <EditorialBentoItem key={recommendation.id} slot={slot}>
            <ForgeTemplateRecommendationTile
              layout={RECOMMENDATION_PRESENTATION[slot]}
              recommendation={recommendation}
              onSelect={onSelect}
            />
          </EditorialBentoItem>
        );
      })}
    </EditorialBentoGrid>
  );
}

function ForgeTemplateRecommendationTile({
  layout,
  onSelect,
  recommendation,
}: {
  layout: RecommendationEditorialLayout;
  onSelect: (templateId: string) => void;
  recommendation: SuggestedTemplate;
}) {
  const CategoryIcon = ICON_MAP[recommendation.categoryId] ?? ICON_MAP.fallback;
  const isOnline = recommendation.template.locationType === "ONLINE";

  return (
    <button
      type="button"
      onClick={() => onSelect(recommendation.id)}
      className="group relative size-full min-w-0 overflow-hidden rounded-2xl bg-muted text-left ring-1 ring-border/35 transition duration-200 hover:ring-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <PlanCover
        value={recommendation.coverImage}
        alt=""
        className="absolute inset-0 size-full"
        imageClassName="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        fallbackComponent={<TemplateCoverFallback icon={CategoryIcon} />}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-black/20 transition-colors group-hover:from-black/95" />

      {isOnline ? (
        <span className="absolute top-3 left-3 z-10 flex size-7 items-center justify-center rounded-full bg-black/60 text-white/90 ring-1 ring-white/12 backdrop-blur-sm">
          <Wifi className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Online activity</span>
        </span>
      ) : null}

      <ArrowUpRight
        className="absolute top-3 right-3 z-10 size-4 text-white/85 drop-shadow transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 bottom-0 z-10 flex min-w-0 flex-col gap-1 p-3 pt-10 sm:p-4 sm:pt-12">
        <h3
          className={cn(
            "line-clamp-2 font-bold text-white leading-snug drop-shadow-sm",
            layout.titleClassName,
          )}
        >
          {recommendation.title}
        </h3>
        {layout.showDescription ? (
          <p className="hidden text-white/78 text-xs leading-relaxed lg:line-clamp-1">
            {recommendation.description}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-white/75 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" aria-hidden="true" />
            {getGroupSizeText(recommendation)}
          </span>
          {layout.showCategory ? (
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <CategoryIcon className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{recommendation.categoryLabel}</span>
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function TemplateCoverFallback({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div className="flex size-full items-center justify-center bg-primary/8">
      <Icon className="size-10 text-primary/55" aria-hidden="true" />
    </div>
  );
}

function ForgeTemplateRecommendationsSkeleton() {
  return (
    <section aria-busy="true" aria-labelledby="forge-recommendations-title">
      <output className="sr-only">Loading activity recommendations</output>
      <Skeleton className="h-7 w-56" />
      <Skeleton className="mt-2 h-4 w-full max-w-lg" />

      <EditorialBentoGrid className="mt-5">
        {EDITORIAL_BENTO_SLOTS.map((slot) => (
          <EditorialBentoItem key={slot} slot={slot}>
            <RecommendationTileSkeleton />
          </EditorialBentoItem>
        ))}
      </EditorialBentoGrid>
    </section>
  );
}

function RecommendationTileSkeleton() {
  return (
    <div className="relative size-full min-w-0 overflow-hidden rounded-2xl">
      <Skeleton shape="square" className="absolute inset-0 size-full" />
      <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
        <Skeleton className="h-4 w-3/5 rounded-md" />
        <div className="mt-2 flex gap-2">
          <Skeleton shape="pill" className="h-3 w-16" />
          <Skeleton shape="pill" className="hidden h-3 w-14 lg:block" />
        </div>
      </div>
    </div>
  );
}

interface RecommendationEditorialLayout {
  showCategory: boolean;
  showDescription: boolean;
  titleClassName: string;
}

function getGroupSizeText(recommendation: SuggestedTemplate) {
  const { template } = recommendation;

  if (
    template.recommendedMinimumGroupSize !== null &&
    template.recommendedMaximumGroupSize !== null
  ) {
    return `${template.recommendedMinimumGroupSize}–${template.recommendedMaximumGroupSize} people`;
  }

  return template.fixedSize === null
    ? "Flexible group"
    : `${template.fixedSize} people`;
}

const RECOMMENDATION_LIMIT = 8;

const RECOMMENDATION_PRESENTATION = {
  lead: {
    showCategory: true,
    showDescription: true,
    titleClassName: "text-base sm:text-lg",
  },
  "center-top": {
    showCategory: false,
    showDescription: true,
    titleClassName: "text-sm sm:text-base",
  },
  "upper-right": {
    showCategory: false,
    showDescription: false,
    titleClassName: "text-sm sm:text-base",
  },
  "right-rail": {
    showCategory: false,
    showDescription: false,
    titleClassName: "text-sm sm:text-base",
  },
  "lower-left": {
    showCategory: false,
    showDescription: false,
    titleClassName: "text-sm",
  },
  "lower-left-secondary": {
    showCategory: false,
    showDescription: false,
    titleClassName: "text-sm",
  },
  "lower-right": {
    showCategory: true,
    showDescription: true,
    titleClassName: "text-sm sm:text-base",
  },
  "center-bottom": {
    showCategory: true,
    showDescription: true,
    titleClassName: "text-base",
  },
} satisfies Record<EditorialBentoSlot, RecommendationEditorialLayout>;
