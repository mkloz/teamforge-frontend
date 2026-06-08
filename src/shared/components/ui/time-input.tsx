import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import { Button } from "@/shared/components/ui/button";
import { Input, type InputProps } from "@/shared/components/ui/input";
import { useFloatingInputPanel } from "@/shared/hooks/use-floating-input-panel";
import { cancelDelay, scheduleDelay } from "@/shared/lib/browser-scheduling";
import { cn } from "@/shared/lib/utils";

type TimeInputProps = Omit<
  InputProps,
  "type" | "value" | "onChange" | "leftIcon" | "rightIcon"
> & {
  clearable?: boolean;
  intervalMinutes?: number;
  onValueChange: (value: string) => void;
  value?: string | null;
};

type TimePeriod = "AM" | "PM";
const TIME_PERIODS: TimePeriod[] = ["AM", "PM"];
const TIME_OPTION_KEY_OFFSETS: Record<string, number> = {
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
};

interface ActiveTimeOptionRefs {
  hour: HTMLButtonElement | null;
  minute: HTMLButtonElement | null;
  period: HTMLButtonElement | null;
}

function focusActiveTimeOptions(activeRefs: ActiveTimeOptionRefs) {
  const hourOption = activeRefs.hour;
  const minuteOption = activeRefs.minute;

  hourOption?.scrollIntoView({ block: "center" });
  minuteOption?.scrollIntoView({ block: "center" });
  hourOption?.focus({ preventScroll: true });
}

function getTimePickerGridClass(useMeridiem: boolean) {
  return useMeridiem
    ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(3.5rem,0.7fr)]"
    : "grid-cols-2";
}

function handleColumnKeyDown<T>(
  options: T[],
  currentValue: T,
  event: KeyboardEvent<HTMLButtonElement>,
  onSelect: (value: T) => void,
) {
  const currentIndex = Math.max(0, options.indexOf(currentValue));

  if (event.key === "Home") {
    event.preventDefault();
    onSelect(options[0]);
    return;
  }

  if (event.key === "End") {
    event.preventDefault();
    onSelect(options[options.length - 1]);
    return;
  }

  const offset = TIME_OPTION_KEY_OFFSETS[event.key];

  if (offset == null) {
    return;
  }

  event.preventDefault();
  onSelect(
    options[Math.max(0, Math.min(options.length - 1, currentIndex + offset))],
  );
}

