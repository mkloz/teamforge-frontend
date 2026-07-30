import {
  CalendarClock,
  Gamepad2,
  GraduationCap,
  Headphones,
  HeartPulse,
  Laptop,
  MapPin,
  Palette,
  Plane,
  Shapes,
  Sparkles,
  Ticket,
  Trees,
  UsersRound,
  Utensils,
  Volleyball,
} from "lucide-react";
import type { ComponentType } from "react";

import { ExploreGroupDetailsLink } from "@/features/explore/components/explore-feed/explore-group-plan-card/explore-group-details-link";
import { ExploreGroupPlanCardAction } from "@/features/explore/components/explore-feed/explore-group-plan-card/explore-group-plan-card-action";
import type { ExploreGroupPlanCardViewState } from "@/features/explore/components/explore-feed/explore-group-plan-card-view-state";
import { Image } from "@/shared/components/common/image";
import { CardMemberStack } from "@/shared/components/group-plan-card/card-member-stack";
import {
  getGroupPlanCapacityModel,
  getGroupPlanMetaModel,
} from "@/shared/components/group-plan-card/group-plan-card-model";
import {
  getExploreGroupDisplayName,
  getExploreGroupDisplayTitle,
  getExploreGroupFitReason,
} from "@/shared/lib/explore-group-presenters";
import {
  getImageMediaSrcSet,
  getImageMediaVariant,
} from "@/shared/lib/image-media";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";
import type { PlanCategory } from "@/shared/schemas/enums";

interface ExploreDiscoveryGroupCardProps {
  emphasis?: "lead" | "standard";
  group: ExploreGroup;
  imagePriority?: "auto" | "high";
  onJoin: () => void;
  viewState: ExploreGroupPlanCardViewState;
}

const CATEGORY_PRESENTATION: Record<
  PlanCategory,
  { icon: ComponentType<{ className?: string }>; label: string }
> = {
  ARTS: { icon: Palette, label: "Arts" },
  FOOD: { icon: Utensils, label: "Food" },
  GAMING: { icon: Gamepad2, label: "Gaming" },
  LEARNING: { icon: GraduationCap, label: "Learning" },
  MUSIC: { icon: Headphones, label: "Music" },
  OTHER: { icon: Shapes, label: "Other" },
  OUTDOORS: { icon: Trees, label: "Outdoors" },
  SOCIAL: { icon: Sparkles, label: "Social" },
  SPORTS: { icon: Volleyball, label: "Sports" },
  TECH: { icon: Laptop, label: "Tech" },
  TRAVEL: { icon: Plane, label: "Travel" },
  WELLNESS: { icon: HeartPulse, label: "Wellness" },
};

