import { Avatar } from "@/shared/components/common/avatar";
import type { ImageMedia } from "@/shared/schemas/media";

interface GroupIdentityHeaderCardProps {
  activityTitle: string | null;
  avatarMedia?: ImageMedia | null;
  avatarSrc: string | null;
  displayName: string;
}

export function GroupIdentityHeaderCard({
  activityTitle,
  avatarMedia,
  avatarSrc,
  displayName,
}: GroupIdentityHeaderCardProps) {
  return (
    <div
      className="transform-[translate3d(0,var(--collapsible-panel-original-card-y,0px),0)] flex items-center gap-4 opacity-(--collapsible-panel-original-card-opacity,1) transition-[opacity,transform] duration-300 ease-out [pointer-events:var(--collapsible-panel-original-pointer-events,auto)] [transition-delay:var(--collapsible-panel-original-card-delay,0ms)] motion-reduce:transition-none"
      data-collapsible-panel-original-card=""
    >
      <div className="group pointer-events-auto shrink-0">
        <Avatar
          src={avatarSrc}
          media={avatarSrc ? avatarMedia : null}
          name={displayName}
          alt={`${displayName} avatar`}
          shape="rounded"
          className="size-16 rounded-xl bg-muted ring-1 ring-border/70"
          fallbackClassName="text-base"
          imageClassName="transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="wrap-break-word line-clamp-2 font-bold text-ink text-xl leading-tight tracking-tight">
          {displayName}
        </h2>

        {activityTitle && activityTitle.trim() !== displayName.trim() ? (
          <p className="wrap-break-word mt-2 line-clamp-2 font-semibold text-muted-foreground text-xs leading-snug">
            {activityTitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