function formatTimeValue(hour: number, minute: number) {
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function parseTimeMinutes(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const [hourValue, minuteValue] = value.split(":").map(Number);

  if (
    !Number.isFinite(hourValue) ||
    !Number.isFinite(minuteValue) ||
    hourValue < 0 ||
    hourValue > 23 ||
    minuteValue < 0 ||
    minuteValue > 59
  ) {
    return null;
  }

  return hourValue * 60 + minuteValue;
}

function formatTimeDisplay(
  value: string | null | undefined,
  useMeridiem: boolean,
) {
  if (!value) {
    return "";
  }

  const timeMinutes = parseTimeMinutes(value);

  if (timeMinutes == null) {
    return value;
  }

  const date = new Date();
  date.setHours(Math.floor(timeMinutes / 60), timeMinutes % 60, 0, 0);

  return new Intl.DateTimeFormat(undefined, {
    hour: useMeridiem ? "numeric" : "2-digit",
    hour12: useMeridiem,
    minute: "2-digit",
  }).format(date);
}

function getSafeInterval(intervalMinutes: number) {
  return Math.max(5, Math.min(60, intervalMinutes));
}

function buildMinuteOptions(intervalMinutes: number) {
  const safeInterval = Math.max(5, Math.min(60, intervalMinutes));
  const optionCount = Math.ceil(60 / safeInterval);

  return Array.from({ length: optionCount }, (_, index) => {
    return Math.min(index * safeInterval, 59);
  });
}

function getCurrentTimeValue(intervalMinutes: number) {
  const safeInterval = getSafeInterval(intervalMinutes);
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const roundedMinutes =
    Math.round(currentMinutes / safeInterval) * safeInterval;
  const boundedMinutes = Math.min(23 * 60 + 59, roundedMinutes);

  return formatTimeValue(Math.floor(boundedMinutes / 60), boundedMinutes % 60);
}

function shouldUseMeridiemTime() {
  const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (timeZone === "Europe/London" || timeZone === "Europe/Belfast") {
    return true;
  }

  return (
    new Intl.DateTimeFormat(undefined, { hour: "numeric" }).resolvedOptions()
      .hour12 === true
  );
}

function getTimeParts(
  value: string | null | undefined,
  intervalMinutes: number,
  useMeridiem: boolean,
) {
  const fallbackValue = getCurrentTimeValue(intervalMinutes);
  const minutes =
    parseTimeMinutes(value) ?? parseTimeMinutes(fallbackValue) ?? 0;
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const period: TimePeriod = hour24 >= 12 ? "PM" : "AM";

  return {
    hour: useMeridiem ? hour24 % 12 || 12 : hour24,
    minute,
    period,
  };
}

function toHour24(hour: number, period: TimePeriod, useMeridiem: boolean) {
  if (!useMeridiem) {
    return hour;
  }

  return (hour % 12) + (period === "PM" ? 12 : 0);
}

interface TimeScrollColumnProps<T extends number | string> {
  activeRef?: (node: HTMLButtonElement | null) => void;
  ariaLabel: string;
  currentValue: T;
  getKey?: (option: T) => string;
  isSelected: (option: T) => boolean;
  onKeyDown: (option: T, event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onSelect: (option: T) => void;
  options: T[];
  renderOption: (option: T) => ReactNode;
  title: string;
}

function TimeScrollColumn<T extends number | string>({
  activeRef,
  ariaLabel,
  currentValue,
  getKey = String,
  isSelected,
  onKeyDown,
  onSelect,
  options,
  renderOption,
  title,
}: TimeScrollColumnProps<T>) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState({
    canScrollDown: false,
    canScrollUp: false,
  });

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;

    if (!node) {
      return;
    }

    const maxScrollTop = node.scrollHeight - node.clientHeight;

    setScrollState({
      canScrollDown: node.scrollTop < maxScrollTop - 2,
      canScrollUp: node.scrollTop > 2,
    });
  }, []);

  const scrollByDirection = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({
      behavior: "smooth",
      top: direction * 72,
    });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: currentValue and options intentionally retrigger scroll-button state after list content changes.
  useEffect(() => {
    updateScrollState();
  }, [currentValue, options, updateScrollState]);

  return (
    <div className="flex min-w-0 flex-col px-1.5">
      <p className="pb-2 text-center font-semibold text-slate-muted text-xs">
        {title}
      </p>
      <div className="relative flex min-h-56 flex-1 items-center">
        <div
          ref={scrollRef}
          role="listbox"
          aria-label={ariaLabel}
          className="[&::-webkit-scrollbar]:hidden! scrollbar-hide flex max-h-56 w-full flex-col gap-1 overflow-y-auto py-7 [&::-webkit-scrollbar]:w-0!"
          onScroll={updateScrollState}
        >
          {options.map((option) => {
            const selected = isSelected(option);

            return (
              <div key={getKey(option)} className="flex justify-center">
                <Button
                  ref={(node) => {
                    if (selected) {
                      activeRef?.(node);
                    }
                  }}
                  type="button"
                  variant="ghost"
                  size="sm"
                  role="option"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  className={cn(
                    "h-8 w-full max-w-16 rounded-full text-xs tabular-nums",
                    selected &&
                      "border-primary bg-primary text-primary-foreground",
                  )}
                  onKeyDown={(event) => onKeyDown(option, event)}
                  onClick={() => onSelect(option)}
                >
                  {renderOption(option)}
                </Button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={`Scroll ${title.toLowerCase()} up`}
          disabled={!scrollState.canScrollUp}
          className={cn(
            "absolute inset-x-0 top-0 z-10 flex h-10 items-start justify-center bg-linear-to-b from-card via-card/85 to-transparent pt-1 text-slate-muted transition-all duration-200",
            scrollState.canScrollUp
              ? "opacity-100"
              : "pointer-events-none -translate-y-1 opacity-0",
          )}
          onClick={() => scrollByDirection(-1)}
        >
          <ChevronUp size={14} className="rounded-full bg-white/5 shadow-lg" />
        </button>
        <button
          type="button"
          aria-label={`Scroll ${title.toLowerCase()} down`}
          disabled={!scrollState.canScrollDown}
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 flex h-10 items-end justify-center bg-linear-to-t from-card via-card/85 to-transparent pb-1 text-slate-muted transition-all duration-200",
            scrollState.canScrollDown
              ? "opacity-100"
              : "pointer-events-none translate-y-1 opacity-0",
          )}
          onClick={() => scrollByDirection(1)}
        >
          <ChevronDown
            size={14}
            className="rounded-full bg-white/5 shadow-lg"
          />
        </button>
      </div>
    </div>
  );
}

function TimeInput({
  className,
  clearable = true,
  disabled,
  intervalMinutes = 5,
  onValueChange,
  placeholder = "Select time",
  value,
  wrapperClassName,
  ...props
}: TimeInputProps) {
  const panelId = useId();
  const [timeFormat, setTimeFormat] = useState<"12" | "24">(() =>
    shouldUseMeridiemTime() ? "12" : "24",
  );
  const useMeridiem = timeFormat === "12";
  const {
    closePanel,
    open,
    openPanel,
    panelRef,
    panelStyle,
    portalTarget,
    triggerRef,
  } = useFloatingInputPanel({
    panelHeight: 340,
    panelWidth: useMeridiem ? 188 : 144,
  });
  const activeRefs = useRef<ActiveTimeOptionRefs>({
    hour: null,
    minute: null,
    period: null,
  });
  const selectedParts = getTimeParts(value, intervalMinutes, useMeridiem);
  const hourOptions = useMemo(
    () =>
      Array.from({ length: useMeridiem ? 12 : 24 }, (_, index) =>
        useMeridiem ? index + 1 : index,
      ),
    [useMeridiem],
  );
  const minuteOptions = useMemo(
    () => buildMinuteOptions(intervalMinutes),
    [intervalMinutes],
  );

  const commitParts = (parts: Partial<typeof selectedParts>) => {
    const hour = parts.hour ?? selectedParts.hour;
    const minute = parts.minute ?? selectedParts.minute;
    const period = parts.period ?? selectedParts.period;

    onValueChange(formatTimeValue(toHour24(hour, period, useMeridiem), minute));
  };

  const getNearestMinute = (minute: number) => {
    return minuteOptions.reduce((nearest, option) =>
      Math.abs(option - minute) < Math.abs(nearest - minute) ? option : nearest,
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: selected time changes should recenter the active option while the panel is open.
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const delay = scheduleDelay(() => {
      focusActiveTimeOptions(activeRefs.current);
    }, 0);

    return () => {
      cancelDelay(delay);
    };
  }, [open, selectedParts.hour, selectedParts.minute]);

  return (
    <div ref={triggerRef} className={cn("relative w-full", wrapperClassName)}>
      <Input
        {...props}
        readOnly
        disabled={disabled}
        role="combobox"
        aria-controls={open ? panelId : undefined}
        aria-expanded={open}
        value={formatTimeDisplay(value, useMeridiem)}
        placeholder={placeholder}
        leftIcon={<Clock size={15} />}
        className={cn("cursor-pointer caret-transparent", className)}
        onClick={() => {
          if (!disabled) {
            openPanel();
          }
        }}
        onKeyDown={(event) => {
          if (
            !disabled &&
            (event.key === "Enter" ||
              event.key === " " ||
              event.key === "ArrowDown")
          ) {
            event.preventDefault();
            openPanel();
          }
        }}
      />

      {open && panelStyle && portalTarget
        ? createPortal(
            <div
              id={panelId}
              ref={panelRef}
              style={panelStyle}
              className="z-100 rounded-xl border border-border bg-card p-2 shadow-[0_1px_5px_color-mix(in_srgb,var(--color-ink)_6%,transparent)]"
            >
              <div
                className={cn(
                  "grid w-full items-stretch divide-x divide-border/60 rounded-xl py-1",
                  getTimePickerGridClass(useMeridiem),
                )}
              >
                <TimeScrollColumn
                  title="Hour"
                  ariaLabel="Choose hour"
                  options={hourOptions}
                  currentValue={selectedParts.hour}
                  isSelected={(hour) => selectedParts.hour === hour}
                  activeRef={(node) => {
                    activeRefs.current.hour = node;
                  }}
                  renderOption={(hour) =>
                    useMeridiem ? hour : String(hour).padStart(2, "0")
                  }
                  onKeyDown={(_, event) =>
                    handleColumnKeyDown(
                      hourOptions,
                      selectedParts.hour,
                      event,
                      (nextHour) => commitParts({ hour: nextHour }),
                    )
                  }
                  onSelect={(hour) => commitParts({ hour })}
                />

                <TimeScrollColumn
                  title="Minute"
                  ariaLabel="Choose minute"
                  options={minuteOptions}
                  currentValue={getNearestMinute(selectedParts.minute)}
                  isSelected={(minute) =>
                    getNearestMinute(selectedParts.minute) === minute
                  }
                  activeRef={(node) => {
                    activeRefs.current.minute = node;
                  }}
                  renderOption={(minute) => String(minute).padStart(2, "0")}
                  onKeyDown={(_, event) =>
                    handleColumnKeyDown(
                      minuteOptions,
                      getNearestMinute(selectedParts.minute),
                      event,
                      (nextMinute) => commitParts({ minute: nextMinute }),
                    )
                  }
                  onSelect={(minute) => commitParts({ minute })}
                />

                {useMeridiem ? (
                  <div className="flex min-w-0 flex-col px-1.5">
                    <p className="pb-2 text-center font-semibold text-slate-muted text-xs">
                      Period
                    </p>
                    <div
                      role="listbox"
                      aria-label="Choose period"
                      className="flex min-h-56 flex-1 flex-col justify-center gap-1"
                    >
                      {TIME_PERIODS.map((period) => {
                        const selected = selectedParts.period === period;

                        return (
                          <Button
                            key={period}
                            ref={(node) => {
                              if (selected) {
                                activeRefs.current.period = node;
                              }
                            }}
                            type="button"
                            variant="ghost"
                            size="sm"
                            role="option"
                            aria-selected={selected}
                            tabIndex={selected ? 0 : -1}
                            className={cn(
                              "mx-auto h-8 w-full max-w-14 rounded-full text-xs",
                              selected &&
                                "border-primary bg-primary text-primary-foreground",
                            )}
                            onKeyDown={(event) =>
                              handleColumnKeyDown(
                                TIME_PERIODS,
                                selectedParts.period,
                                event,
                                (nextPeriod) =>
                                  commitParts({ period: nextPeriod }),
                              )
                            }
                            onClick={() => commitParts({ period })}
                          >
                            {period}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 border-border/70 border-t pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    setTimeFormat((current) =>
                      current === "12" ? "24" : "12",
                    );
                  }}
                >
                  {useMeridiem ? "24h" : "12h"}
                </Button>
                <div className="flex items-center gap-2">
                  {clearable ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      onClick={() => {
                        onValueChange("");
                        closePanel();
                      }}
                    >
                      Clear
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    onClick={closePanel}
                  >
                    Done
                  </Button>
                </div>
              </div>
            </div>,
            portalTarget,
          )
        : null}
    </div>
  );
}

export { TimeInput };