export function ExploreDiscoveryGroupCard({
  emphasis = "standard",
  group,
  imagePriority = "auto",
  onJoin,
  viewState,
}: ExploreDiscoveryGroupCardProps) {
  const isLead = emphasis === "lead";
  const title = getExploreGroupDisplayTitle(group);
  const groupName = getExploreGroupDisplayName(group);
  const fitReason = getExploreGroupFitReason(group);
  const category = getCategoryPresentation(group);
  const CategoryIcon = category.icon;
  const imageSrc =
    getImageMediaVariant(
      group.avatarMedia,
      "cover800",
      getSizedImageUrl(group.avatar, 800),
    ) ?? undefined;
  const { currentSize, spotsLeft } = getGroupPlanCapacityModel(group);
  const { formattedDate, isFree, isOnline, locationLabel } =
    getGroupPlanMetaModel(group, group.activity.city ?? undefined);
  const fitScore = formatFitScore(group.compatibility.total);

  return (
    <article className="group relative size-full min-h-92 overflow-hidden rounded-[1.25rem] border border-border/75 bg-card text-foreground transition-colors duration-200 hover:border-forge-teal/45 sm:min-h-96 md:min-h-0">
      <div className="absolute inset-0 z-10">
        <ExploreGroupDetailsLink group={group} />
      </div>

      <Image
        src={imageSrc}
        srcSet={getImageMediaSrcSet(group.avatarMedia, imageSrc)}
        sizes={
          isLead
            ? "(min-width: 768px) 58vw, 100vw"
            : "(min-width: 768px) 42vw, 100vw"
        }
        alt={title}
        fetchPriority={imagePriority === "high" ? "high" : "auto"}
        loading={imagePriority === "high" ? "eager" : "lazy"}
        showLoadingState={imagePriority !== "high"}
        wrapperClassName="absolute inset-0"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
        noImageComponent={<ExploreImageFallback icon={CategoryIcon} />}
        fallbackComponent={<ExploreImageFallback icon={CategoryIcon} />}
      />

      <div
        className="pointer-events-none absolute inset-0 bg-black/20"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-white">
          <CategoryIcon className="size-4" aria-hidden="true" />
          <span className="font-bold text-xs">{category.label}</span>
        </div>

        <div className="text-right text-white [text-shadow:0_1px_8px_rgb(0_0_0/0.75)]">
          <span className="block font-black text-lg tabular-nums leading-none">
            {fitScore}%
          </span>
          <span className="mt-1 block font-semibold text-[0.65rem] text-white/75">
            fit
          </span>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 border-white/12 border-t bg-black/55 p-4 backdrop-blur-sm backdrop-saturate-150 sm:p-5">
        <p className="truncate font-semibold text-white/70 text-xs">
          {groupName}
        </p>
        <h3
          className={cn(
            "mt-1 line-clamp-2 font-black text-white leading-[1.02] tracking-[-0.035em]",
            isLead ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl",
          )}
        >
          {title}
        </h3>

        <p
          className={cn(
            "mt-2 line-clamp-2 font-medium text-sm text-white/72 leading-relaxed",
            !isLead && "md:line-clamp-1",
          )}
        >
          {fitReason}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 border-white/12 border-t pt-3 text-white/78 text-xs">
          <ExploreMetaLine icon={CalendarClock}>
            {formattedDate}
          </ExploreMetaLine>
          <ExploreMetaLine icon={isOnline ? Laptop : MapPin}>
            {locationLabel}
          </ExploreMetaLine>
          <ExploreMetaLine icon={UsersRound}>
            {getCapacityLabel(currentSize, spotsLeft)}
          </ExploreMetaLine>
          <ExploreMetaLine icon={Ticket}>
            {isFree ? "Free" : "Paid"}
          </ExploreMetaLine>
        </div>

        <div className="pointer-events-none mt-4 flex min-w-0 items-center justify-between gap-3">
          <CardMemberStack
            group={group}
            fallbackInitial={title[0]?.toUpperCase() || "T"}
            variant="compact"
          />
          <div className="pointer-events-auto relative z-30 shrink-0">
            <ExploreGroupPlanCardAction
              isCompact
              onJoin={onJoin}
              viewState={viewState}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

function ExploreMetaLine({
  children,
  icon: Icon,
}: {
  children: string;
  icon: typeof CalendarClock;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-forge-teal" aria-hidden="true" />
      <span className="truncate font-semibold">{children}</span>
    </div>
  );
}

function ExploreImageFallback({
  icon: Icon,
}: {
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="grid size-full place-items-center bg-primary/8 text-forge-teal/55">
      <Icon className="size-16" aria-hidden="true" />
    </div>
  );
}

function getCategoryPresentation(group: ExploreGroup) {
  return CATEGORY_PRESENTATION[group.plan?.category ?? "OTHER"];
}

function getCapacityLabel(currentSize: number, spotsLeft: number | null) {
  if (spotsLeft === null) {
    return `${currentSize} joined`;
  }

  if (spotsLeft === 0) {
    return `${currentSize} joined · Full`;
  }

  return `${currentSize} joined · ${spotsLeft} left`;
}

function formatFitScore(score: number) {
  const normalizedScore = score <= 1 ? score * 100 : score;

  return Math.max(0, Math.min(100, Math.round(normalizedScore)));
}
