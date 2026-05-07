import { Loader2, LocateFixed, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface AddressInputControlsProps {
  disabled?: boolean;
  inputValue: string;
  isBusy: boolean;
  isLocating: boolean;
  mapsReady: boolean;
  onClearLocation: () => void;
  onUseCurrentArea: () => void;
}

export function AddressInputControls({
  disabled,
  inputValue,
  isBusy,
  isLocating,
  mapsReady,
  onClearLocation,
  onUseCurrentArea,
}: AddressInputControlsProps) {
  if (!mapsReady && !isBusy && !inputValue) {
    return null;
  }

  return (
    <div className="flex items-center gap-1">
      {mapsReady ? (
        <Button
          type="button"
          variant="accentGhost"
          size="icon-xs"
          onClick={onUseCurrentArea}
          disabled={disabled || isLocating}
          className="size-7 rounded-full"
          aria-label="Use my current area"
        >
          <LocateFixed size={14} />
        </Button>
      ) : null}
      {isBusy ? (
        <Loader2
          size={15}
          className="animate-spin text-slate-muted"
          aria-hidden="true"
        />
      ) : null}
      {inputValue ? (
        <Button
          type="button"
          variant="accentGhost"
          size="icon-xs"
          onClick={onClearLocation}
          disabled={disabled}
          className="size-7 rounded-full"
          aria-label="Clear location"
        >
          <X size={14} />
        </Button>
      ) : null}
    </div>
  );
}
