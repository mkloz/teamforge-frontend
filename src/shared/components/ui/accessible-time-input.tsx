import type { Time } from "@internationalized/date";
import { Clock } from "lucide-react";
import {
  type FocusEvent,
  type KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button as AriaButton,
  DateInput as AriaDateInput,
  DateSegment,
  Dialog,
  I18nProvider,
  Popover,
  TimeField,
} from "react-aria-components";

import { Button } from "@/shared/components/ui/button";
import {
  parseTimeValue,
  serializeTimeValue,
} from "@/shared/components/ui/date-time-picker/value-adapters";
import {
  getInitialTimeDraft,
  getTimeAdjustmentMessage,
  isTimeWithinRange,
  resolveTimeCommitValue,
} from "@/shared/components/ui/time-input/time-value";
import type { TimeInputProps } from "@/shared/components/ui/time-input/types";
import { cn } from "@/shared/lib/utils";

const OVERLAY_CONTENT_SELECTOR = [
  '[data-slot="dialog-content"]',
  '[data-slot="drawer-content"]',
  '[data-slot="sheet-content"]',
].join(",");

export function AccessibleTimeInput({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  clearable = true,
  disabled,
  form,
  id,
  intervalMinutes = 5,
  max,
  min,
  name,
  onBlur,
  onFocus,
  onValueChange,
  placeholder = "Select time",
  readOnly,
  required,
  value,
  wrapperClassName,
}: TimeInputProps) {
  const triggerActionLabelId = useId();
  const dialogId = useId();
  const minValue = useMemo(() => parseTimeValue(min), [min]);
  const maxValue = useMemo(() => parseTimeValue(max), [max]);
  const committedValue = useMemo(() => {
    const parsedValue = parseTimeValue(value);
    return parsedValue && isTimeWithinRange(parsedValue, minValue, maxValue)
      ? parsedValue
      : null;
  }, [maxValue, minValue, value]);
  const fieldRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeFocusTargetRef = useRef<HTMLElement | null>(null);
  const [displayValue, setDisplayValue] = useState<Time | null>(committedValue);
  const [open, setOpen] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);
  const invalid = ariaInvalid === true || ariaInvalid === "true";
  const adjustmentMessage = getTimeAdjustmentMessage(
    displayValue,
    intervalMinutes,
    minValue,
    maxValue,
  );
  const resolvedDraftValue = resolveTimeCommitValue(
    displayValue,
    intervalMinutes,
    minValue,
    maxValue,
  );

  useEffect(() => {
    if (!open) {
      setDisplayValue(committedValue);
    }
  }, [committedValue, open]);

  useEffect(() => {
    setPortalContainer(
      fieldRef.current?.closest(OVERLAY_CONTENT_SELECTOR) ?? null,
    );
  }, []);

  useEffect(() => {
    const focusTarget = closeFocusTargetRef.current;
    if (!open && focusTarget) {
      closeFocusTargetRef.current = null;
      if (focusTarget.isConnected) {
        focusTarget.focus({ preventScroll: true });
      }
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function closeBeforeParentOverlay(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      setDisplayValue(committedValue);
      setOpen(false);
    }

    window.addEventListener("keydown", closeBeforeParentOverlay, true);
    return () => {
      window.removeEventListener("keydown", closeBeforeParentOverlay, true);
    };
  }, [committedValue, open]);

  function openPicker(opener: HTMLElement | null) {
    if (disabled || readOnly || open) {
      return;
    }
    closeFocusTargetRef.current = opener ?? triggerRef.current;
    setDisplayValue(
      getInitialTimeDraft(
        committedValue,
        intervalMinutes,
        new Date(),
        minValue,
        maxValue,
      ),
    );
    setOpen(true);
  }

  function closePicker() {
    setDisplayValue(committedValue);
    setOpen(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      openPicker(triggerRef.current);
      return;
    }
    closePicker();
  }

  function handleFieldKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey && event.key === "ArrowDown") {
      event.preventDefault();
      openPicker(event.target instanceof HTMLElement ? event.target : null);
    }
  }

  function handleValueChange(nextValue: Time | null) {
    if (disabled || readOnly) {
      return;
    }
    setDisplayValue(nextValue);
    if (
      !open &&
      nextValue &&
      isTimeWithinRange(nextValue, minValue, maxValue)
    ) {
      onValueChange(serializeTimeValue(nextValue));
    }
  }

  function handleBlur(event: FocusEvent) {
    if (
      !open &&
      (!displayValue || !isTimeWithinRange(displayValue, minValue, maxValue))
    ) {
      setDisplayValue(committedValue);
    }
    onBlur?.(event);
  }

  function commitDraft() {
    if (
      disabled ||
      readOnly ||
      !displayValue ||
      !isTimeWithinRange(displayValue, minValue, maxValue)
    ) {
      return;
    }
    const snappedValue = resolveTimeCommitValue(
      displayValue,
      intervalMinutes,
      minValue,
      maxValue,
    );
    if (!snappedValue) {
      return;
    }
    setDisplayValue(snappedValue);
    setOpen(false);
    onValueChange(serializeTimeValue(snappedValue));
  }

  function clearValue() {
    if (disabled || readOnly) {
      return;
    }
    setDisplayValue(null);
    setOpen(false);
    onValueChange("");
  }

  const fieldProps = {
    "aria-describedby": ariaDescribedBy,
    "aria-label": ariaLabelledBy ? undefined : (ariaLabel ?? placeholder),
    "aria-labelledby": ariaLabelledBy,
    granularity: "minute" as const,
    hourCycle: 24 as const,
    isDisabled: disabled,
    isInvalid: invalid,
    isReadOnly: readOnly,
    isRequired: required,
    maxValue: maxValue ?? undefined,
    minValue: minValue ?? undefined,
    shouldForceLeadingZeros: true,
  };

  return (
    <I18nProvider locale="en-GB">
      <TimeField
        {...fieldProps}
        ref={fieldRef}
        id={id}
        value={displayValue}
        onBlur={handleBlur}
        onChange={handleValueChange}
        onFocus={onFocus}
        onKeyDown={handleFieldKeyDown}
        className={cn("relative w-full", wrapperClassName)}
      >
        {form ? (
          <input
            aria-hidden="true"
            className="pointer-events-none absolute size-px opacity-0"
            disabled={disabled}
            form={form}
            name={name}
            onChange={() => undefined}
            onInvalid={(event) => {
              event.preventDefault();
              fieldRef.current
                ?.querySelector<HTMLElement>('[role="spinbutton"]')
                ?.focus({ preventScroll: true });
            }}
            readOnly={readOnly}
            required={required}
            tabIndex={-1}
            type="time"
            value={serializeTimeValue(committedValue)}
          />
        ) : name ? (
          <input
            type="hidden"
            disabled={disabled}
            form={form}
            name={name}
            value={serializeTimeValue(committedValue)}
          />
        ) : null}
        {ariaLabelledBy ? (
          <span id={triggerActionLabelId} className="sr-only">
            Open time picker
          </span>
        ) : null}
        <div
          data-disabled={disabled || undefined}
          data-invalid={invalid || undefined}
          data-readonly={readOnly || undefined}
          className={cn(
            "group/time-field flex h-(--control-height) w-full min-w-0 items-center rounded-lg border border-control-border bg-input px-3.5 py-2 font-medium font-sans text-ink text-sm shadow-field outline-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out focus-within:ring-1 focus-within:ring-foreground focus-within:ring-offset-2 focus-within:ring-offset-background hover:shadow-field-hover data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted/70 data-[invalid]:bg-destructive-soft data-[disabled]:text-slate-muted data-[disabled]:opacity-70 data-[invalid]:ring-1 data-[invalid]:ring-destructive/35 motion-reduce:transition-none [@media(pointer:coarse)]:text-base!",
            className,
          )}
        >
          <AriaDateInput className="flex min-w-0 flex-1 items-center gap-0.5">
            {(segment) => (
              <DateSegment
                segment={segment}
                className="rounded px-0.5 tabular-nums outline-none data-[focused]:bg-foreground data-[focused]:text-background data-[placeholder]:text-slate-muted/70"
              />
            )}
          </AriaDateInput>
          <AriaButton
            ref={triggerRef}
            aria-label={
              ariaLabelledBy
                ? undefined
                : `Open time picker ${ariaLabel ?? placeholder}`
            }
            aria-labelledby={
              ariaLabelledBy
                ? `${triggerActionLabelId} ${ariaLabelledBy}`
                : undefined
            }
            aria-controls={open ? dialogId : undefined}
            aria-expanded={open}
            aria-haspopup="dialog"
            isDisabled={disabled || readOnly}
            onPress={() => openPicker(triggerRef.current)}
            className="-mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-slate-muted outline-none hover:bg-muted/60 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [@media(pointer:fine)]:size-9"
          >
            <Clock className="size-4" aria-hidden="true" />
          </AriaButton>
        </div>

        <Popover
          data-slot="time-picker-popover"
          aria-label="Choose time"
          triggerRef={triggerRef}
          isOpen={open}
          onOpenChange={handleOpenChange}
          UNSTABLE_portalContainer={portalContainer ?? undefined}
          placement="bottom start"
          offset={6}
          className="motion-anchored-content data-[entering]:fade-in-0 data-[exiting]:fade-out-0 max-sm:fixed! max-sm:transform-none! z-120 w-[min(22rem,calc(100vw-1rem))] rounded-2xl border border-border/70 bg-popover text-popover-foreground shadow-soft-lg outline-none data-[entering]:animate-in data-[exiting]:animate-out motion-reduce:animate-none max-sm:inset-x-2! max-sm:top-auto! max-sm:bottom-[max(env(safe-area-inset-bottom),0.5rem)]! max-sm:max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1rem)] max-sm:overflow-y-auto"
        >
          <Dialog
            id={dialogId}
            aria-label="Choose time"
            className="p-4 outline-none"
          >
            <TimeField
              {...fieldProps}
              aria-describedby={ariaDescribedBy}
              aria-label="Time selection"
              aria-labelledby={undefined}
              value={displayValue}
              onChange={handleValueChange}
              className="space-y-3"
            >
              <p className="font-black text-foreground text-sm">Choose time</p>
              <AriaDateInput className="flex min-h-12 w-full items-center justify-center gap-1 rounded-xl border border-control-border bg-input px-4 py-2 font-black text-2xl shadow-field outline-none focus-within:ring-2 focus-within:ring-ring">
                {(segment) => (
                  <DateSegment
                    segment={segment}
                    className="rounded px-1 tabular-nums outline-none data-[focused]:bg-foreground data-[focused]:text-background data-[placeholder]:text-slate-muted/70"
                  />
                )}
              </AriaDateInput>
            </TimeField>

            <div
              role="status"
              aria-atomic="true"
              className="mt-3 min-h-5 text-muted-foreground text-xs"
            >
              {adjustmentMessage}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-border/60 border-t pt-3">
              {clearable ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={readOnly}
                  onClick={clearValue}
                >
                  Clear
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={closePicker}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={
                  readOnly ||
                  !displayValue ||
                  !isTimeWithinRange(displayValue, minValue, maxValue) ||
                  !resolvedDraftValue
                }
                onClick={commitDraft}
              >
                Done
              </Button>
            </div>
          </Dialog>
        </Popover>
      </TimeField>
    </I18nProvider>
  );
}
