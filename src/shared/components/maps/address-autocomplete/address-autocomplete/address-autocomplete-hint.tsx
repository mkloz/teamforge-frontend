import type { AddressAutocompleteRenderState } from "@/shared/components/maps/address-autocomplete/address-autocomplete/address-autocomplete-render-state";
import { cn } from "@/shared/lib/utils";

export function AddressAutocompleteHint({
  hintId,
  message,
  renderState,
}: {
  hintId: string;
  message: string | null;
  renderState: Pick<
    AddressAutocompleteRenderState,
    "hasErrorMessage" | "hintMessage"
  >;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p
        id={hintId}
        aria-live={message ? "polite" : undefined}
        role={renderState.hasErrorMessage ? "alert" : undefined}
        className={cn(
          "text-slate-muted text-xs leading-5",
          renderState.hasErrorMessage && "font-medium text-destructive",
        )}
      >
        {renderState.hintMessage}
      </p>
    </div>
  );
}
