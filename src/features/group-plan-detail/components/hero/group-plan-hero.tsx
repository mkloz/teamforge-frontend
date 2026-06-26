import { Link } from "@tanstack/react-router";
import { ArrowLeft, QrCode } from "lucide-react";
import type { ReactNode } from "react";
import {
  getHeroCoverImage,
  HeroCover,
} from "@/features/group-plan-detail/components/hero/hero-cover";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import {
  formatCost,
  formatLocation,
  formatPlanDateTime,
  getSeatsLabel,
} from "@/features/group-plan-detail/lib/group-plan-detail-formatters";
import {
  type GroupPlanDetailRouteSearch,
  getGroupPlanDetailBackLink,
} from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { QrShareDialog } from "@/shared/components/qr-share-dialog";
import { Button } from "@/shared/components/ui/button";
import { buildAppUrl } from "@/shared/lib/app-url";
import { scrollWindowToTop } from "@/shared/lib/scroll-to-top";
import { getSizedImageUrl } from "@/shared/lib/sized-image-url";
import { cn } from "@/shared/lib/utils";

interface GroupPlanHeroProps {
  detail: GroupPlanDetail;
  isCompactVisible: boolean;
  search: GroupPlanDetailRouteSearch;
}

export function GroupPlanHero({
  detail,
  isCompactVisible,
  search,
}: GroupPlanHeroProps) {
  const hero = getGroupPlanHeroViewModel(detail, search);

  return (
    <header className="flex flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="px-0">
        <Link {...hero.backLink.navigation}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          {hero.backLink.label}
        </Link>
      </Button>

      <HeroCover detail={detail} alt={`${hero.title} cover photo`}>
        <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
          <GroupLinkQrDialog
            avatarSrc={hero.groupAvatar}
            bottomText={hero.groupName}
            trigger={
              <Button
                variant="inverseGhost"
                size="icon"
                className="size-10 shrink-0 rounded-full border border-white/25 bg-white/15 text-white shadow-sm focus-visible:ring-white active:enabled:bg-white/85 active:enabled:text-forge-teal hover:enabled:border-white/65 hover:enabled:bg-white hover:enabled:text-forge-teal data-[state=open]:bg-white data-[state=open]:text-forge-teal"
                aria-label="Show group QR code"
              >
                <QrCode size={18} strokeWidth={2.25} aria-hidden="true" />
              </Button>
            }
            url={hero.groupLink}
          />
        </div>

        <h1 className="mt-4 max-w-3xl text-balance font-extrabold text-3xl text-foreground leading-none tracking-tight md:text-4xl lg:text-5xl">
          {hero.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-semibold text-foreground/85 text-sm md:text-base">
            {hero.metadata}
          </p>
        </div>

        {hero.shouldShowGroupContext ? (
          <p className="mt-2 font-medium text-foreground/70 text-sm">
            {hero.groupName} · gathering around {hero.activityTitle}
          </p>
        ) : null}
      </HeroCover>

      <GroupPlanCompactHero
        detail={detail}
        metadata={hero.metadata}
        title={hero.title}
        visible={isCompactVisible}
      />
    </header>
  );
}

function GroupLinkQrDialog({
  avatarSrc,
  bottomText,
  trigger,
  url,
}: {
  avatarSrc: string | null;
  bottomText: string;
  trigger: ReactNode;
  url: string;
}) {
  return (
    <QrShareDialog
      url={url}
      title="Group link"
      description="Scan to open this group in TeamForge. Only members can access it."
      avatarSrc={avatarSrc}
      bottomText={bottomText}
      trigger={trigger}
    />
  );
}

function GroupPlanCompactHero({
  detail,
  metadata,
  title,
  visible,
}: {
  detail: GroupPlanDetail;
  metadata: string;
  title: string;
  visible: boolean;
}) {
  const compactHero = getCompactHeroViewModel(detail);

  return (
    <div
      className={cn(
        "pointer-events-none fixed top-0 right-0 left-0 z-40 text-white md:left-14",
        "transform-[translate3d(0,var(--group-detail-compact-y,-8px),0)] opacity-(--group-detail-compact-opacity) transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
      )}
      aria-hidden={!visible}
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-5 lg:px-8">
        <div
          className={cn(
            "relative h-(--group-detail-cover-collapsed-height,72px) overflow-hidden rounded-b-md bg-canvas shadow-[0_18px_44px_rgb(0_0_0/80%)]",
            visible ? "pointer-events-auto" : "pointer-events-none",
          )}
        >
          <CompactHeroCoverImage compactHero={compactHero} visible={visible} />

          <div
            className="absolute inset-0 bg-linear-to-r from-black/92 via-black/76 to-black/52"
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/70 via-black/35 to-transparent"
            aria-hidden="true"
          />

          <button
            type="button"
            aria-label="Scroll group details to top"
            tabIndex={visible ? 0 : -1}
            onClick={scrollWindowToTop}
            className="absolute inset-0 z-10 rounded-b-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          />

          <div className="pointer-events-none relative z-20 flex size-full items-center gap-3 px-4 sm:px-5 lg:px-6">
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-base leading-tight tracking-tight [text-shadow:0_2px_12px_rgb(0_0_0/80%)] sm:text-lg">
                {title}
              </p>
              <p className="mt-0.5 truncate font-semibold text-white/90 text-xs leading-tight [text-shadow:0_1px_8px_rgb(0_0_0/85%)] sm:text-sm">
                {metadata}
              </p>
            </div>

            <div className="pointer-events-auto shrink-0">
              <CompactHeroQrDialog compactHero={compactHero} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type CompactHeroViewModel = ReturnType<typeof getCompactHeroViewModel>;

function CompactHeroCoverImage({
  compactHero,
  visible,
}: {
  compactHero: CompactHeroViewModel;
  visible: boolean;
}) {
  if (!visible || !compactHero.imageSrc) {
    return null;
  }

  return (
    <img
      src={compactHero.compactImageSrc ?? compactHero.imageSrc}
      alt=""
      loading="lazy"
      decoding="async"
      className="absolute inset-0 size-full object-cover"
    />
  );
}

function CompactHeroQrDialog({
  compactHero,
}: {
  compactHero: CompactHeroViewModel;
}) {
  return (
    <GroupLinkQrDialog
      avatarSrc={compactHero.groupAvatar}
      bottomText={compactHero.groupName}
      trigger={<CompactHeroQrButton />}
      url={compactHero.groupLink}
    />
  );
}

function CompactHeroQrButton() {
  return (
    <Button
      variant="inverseGhost"
      size="icon"
      className="size-9 shrink-0 rounded-full border border-white/25 bg-white/15 text-white shadow-sm focus-visible:ring-white active:enabled:bg-white/85 active:enabled:text-forge-teal hover:enabled:border-white/65 hover:enabled:bg-white hover:enabled:text-forge-teal data-[state=open]:bg-white data-[state=open]:text-forge-teal sm:size-10"
      aria-label="Show group QR code"
    >
      <QrCode size={18} strokeWidth={2.25} aria-hidden="true" />
    </Button>
  );
}

function getGroupPlanHeroViewModel(
  detail: GroupPlanDetail,
  search: GroupPlanDetailRouteSearch,
) {
  const title = detail.plan?.title ?? detail.activity.title;
  const groupName = detail.group.name;

  return {
    activityTitle: detail.activity.title,
    backLink: getGroupPlanDetailBackLink(detail.group.id, search),
    groupAvatar: detail.group.avatar,
    groupLink: getGroupLink(detail.group.id),
    groupName,
    metadata: getHeroMetadata(detail),
    shouldShowGroupContext: groupName !== detail.activity.title,
    title,
  };
}

function getCompactHeroViewModel(detail: GroupPlanDetail) {
  const imageSrc = getHeroCoverImage(detail);

  return {
    compactImageSrc: imageSrc ? getSizedImageUrl(imageSrc, 640) : null,
    groupAvatar: detail.group.avatar,
    groupLink: getGroupLink(detail.group.id),
    groupName: detail.group.name,
    imageSrc,
  };
}

function getHeroMetadata(detail: GroupPlanDetail) {
  const planTime = formatPlanDateTime(detail.plan?.dateTime);
  const cost = detail.plan ? formatCost(detail.plan) : null;

  return [
    getPlanTimeMetadata(planTime.full),
    formatLocation(detail),
    getCostMetadata(cost),
    getSeatsLabel(detail),
  ]
    .filter(Boolean)
    .join(" · ");
}

function getPlanTimeMetadata(planTime: string) {
  return planTime !== "Date TBD" ? planTime : "Date TBD";
}

function getCostMetadata(cost: string | null) {
  return cost && cost !== "Cost TBD" ? cost : null;
}

function getGroupLink(groupId: string) {
  return buildAppUrl(`/groups/${encodeURIComponent(groupId)}`);
}
