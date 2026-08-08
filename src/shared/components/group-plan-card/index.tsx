import { CardBody } from "@/shared/components/group-plan-card/card-body";
import { CardFooter } from "@/shared/components/group-plan-card/card-footer";
import { CardHeader } from "@/shared/components/group-plan-card/card-header";
import { CardImage } from "@/shared/components/group-plan-card/card-image";
import { CardMeta } from "@/shared/components/group-plan-card/card-meta";
import { getGroupPlanCardModel } from "@/shared/components/group-plan-card/group-plan-card-model";
import type { GroupPlanCardProps } from "@/shared/components/group-plan-card/group-plan-card-types";
import { cn } from "@/shared/lib/utils";

type GroupPlanCardVariant = NonNullable<GroupPlanCardProps["variant"]>;
type GroupPlanCardModel = ReturnType<typeof getGroupPlanCardModel>;

interface GroupPlanCardRenderState extends GroupPlanCardModel {
  contentClassName: string;
  fallbackInitial: string;
  frameClassName: string;
  isCompact: boolean;
}

export function GroupPlanCard({
  group,
  action,
  detailsLink,
  imagePriority = "auto",
  variant = "default",
}: GroupPlanCardProps) {
  const card = getGroupPlanCardRenderState(group, variant);

  return (
    <div className="group relative list-none outline-none">
      <div className={card.frameClassName}>
        <GroupPlanCardDetailsOverlay detailsLink={detailsLink} />
        <CardImage
          alt={card.imageAlt}
          media={card.imageMedia}
          priority={imagePriority}
          src={card.imageSrc}
          variant={variant}
        />

        <div className={card.contentClassName}>
          <CardHeader
            access={card.access}
            groupName={card.groupName}
            imageMedia={card.imageMedia}
            imageSrc={card.imageSrc}
            variant={variant}
          />

          <CardBody
            fitReason={card.fitReason}
            title={card.title}
            variant={variant}
          />

          <GroupPlanCardOptionalMeta
            group={group}
            distance={card.distance}
            isCompact={card.isCompact}
          />

          <div className="relative z-10 mt-auto h-px w-full bg-border/60" />

          <CardFooter
            group={group}
            fallbackInitial={card.fallbackInitial}
            isFull={card.isFull}
            action={action}
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
}

function getGroupPlanCardRenderState(
  group: GroupPlanCardProps["group"],
  variant: GroupPlanCardVariant,
): GroupPlanCardRenderState {
  const model = getGroupPlanCardModel(group);
  const isCompact = variant === "compact";

  return {
    ...model,
    contentClassName: getCardContentClassName(isCompact),
    fallbackInitial: getFallbackInitial(model.title),
    frameClassName: getCardFrameClassName(isCompact),
    isCompact,
  };
}

function getCardFrameClassName(isCompact: boolean) {
  return cn(
    // oxlint-disable-next-line tailwindcss/consistent-variant-order -- Preserve the established lift animation class order.
    "relative isolate z-10 flex w-full cursor-pointer overflow-hidden rounded-xl border-2 border-transparent bg-card shadow-soft-sm transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-button-outline dark:hover:shadow-button-outline-dark",
    isCompact ? "flex-col" : "flex-col md:flex-row",
  );
}

function getCardContentClassName(isCompact: boolean) {
  return cn(
    "flex min-w-0 grow flex-col bg-canvas",
    isCompact ? "p-4" : "p-4 md:p-4.5",
  );
}

function getFallbackInitial(title: string) {
  return title[0]?.toUpperCase() || "T";
}

function GroupPlanCardDetailsOverlay({
  detailsLink,
}: {
  detailsLink: GroupPlanCardProps["detailsLink"];
}) {
  if (!detailsLink) {
    return null;
  }

  return <div className="absolute inset-0 z-30 rounded-xl">{detailsLink}</div>;
}

function GroupPlanCardOptionalMeta({
  group,
  distance,
  isCompact,
}: {
  group: GroupPlanCardProps["group"];
  distance: GroupPlanCardModel["distance"];
  isCompact: boolean;
}) {
  if (isCompact) {
    return null;
  }

  return <CardMeta group={group} distance={distance} />;
}
