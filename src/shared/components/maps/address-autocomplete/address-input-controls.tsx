import { Loader2, LocateFixed, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface AddressInputControlsProps {
  disabled?: boolean;
  hasCurrentAreaError: boolean;
  inputValue: string;
  isBusy: boolean;
  isLocating: boolean;
  mapsReady: boolean;
  messageId?: string;
  onClearLocation: () => void;
  onUseCurrentArea: () => void;
}

export function AddressInputControls({
  disabled,
  hasCurrentAreaError,
  inputValue,
  isBusy,
  isLocating,
  mapsReady,
  messageId,
  onClearLocation,
  onUseCurrentArea,
}: AddressInputControlsProps) {
  if (!mapsReady && !isBusy && !inputValue) {
    return null;
  }

  const locateButtonLabel = isLocating
    ? "Finding your location"
    : hasCurrentAreaError
      ? "Retry my location"
      : "Use my location";
  const showBusyIndicator = isBusy && !isLocating;
  const locateButtonDisabled = disabled || showBusyIndicator;

  return (
    <div className="flex items-center gap-1 pr-1">
      {mapsReady ? (
        <Button
          type="button"
          variant="accentGhost"
          size="icon-xs"
          loading={isLocating}
          onClick={onUseCurrentArea}
          disabled={locateButtonDisabled}
          className={cn(
            "size-7 rounded-full",
            hasCurrentAreaError &&
              "border-destructive/30 bg-destructive/8 text-destructive focus-visible:ring-destructive hover:enabled:bg-destructive/10",
          )}
          aria-describedby={
            hasCurrentAreaError && messageId ? messageId : undefined
          }
          aria-label={locateButtonLabel}
        >
          <LocateFixed className="size-3.5" strokeWidth={2} />
        </Button>
      ) : null}
      {showBusyIndicator ? (
        <Loader2
          className="size-3.5 animate-spin text-slate-muted"
          aria-hidden="true"
        />
      ) : null}
      {inputValue ? (
        <Button
          type="button"
          variant="accentGhost"
          size="icon-xs"
          onClick={onClearLocation}
          disabled={disabled || isLocating}
          className="size-7 rounded-full"
          aria-label="Clear location"
        >
          <X className="size-3.5" strokeWidth={2} />
        </Button>
      ) : null}
    </div>
  );
}
