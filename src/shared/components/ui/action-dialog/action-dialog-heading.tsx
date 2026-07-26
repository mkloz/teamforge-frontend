import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { cn } from "@/shared/lib/utils";
import type { ActionDialogToneConfig } from "./action-dialog-tone";

export function ActionDialogHeading({
  config,
  description,
  eyebrow,
  icon,
  Icon,
  title,
}: {
  config: ActionDialogToneConfig;
  description: ReactNode;
  eyebrow: string | undefined;
  icon: ReactNode;
  Icon: LucideIcon;
  title: ReactNode;
}) {
  return (
    <div className="px-6 pt-6 pb-4">
      <AlertDialogHeader className="relative pr-9 text-left">
        {eyebrow ? (
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn("shrink-0", config.iconClassName)}
              aria-hidden="true"
            >
              {icon ?? <Icon className="size-4" strokeWidth={1.8} />}
            </span>
            <span className="block font-semibold text-slate-muted text-xs">
              {eyebrow}
            </span>
            <span
              className={cn(
                "h-px min-w-8 flex-1 border-t",
                config.ruleClassName,
              )}
              aria-hidden="true"
            />
          </span>
        ) : null}
        <AlertDialogTitle
          className={cn(
            "max-w-80 text-balance font-black text-ink text-xl leading-tight",
            eyebrow && "mt-3",
          )}
        >
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="mt-2 max-w-88 text-sm leading-relaxed">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>
    </div>
  );
}
