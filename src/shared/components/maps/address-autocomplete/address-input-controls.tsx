import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";
import { LocateFixed, X } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { cn } from "@/shared/lib/utils";

interface AddressInputControlsProps {
  disabled?: boolean;
  hasCurrentAreaError: boolean;
  inputValue: string;
  isBusy: boolean;
  isLocating: boolean;
  geolocationAvailable: boolean;
  messageId?: string;
  onClearLocation: () => void;
  onUseCurrentArea: () => void;
}

function shouldRenderAddressInputControls({
  inputValue,
  isBusy,
  geolocationAvailable,
}: Pick<
  AddressInputControlsProps,
  "geolocationAvailable" | "inputValue" | "isBusy"
>) {
  return geolocationAvailable || isBusy || Boolean(inputValue);
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
  geolocationAvailable,
  messageId,
  showBusyIndicator,
  onUseCurrentArea,
}: Pick<
  AddressInputControlsProps,
  | "disabled"
  | "hasCurrentAreaError"
  | "isLocating"
  | "geolocationAvailable"
  | "messageId"
  | "onUseCurrentArea"
> & {
  showBusyIndicator: boolean;
}) {
  if (!geolocationAvailable) {
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
          "border-destructive/30 bg-destructive-soft text-destructive focus-visible:ring-destructive hover:enabled:brightness-110",
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

  return <Spinner className="size-3.5 text-slate-muted" aria-hidden="true" />;
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
  geolocationAvailable,
  hasCurrentAreaError,
  inputValue,
  isBusy,
  isLocating,
  messageId,
  onClearLocation,
  onUseCurrentArea,
}: AddressInputControlsProps) {
  if (
    !shouldRenderAddressInputControls({
      geolocationAvailable,
      inputValue,
      isBusy,
    })
  ) {
    return null;
  }

  const showBusyIndicator = shouldShowBusyIndicator({ isBusy, isLocating });

  return (
    <div className="flex items-center gap-1 pr-0.5">
      <LocateAreaButton
        disabled={disabled}
        geolocationAvailable={geolocationAvailable}
        hasCurrentAreaError={hasCurrentAreaError}
        isLocating={isLocating}
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
