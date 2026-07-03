import { Check, type LucideIcon } from "lucide-react";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";
import type {
  GridOptionBoundaryState,
  ThemeOptionStatus,
} from "./appearance-options";
import { getGridOptionBoundaryClassNames } from "./grid-option-boundary-class-names";
import { PreferenceMarkers } from "./preference-markers";

interface StyleOptionRowProps {
  label: string;
  description: string;
  icon: LucideIcon;
  status: ThemeOptionStatus;
  boundaryState: GridOptionBoundaryState;
  onClick: () => void;
}

export function StyleOptionRow({
  label,
  description,
  icon: Icon,
  status,
  boundaryState,
  onClick,
}: StyleOptionRowProps) {
  const optionClassName = getStyleOptionRowClassName({
    ...boundaryState,
    disabled: status.disabled,
    selected: status.selected,
  });
  const iconClassName = getStyleOptionIconClassName(status.selected);

  return (
    <button
      type="button"
      aria-pressed={status.selected}
      disabled={status.disabled}
      onClick={onClick}
      className={optionClassName}
    >
      <IconTile
        icon={Icon}
        tone={status.selected ? "teal" : "neutral"}
        size="lg"
        bordered
        className={iconClassName}
        iconClassName="size-4"
      />

      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate font-black text-inherit text-sm">
              {label}
            </span>
            <PreferenceMarkers isDefault={status.isDefault} selected={false} />
          </span>
          {status.selected ? (
            <Check
              className="size-4 shrink-0 text-primary"
              strokeWidth={2.5}
              aria-hidden="true"
            />
          ) : null}
        </span>
        <span className="mt-1 block truncate text-slate-muted text-xs leading-relaxed">
          {description}
        </span>
      </span>
    </button>
  );
}

function getStyleOptionRowClassName({
  disabled,
  selected,
  ...boundaryState
}: GridOptionBoundaryState & { disabled: boolean; selected: boolean }) {
  return cn(
    "group flex w-full items-center gap-3 border-border border-b px-2 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:transition-none",
    selected ? "text-ink" : "text-slate-muted hover:bg-muted/35 hover:text-ink",
    ...getGridOptionBoundaryClassNames(boundaryState),
    disabled && "cursor-not-allowed opacity-65",
  );
}

function getStyleOptionIconClassName(selected: boolean) {
  return cn(
    "transition-colors duration-150",
    selected
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-input text-slate-muted group-hover:text-ink",
  );
}
