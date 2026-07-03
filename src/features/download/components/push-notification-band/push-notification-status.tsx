import { ExternalLink, type LucideIcon } from "lucide-react";

import { IconTile } from "@/shared/components/ui/icon-tile";

import { getPushDeniedHelp } from "./push-copy";
import type { PushCopy, PushNotificationBandViewModel } from "./types";

interface PushNotificationStatusProps {
  copy: PushCopy;
  icon: LucideIcon;
  iconClassName: string;
  iconTone: PushNotificationBandViewModel["readiness"]["iconTone"];
  isDenied: boolean;
}

export function PushNotificationStatus({
  copy,
  icon: Icon,
  iconClassName,
  iconTone,
  isDenied,
}: PushNotificationStatusProps) {
  return (
    <div className="flex items-start gap-4">
      <IconTile
        icon={Icon}
        shape="circle"
        size="lg"
        tone={iconTone}
        className={iconClassName}
        iconClassName="size-5"
      />
      <div className="min-w-0">
        <p className="font-bold text-ink">{copy.title}</p>
        <p className="mt-0.5 max-w-lg text-pretty text-slate-muted text-sm leading-relaxed">
          {copy.body}
        </p>
        <PushDeniedHelp isDenied={isDenied} />
      </div>
    </div>
  );
}

function PushDeniedHelp({ isDenied }: { isDenied: boolean }) {
  if (!isDenied) {
    return null;
  }

  return (
    <p className="mt-2 flex items-start gap-1.5 text-slate-muted text-sm">
      <ExternalLink
        size={13}
        className="mt-0.5 shrink-0 text-spark-amber"
        aria-hidden="true"
      />
      <span>{getPushDeniedHelp()}</span>
    </p>
  );
}
