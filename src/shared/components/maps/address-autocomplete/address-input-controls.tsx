import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";
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

function shouldRenderAddressInputControls({
  inputValue,
  isBusy,
  mapsReady,
}: Pick<AddressInputControlsProps, "inputValue" | "isBusy" | "mapsReady">) {
  return mapsReady || isBusy || Boolean(inputValue);
}

function shouldShowBusyIndicator({
  isBusy,
  isLocating,
}: Pick<AddressInputControlsProps, "isBusy" | "isLocating">) {
  return isBusy && !isLocating;
}

function getLocateButtonLabel({
  hasCurrentAreaError,
  isLocating,
}: Pick<AddressInputControlsProps, "hasCurrentAreaError" | "isLocating">) {
  if (isLocating) {
    return "Finding your location";
  }

  return hasCurrentAreaError ? "Retry my location" : "Use my location";
}

function getLocateButtonDescriptionId({
  hasCurrentAreaError,
  messageId,
}: Pick<AddressInputControlsProps, "hasCurrentAreaError" | "messageId">) {
  return hasCurrentAreaError && messageId ? messageId : undefined;
}

function LocateAreaButton({
  disabled,
  hasCurrentAreaError,
  isLocating,
  mapsReady,
  messageId,
  showBusyIndicator,
  onUseCurrentArea,
}: Pick<
  AddressInputControlsProps,
  | "disabled"
  | "hasCurrentAreaError"
  | "isLocating"
  | "mapsReady"
  | "messageId"
  | "onUseCurrentArea"
> & {
  showBusyIndicator: boolean;
}) {
  if (!mapsReady) {
    return null;
  }

  return (
    <Button
      type="button"
      variant="accentGhost"
      size="icon-xs"
      loading={isLocating}
      onClick={onUseCurrentArea}
      disabled={disabled || showBusyIndicator}
      className={cn(
        "size-7 rounded-full",
        hasCurrentAreaError &&
          "border-destructive/30 bg-destructive/8 text-destructive focus-visible:ring-destructive hover:enabled:bg-destructive/10",
      )}
      aria-describedby={getLocateButtonDescriptionId({
        hasCurrentAreaError,
        messageId,
      })}
      aria-label={getLocateButtonLabel({ hasCurrentAreaError, isLocating })}
    >
      <LocateFixed className="size-3.5" strokeWidth={2} />
    </Button>
  );
}

function BusyIndicator({ showBusyIndicator }: { showBusyIndicator: boolean }) {
  if (!showBusyIndicator) {
    return null;
  }

  return (
    <Loader2
      className="size-3.5 animate-spin text-slate-muted"
      aria-hidden="true"
    />
  );
}

function ClearLocationButton({
  disabled,
  inputValue,
  isLocating,
  onClearLocation,
}: Pick<
  AddressInputControlsProps,
  "disabled" | "inputValue" | "isLocating" | "onClearLocation"
>) {
  const shouldReduceMotion = useReducedMotion();
  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: "easeOut" as const };

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence initial={false}>
        {inputValue ? (
          <m.div
            key="clear-location"
            initial={{
              opacity: 0,
              width: 0,
              x: shouldReduceMotion ? 0 : 10,
            }}
            animate={{ opacity: 1, width: 28, x: 0 }}
            exit={{
              opacity: 0,
              width: 0,
              x: shouldReduceMotion ? 0 : 10,
            }}
            transition={transition}
            className="shrink-0 overflow-hidden"
          >
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
          </m.div>
        ) : null}
      </AnimatePresence>
    </LazyMotion>
  );
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
  if (!shouldRenderAddressInputControls({ inputValue, isBusy, mapsReady })) {
    return null;
  }

  const showBusyIndicator = shouldShowBusyIndicator({ isBusy, isLocating });

  return (
    <div className="flex items-center gap-1 pr-0.5">
      <LocateAreaButton
        disabled={disabled}
        hasCurrentAreaError={hasCurrentAreaError}
        isLocating={isLocating}
        mapsReady={mapsReady}
        messageId={messageId}
        showBusyIndicator={showBusyIndicator}
        onUseCurrentArea={onUseCurrentArea}
      />
      <BusyIndicator showBusyIndicator={showBusyIndicator} />
      <ClearLocationButton
        disabled={disabled}
        inputValue={inputValue}
        isLocating={isLocating}
        onClearLocation={onClearLocation}
      />
    </div>
  );
}
