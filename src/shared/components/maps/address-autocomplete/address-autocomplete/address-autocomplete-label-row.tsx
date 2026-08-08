import type { AddressAutocompleteProps } from "@/shared/components/maps/address-autocomplete/address-autocomplete-types";
import { Label } from "@/shared/components/ui/label";
import { StatusPill } from "@/shared/components/ui/status-pill";

export function AddressAutocompleteLabelRow({
  badge,
  badgeAction,
  inputId,
  label,
  required,
}: Pick<
  AddressAutocompleteProps,
  "badge" | "badgeAction" | "label" | "required"
> & {
  inputId: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <Label htmlFor={inputId} className="font-semibold text-ink text-sm">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {badgeAction ? (
        <button
          type="button"
          aria-label={badgeAction.ariaLabel}
          title={badge}
          className="inline-flex max-w-48 shrink-0 items-center truncate rounded-full border border-border/55 bg-primary/8 px-2 py-0.5 font-semibold text-foreground text-xs leading-none transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-soft-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 active:shadow-none motion-reduce:transform-none"
          onClick={badgeAction.onClick}
        >
          {badge}
        </button>
      ) : (
        <StatusPill
          tone="none"
          size="xs"
          className="border-slate-muted/30 bg-canvas font-semibold text-ink"
        >
          {badge}
        </StatusPill>
      )}
    </div>
  );
}
