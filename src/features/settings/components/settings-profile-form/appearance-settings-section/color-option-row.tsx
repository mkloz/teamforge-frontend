import { Check } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type {
  GridOptionBoundaryState,
  ThemeOptionStatus,
} from "./appearance-options";
import { getGridOptionBoundaryClassNames } from "./grid-option-boundary-class-names";
import { PreferenceMarkers } from "./preference-markers";
import { SwatchStrip } from "./swatch-strip";

interface ColorOptionRowProps {
  label: string;
  description: string;
  swatches: readonly string[];
  status: ThemeOptionStatus;
  boundaryState: GridOptionBoundaryState;
  onClick: () => void;
}

export function ColorOptionRow({
  label,
  description,
  swatches,
  status,
  boundaryState,
  onClick,
}: ColorOptionRowProps) {
  const optionClassName = getColorOptionRowClassName({
    ...boundaryState,
    disabled: status.disabled,
    selected: status.selected,
  });

  return (
    <button
      type="button"
      aria-pressed={status.selected}
      disabled={status.disabled}
      onClick={onClick}
      className={optionClassName}
    >
      <SwatchStrip swatches={swatches} className="h-11 w-full" />

      <span className="min-w-0">
        <span className="flex min-w-0 items-baseline gap-2">
          <span className="truncate font-black text-ink text-sm">{label}</span>
          <PreferenceMarkers
            isDefault={status.isDefault}
            selected={status.selected}
          />
        </span>
        <span className="mt-0.5 block truncate text-slate-muted text-xs leading-relaxed">
          {description}
        </span>
      </span>

      <ColorSelectionMark selected={status.selected} />
    </button>
  );
}

function getColorOptionRowClassName({
  disabled,
  selected,
  ...boundaryState
}: GridOptionBoundaryState & { disabled: boolean; selected: boolean }) {
  return cn(
    "group grid min-h-16 w-full grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-4 border-border border-b px-2 py-3 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas motion-reduce:transition-none",
    selected ? "text-ink" : "hover:bg-muted/35",
    ...getGridOptionBoundaryClassNames(boundaryState),
    disabled && "cursor-not-allowed opacity-65",
  );
}

function ColorSelectionMark({ selected }: { selected: boolean }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors duration-150",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-transparent bg-transparent text-transparent group-hover:border-border group-hover:bg-input group-hover:text-slate-muted",
      )}
    >
      {selected ? (
        <Check size={11} strokeWidth={3} aria-hidden="true" />
      ) : (
        <span className="size-1.5 rounded-full bg-current" />
      )}
    </span>
  );
}
