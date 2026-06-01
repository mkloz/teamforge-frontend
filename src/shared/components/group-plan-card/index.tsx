import { CardBody } from "@/shared/components/group-plan-card/card-body";
import { CardFooter } from "@/shared/components/group-plan-card/card-footer";
import { CardHeader } from "@/shared/components/group-plan-card/card-header";
import { CardImage } from "@/shared/components/group-plan-card/card-image";
import { CardMeta } from "@/shared/components/group-plan-card/card-meta";
import { getGroupPlanCardModel } from "@/shared/components/group-plan-card/group-plan-card-model";
import type { GroupPlanCardProps } from "@/shared/components/group-plan-card/group-plan-card-types";
import { cn } from "@/shared/lib/utils";

export function GroupPlanCard({
  group,
  action,
  detailsLink,
  imagePriority = "auto",
  variant = "default",
}: GroupPlanCardProps) {
  const isCompact = variant === "compact";
  const {
    access,
    distance,
    fitReason,
    groupName,
    imageAlt,
    imageMedia,
    imageSrc,
    isFull,
    title,
  } = getGroupPlanCardModel(group);
  const fallbackInitial = title[0]?.toUpperCase() || "T";

  return (
    <div className="group relative list-none outline-none">
      <div
        className={cn(
          "relative isolate z-10 flex w-full cursor-pointer overflow-hidden rounded-xl border-2 border-border bg-card transition-all duration-150 ease-out hover:-translate-y-1 hover:border-ink hover:shadow-button-outline hover:dark:border-white hover:dark:shadow-button-outline-dark",
          isCompact ? "flex-col" : "flex-col md:flex-row",
        )}
      >
        {detailsLink ? (
          <div className="absolute inset-0 z-30 rounded-xl">{detailsLink}</div>
        ) : null}
        <CardImage
          alt={imageAlt}
          media={imageMedia}
          priority={imagePriority}
          src={imageSrc}
          variant={variant}
        />

        <div
          className={cn(
            "flex min-w-0 grow flex-col bg-canvas",
            isCompact ? "p-4" : "p-4 md:p-4.5",
          )}
        >
          <CardHeader
            access={access}
            groupName={groupName}
            imageMedia={imageMedia}
            imageSrc={imageSrc}
            variant={variant}
          />

          <CardBody fitReason={fitReason} title={title} variant={variant} />

          {!isCompact ? <CardMeta group={group} distance={distance} /> : null}

          <div className="relative z-10 mt-auto h-px w-full bg-border/60" />

          <CardFooter
            group={group}
            fallbackInitial={fallbackInitial}
            isFull={isFull}
            action={action}
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
}
