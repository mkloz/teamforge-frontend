import type { AddressAutocompleteProps } from "@/shared/components/maps/address-autocomplete/address-autocomplete-types";
import { Label } from "@/shared/components/ui/label";
import { StatusPill } from "@/shared/components/ui/status-pill";

export function AddressAutocompleteLabelRow({
  badge,
  inputId,
  label,
  required,
}: Pick<AddressAutocompleteProps, "badge" | "label" | "required"> & {
  inputId: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <Label htmlFor={inputId} className="font-semibold text-ink text-sm">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      <StatusPill
        tone="none"
        size="xs"
        className="border-slate-muted/30 bg-canvas font-semibold text-ink"
      >
        {badge}
      </StatusPill>
    </div>
  );
}
