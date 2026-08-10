import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Button as AriaButton,
  DateInput as AriaDateInput,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  DatePicker,
  DateSegment,
  Dialog,
  Group,
  Heading,
  I18nProvider,
  Popover,
} from "react-aria-components";

import { Button } from "@/shared/components/ui/button";
import type { DateInputProps } from "@/shared/components/ui/date-input/types";
import {
  parseCalendarDateValue,
  serializeCalendarDateValue,
} from "@/shared/components/ui/date-time-picker/value-adapters";
import { cn } from "@/shared/lib/utils";

type AccessibleDateInputProps = Omit<DateInputProps, "onBlur" | "onFocus"> & {
  onBlur?: () => void;
  onFocus?: () => void;
};

export function AccessibleDateInput({
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  "aria-label": ariaLabel,
  className,
  clearable = true,
  disabled,
  id,
  max,
  min,
  name,
  onBlur,
  onFocus,
  onValueChange,
  placeholder = "Select date",
  readOnly,
  required,
  value,
  wrapperClassName,
}: AccessibleDateInputProps) {
  const committedValue = useMemo(() => parseCalendarDateValue(value), [value]);
  const minValue = useMemo(() => parseCalendarDateValue(min), [min]);
  const maxValue = useMemo(() => parseCalendarDateValue(max), [max]);
  const [draftValue, setDraftValue] = useState(committedValue);
  const [open, setOpen] = useState(false);
  const invalid = ariaInvalid === true || ariaInvalid === "true";

  function handleOpenChange(nextOpen: boolean) {
    setDraftValue(committedValue);
    setOpen(nextOpen);
  }

  function commitDraft() {
    onValueChange(serializeCalendarDateValue(draftValue));
    setOpen(false);
  }

  function clearValue() {
    onValueChange("");
    setDraftValue(null);
    setOpen(false);
  }

  return (
    <I18nProvider locale="en-GB">
      <DatePicker
        id={id}
        aria-label={ariaLabel ?? placeholder}
        aria-describedby={ariaDescribedBy}
        isDisabled={disabled}
        isInvalid={invalid}
        isReadOnly={readOnly}
        isRequired={required}
        isOpen={open}
        maxValue={maxValue ?? undefined}
        minValue={minValue ?? undefined}
        onBlur={onBlur}
        onFocus={onFocus}
        onOpenChange={handleOpenChange}
        onChange={setDraftValue}
        shouldCloseOnSelect={false}
        value={open ? draftValue : committedValue}
        className={cn("relative w-full", wrapperClassName)}
      >
        {name ? <input type="hidden" name={name} value={value ?? ""} /> : null}
        <Group
          className={cn(
            "group/date-field flex h-(--control-height) w-full min-w-0 items-center rounded-lg border border-control-border bg-input px-3.5 py-2 font-medium font-sans text-ink text-sm shadow-field outline-none transition-[background-color,border-color,box-shadow,color] duration-150 ease-out focus-within:ring-1 focus-within:ring-foreground focus-within:ring-offset-2 focus-within:ring-offset-background hover:shadow-field-hover data-[disabled]:cursor-not-allowed data-[disabled]:bg-muted/70 data-[invalid]:bg-destructive-soft data-[disabled]:text-slate-muted data-[disabled]:opacity-70 data-[invalid]:ring-1 data-[invalid]:ring-destructive/35 motion-reduce:transition-none [@media(pointer:coarse)]:text-base!",
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
            aria-label="Open calendar"
            className="-mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-muted outline-none hover:bg-muted/60 hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
          >
            <CalendarDays className="size-4" aria-hidden="true" />
          </AriaButton>
        </Group>

        <Popover
          placement="bottom start"
          offset={6}
          className="motion-anchored-content data-[entering]:fade-in-0 data-[exiting]:fade-out-0 max-sm:fixed! max-sm:transform-none! z-120 w-[min(22rem,calc(100vw-1rem))] rounded-2xl border border-border/70 bg-popover text-popover-foreground shadow-soft-lg outline-none data-[entering]:animate-in data-[exiting]:animate-out motion-reduce:animate-none max-sm:inset-x-2! max-sm:top-auto! max-sm:bottom-[max(env(safe-area-inset-bottom),0.5rem)]!"
        >
          <Dialog className="outline-none">
            <Calendar className="p-3 sm:p-4">
              <header className="mb-3 grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-2">
                <AriaButton
                  slot="previous"
                  aria-label="Previous month"
                  className="inline-flex size-11 items-center justify-center rounded-lg text-slate-muted outline-none hover:bg-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [@media(pointer:fine)]:size-9"
                >
                  <ChevronLeft className="size-4" aria-hidden="true" />
                </AriaButton>
                <Heading className="text-center font-black text-foreground text-sm" />
                <AriaButton
                  slot="next"
                  aria-label="Next month"
                  className="inline-flex size-11 items-center justify-center rounded-lg text-slate-muted outline-none hover:bg-muted hover:text-ink focus-visible:ring-2 focus-visible:ring-ring [@media(pointer:fine)]:size-9"
                >
                  <ChevronRight className="size-4" aria-hidden="true" />
                </AriaButton>
              </header>

              <CalendarGrid className="w-full table-fixed border-separate border-spacing-0.5">
                <CalendarGridHeader>
                  {(day) => (
                    <CalendarHeaderCell className="h-8 font-bold text-slate-muted text-xs">
                      {day}
                    </CalendarHeaderCell>
                  )}
                </CalendarGridHeader>
                <CalendarGridBody>
                  {(date) => (
                    <CalendarCell
                      date={date}
                      className={({
                        isDisabled,
                        isFocusVisible,
                        isOutsideMonth,
                        isSelected,
                        isToday,
                      }) =>
                        cn(
                          "grid size-11 place-items-center rounded-lg font-bold text-sm outline-none transition-colors [@media(pointer:fine)]:size-9",
                          isOutsideMonth && "text-slate-muted/45",
                          isToday && !isSelected && "ring-1 ring-foreground/45",
                          isSelected && "bg-primary text-primary-foreground",
                          isDisabled && "cursor-not-allowed opacity-35",
                          !isDisabled && !isSelected && "hover:bg-muted/70",
                          isFocusVisible && "ring-2 ring-ring ring-offset-1",
                        )
                      }
                    />
                  )}
                </CalendarGridBody>
              </CalendarGrid>

              <div className="mt-3 flex items-center justify-between gap-2 border-border/60 border-t pt-3">
                {clearable ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearValue}
                  >
                    Clear
                  </Button>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={!draftValue}
                    onClick={commitDraft}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </Calendar>
          </Dialog>
        </Popover>
      </DatePicker>
    </I18nProvider>
  );
}
