import { cn } from "@/shared/lib/utils";
import type { ActionDialogProps } from "./action-dialog.types";
import { hasActionDialogDetails } from "./action-dialog-state";
import type { ActionDialogToneConfig } from "./action-dialog-tone";

export function ActionDialogDetails({
  config,
  details,
}: {
  config: ActionDialogToneConfig;
  details: ActionDialogProps["details"];
}) {
  if (!hasActionDialogDetails(details)) {
    return null;
  }

  return (
    <div className="mx-6 mb-4 border-border/60 border-t pt-4">
      <p className={cn("font-semibold text-xs", config.iconClassName)}>
        {config.detailLabel}
      </p>
      <ul className="mt-2 grid gap-1.5">
        {details.map((detail) => (
          <li key={detail} className="text-slate-muted text-sm leading-relaxed">
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
}
