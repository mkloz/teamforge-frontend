import { ChevronDown, ChevronUp, Clock } from "lucide-react";
import {
  type CSSProperties,
  type Dispatch,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
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
type TimeFormat = "12" | "24";
type TimeParts = ReturnType<typeof getTimeParts>;
const TIME_PERIODS: TimePeriod[] = ["AM", "PM"];
const TIME_OPTION_KEY_OFFSETS: Record<string, number> = {
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
};
const TIME_INPUT_PANEL_OPEN_KEYS = new Set([" ", "ArrowDown", "Enter"]);
const TIME_12_HOUR_DISPLAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  hour12: true,
  minute: "2-digit",
});
const TIME_24_HOUR_DISPLAY_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
});
const LOCAL_TIME_FORMAT_OPTIONS = new Intl.DateTimeFormat().resolvedOptions();
const LOCAL_NUMERIC_HOUR_FORMAT_OPTIONS = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
}).resolvedOptions();
const EMPTY_TIME_SCROLL_SNAPSHOT = "00";

interface ActiveTimeOptionRefs {
  hourRef: RefObject<HTMLButtonElement | null>;
  minuteRef: RefObject<HTMLButtonElement | null>;
}

interface TimeInputPanelState {
  panelStyle: CSSProperties;
  portalTarget: Element;
}

type TimeScrollSnapshot = "00" | "01" | "10" | "11";

function focusActiveTimeOptions(activeRefs: ActiveTimeOptionRefs) {
  const hourOption = activeRefs.hourRef.current;
  const minuteOption = activeRefs.minuteRef.current;

  hourOption?.scrollIntoView({ block: "center" });
  minuteOption?.scrollIntoView({ block: "center" });
  hourOption?.focus({ preventScroll: true });
}

function getTimePickerGridClass(useMeridiem: boolean) {
  return useMeridiem
    ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(3.5rem,0.7fr)]"
    : "grid-cols-2";
}

function getTimePickerPanelWidth(useMeridiem: boolean) {
  return useMeridiem ? 188 : 144;
}

function shouldOpenTimeInputPanel(disabled: boolean | undefined, key: string) {
  return !disabled && TIME_INPUT_PANEL_OPEN_KEYS.has(key);
}

function openTimeInputPanelIfEnabled({
  disabled,
  openPanel,
}: {
  disabled: boolean | undefined;
  openPanel: () => void;
}) {
  if (disabled) {
    return;
  }

  openPanel();
}

function handleTimeInputKeyDown({
  disabled,
  event,
  openPanel,
}: {
  disabled: boolean | undefined;
  event: KeyboardEvent<HTMLInputElement>;
  openPanel: () => void;
}) {
  if (!shouldOpenTimeInputPanel(disabled, event.key)) {
    return;
  }

  event.preventDefault();
  openPanel();
}

function getTimeInputPanelState({
  open,
  panelStyle,
  portalTarget,
}: {
  open: boolean;
  panelStyle: CSSProperties | null;
  portalTarget: Element | null;
}): TimeInputPanelState | null {
  if (!open || !panelStyle || !portalTarget) {
    return null;
  }

  return { panelStyle, portalTarget };
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

function readTimeMinuteParts(value: string) {
  const [hourValue, minuteValue] = value.split(":").map(Number);

  return { hourValue, minuteValue };
}

function isValidTimeHour(hour: number) {
  return Number.isFinite(hour) && hour >= 0 && hour <= 23;
}

function isValidTimeMinute(minute: number) {
  return Number.isFinite(minute) && minute >= 0 && minute <= 59;
}

function areValidTimeMinuteParts({
  hourValue,
  minuteValue,
}: ReturnType<typeof readTimeMinuteParts>) {
  return isValidTimeHour(hourValue) && isValidTimeMinute(minuteValue);
}

function getTotalTimeMinutes({
  hourValue,
  minuteValue,
}: ReturnType<typeof readTimeMinuteParts>) {
  return hourValue * 60 + minuteValue;
}

function parseTimeMinutes(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timeParts = readTimeMinuteParts(value);

  if (!areValidTimeMinuteParts(timeParts)) {
    return null;
  }

  return getTotalTimeMinutes(timeParts);
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

  return getTimeDisplayFormatter(useMeridiem).format(date);
}

function getTimeDisplayFormatter(useMeridiem: boolean) {
  return useMeridiem
    ? TIME_12_HOUR_DISPLAY_FORMATTER
    : TIME_24_HOUR_DISPLAY_FORMATTER;
}

function getSafeInterval(intervalMinutes: number) {
  return Math.max(5, Math.min(60, intervalMinutes));
}

function buildMinuteOptions(intervalMinutes: number) {
  const safeInterval = getSafeInterval(intervalMinutes);
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
  const timeZone = LOCAL_TIME_FORMAT_OPTIONS.timeZone;

  if (timeZone === "Europe/London" || timeZone === "Europe/Belfast") {
    return true;
  }

  return LOCAL_NUMERIC_HOUR_FORMAT_OPTIONS.hour12 === true;
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

function getCommittedTimeValue({
  parts,
  selectedParts,
  useMeridiem,
}: {
  parts: Partial<TimeParts>;
  selectedParts: TimeParts;
  useMeridiem: boolean;
}) {
  const hour = parts.hour ?? selectedParts.hour;
  const minute = parts.minute ?? selectedParts.minute;
  const period = parts.period ?? selectedParts.period;

  return formatTimeValue(toHour24(hour, period, useMeridiem), minute);
}

function buildHourOptions(useMeridiem: boolean) {
  return Array.from({ length: useMeridiem ? 12 : 24 }, (_, index) =>
    useMeridiem ? index + 1 : index,
  );
}

function getNearestTimeOption(options: number[], value: number) {
  return options.reduce((nearest, option) =>
    Math.abs(option - value) < Math.abs(nearest - value) ? option : nearest,
  );
}

function getTimeScrollSnapshot(
  node: HTMLDivElement | null,
): TimeScrollSnapshot {
  if (!node) {
    return EMPTY_TIME_SCROLL_SNAPSHOT;
  }

  const maxScrollTop = node.scrollHeight - node.clientHeight;

  return `${node.scrollTop > 2 ? "1" : "0"}${
    node.scrollTop < maxScrollTop - 2 ? "1" : "0"
  }` as TimeScrollSnapshot;
}

function getEmptyTimeScrollSnapshot() {
  return EMPTY_TIME_SCROLL_SNAPSHOT;
}

function subscribeToTimeScrollNode(
  node: HTMLDivElement | null,
  onStoreChange: () => void,
) {
  if (!node) {
    return () => {};
  }

  const resizeObserver =
    typeof ResizeObserver === "function"
      ? new ResizeObserver(onStoreChange)
      : null;

  node.addEventListener("scroll", onStoreChange, { passive: true });
  resizeObserver?.observe(node);

  return () => {
    node.removeEventListener("scroll", onStoreChange);
    resizeObserver?.disconnect();
  };
}

interface TimeScrollColumnProps<T extends number | string> {
  activeRef?: (node: HTMLButtonElement | null) => void;
  ariaLabel: string;
  getKey?: (option: T) => string;
  isSelected: (option: T) => boolean;
  onKeyDown: (option: T, event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onSelect: (option: T) => void;
  options: T[];
  getOptionLabel: (option: T) => ReactNode;
  title: string;
}

function TimeScrollColumn<T extends number | string>({
  activeRef,
  ariaLabel,
  getKey = String,
  getOptionLabel,
  isSelected,
  onKeyDown,
  onSelect,
  options,
  title,
}: TimeScrollColumnProps<T>) {
  const [scrollNode, setScrollNode] = useState<HTMLDivElement | null>(null);
  const scrollSnapshot = useSyncExternalStore(
    (onStoreChange) => subscribeToTimeScrollNode(scrollNode, onStoreChange),
    () => getTimeScrollSnapshot(scrollNode),
    getEmptyTimeScrollSnapshot,
  );
  const canScrollUp = scrollSnapshot[0] === "1";
  const canScrollDown = scrollSnapshot[1] === "1";

  const scrollByDirection = (direction: 1 | -1) => {
    scrollNode?.scrollBy({
      behavior: "smooth",
      top: direction * 72,
    });
  };

  return (
    <fieldset
      aria-label={ariaLabel}
      className="m-0 flex min-w-0 flex-col border-0 px-1.5 py-0"
    >
      <legend className="w-full px-0 pb-2 text-center font-semibold text-slate-muted text-xs">
        {title}
      </legend>
      <div className="relative flex min-h-56 flex-1 items-center">
        <div
          ref={setScrollNode}
          className="[&::-webkit-scrollbar]:hidden! scrollbar-hide flex max-h-56 w-full flex-col gap-1 overflow-y-auto py-7 [&::-webkit-scrollbar]:w-0!"
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
                  aria-pressed={selected}
                  tabIndex={selected ? 0 : -1}
                  className={cn(
                    "h-8 w-full max-w-16 rounded-full text-xs tabular-nums",
                    selected &&
                      "border-primary bg-primary text-primary-foreground",
                  )}
                  onKeyDown={(event) => onKeyDown(option, event)}
                  onClick={() => onSelect(option)}
                >
                  {getOptionLabel(option)}
                </Button>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          aria-label={`Scroll ${title.toLowerCase()} up`}
          disabled={!canScrollUp}
          className={cn(
            "absolute inset-x-0 top-0 z-10 flex h-10 items-start justify-center bg-linear-to-b from-card via-card/85 to-transparent pt-1 text-slate-muted transition-all duration-200",
            canScrollUp
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
          disabled={!canScrollDown}
          className={cn(
            "absolute inset-x-0 bottom-0 z-10 flex h-10 items-end justify-center bg-linear-to-t from-card via-card/85 to-transparent pb-1 text-slate-muted transition-all duration-200",
            canScrollDown
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
    </fieldset>
  );
}

interface TimePeriodColumnProps {
  activeRef: (node: HTMLButtonElement | null) => void;
  onSelect: (period: TimePeriod) => void;
  selectedPeriod: TimePeriod;
}

function TimePeriodColumn({
  activeRef,
  onSelect,
  selectedPeriod,
}: TimePeriodColumnProps) {
  return (
    <fieldset
      aria-label="Choose period"
      className="m-0 flex min-w-0 flex-col border-0 px-1.5 py-0"
    >
      <legend className="w-full px-0 pb-2 text-center font-semibold text-slate-muted text-xs">
        Period
      </legend>
      <div className="flex min-h-56 flex-1 flex-col justify-center gap-1">
        {TIME_PERIODS.map((period) => {
          const selected = selectedPeriod === period;

          return (
            <Button
              key={period}
              ref={(node) => {
                if (selected) {
                  activeRef(node);
                }
              }}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={selected}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "mx-auto h-8 w-full max-w-14 rounded-full text-xs",
                selected && "border-primary bg-primary text-primary-foreground",
              )}
              onKeyDown={(event) =>
                handleColumnKeyDown(
                  TIME_PERIODS,
                  selectedPeriod,
                  event,
                  onSelect,
                )
              }
              onClick={() => onSelect(period)}
            >
              {period}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}

interface TimeInputPanelProps {
  activeHourRef: (node: HTMLButtonElement | null) => void;
  activeMinuteRef: (node: HTMLButtonElement | null) => void;
  activePeriodRef: (node: HTMLButtonElement | null) => void;
  clearable: boolean;
  closePanel: () => void;
  commitParts: (parts: Partial<TimeParts>) => void;
  hourOptions: number[];
  minuteOptions: number[];
  onValueChange: (value: string) => void;
  panelId: string;
  panelRef: RefObject<HTMLDivElement | null>;
  panelStyle: CSSProperties;
  portalTarget: Element;
  selectedMinute: number;
  selectedParts: TimeParts;
  setTimeFormat: Dispatch<SetStateAction<TimeFormat>>;
  useMeridiem: boolean;
}

function TimeInputPanel({
  activeHourRef,
  activeMinuteRef,
  activePeriodRef,
  clearable,
  closePanel,
  commitParts,
  hourOptions,
  minuteOptions,
  onValueChange,
  panelId,
  panelRef,
  panelStyle,
  portalTarget,
  selectedMinute,
  selectedParts,
  setTimeFormat,
  useMeridiem,
}: TimeInputPanelProps) {
  return createPortal(
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
          key={useMeridiem ? "hour-12" : "hour-24"}
          title="Hour"
          ariaLabel="Choose hour"
          options={hourOptions}
          isSelected={(hour) => selectedParts.hour === hour}
          activeRef={activeHourRef}
          getOptionLabel={(hour) =>
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
          key={`minute-${minuteOptions.join("-")}`}
          title="Minute"
          ariaLabel="Choose minute"
          options={minuteOptions}
          isSelected={(minute) => selectedMinute === minute}
          activeRef={activeMinuteRef}
          getOptionLabel={(minute) => String(minute).padStart(2, "0")}
          onKeyDown={(_, event) =>
            handleColumnKeyDown(
              minuteOptions,
              selectedMinute,
              event,
              (nextMinute) => commitParts({ minute: nextMinute }),
            )
          }
          onSelect={(minute) => commitParts({ minute })}
        />

        {useMeridiem ? (
          <TimePeriodColumn
            selectedPeriod={selectedParts.period}
            activeRef={activePeriodRef}
            onSelect={(period) => commitParts({ period })}
          />
        ) : null}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-border/70 border-t pt-2">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => {
            setTimeFormat((current) => (current === "12" ? "24" : "12"));
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
          <Button type="button" variant="ghost" size="xs" onClick={closePanel}>
            Done
          </Button>
        </div>
      </div>
    </div>,
    portalTarget,
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
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(() =>
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
    panelWidth: getTimePickerPanelWidth(useMeridiem),
  });
  const activeHourRef = useRef<HTMLButtonElement | null>(null);
  const activeMinuteRef = useRef<HTMLButtonElement | null>(null);
  const activePeriodRef = useRef<HTMLButtonElement | null>(null);
  const selectedParts = getTimeParts(value, intervalMinutes, useMeridiem);
  const hourOptions = buildHourOptions(useMeridiem);
  const minuteOptions = buildMinuteOptions(intervalMinutes);
  const panelState = getTimeInputPanelState({
    open,
    panelStyle,
    portalTarget,
  });

  const commitParts = (parts: Partial<typeof selectedParts>) => {
    onValueChange(
      getCommittedTimeValue({
        parts,
        selectedParts,
        useMeridiem,
      }),
    );
  };

  const selectedMinute = getNearestTimeOption(
    minuteOptions,
    selectedParts.minute,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: selected time changes should recenter the active option while the panel is open.
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const delay = scheduleDelay(() => {
      focusActiveTimeOptions({
        hourRef: activeHourRef,
        minuteRef: activeMinuteRef,
      });
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
          openTimeInputPanelIfEnabled({ disabled, openPanel });
        }}
        onKeyDown={(event) => {
          handleTimeInputKeyDown({ disabled, event, openPanel });
        }}
      />

      {panelState ? (
        <TimeInputPanel
          activeHourRef={(node) => {
            activeHourRef.current = node;
          }}
          activeMinuteRef={(node) => {
            activeMinuteRef.current = node;
          }}
          activePeriodRef={(node) => {
            activePeriodRef.current = node;
          }}
          clearable={clearable}
          closePanel={closePanel}
          commitParts={commitParts}
          hourOptions={hourOptions}
          minuteOptions={minuteOptions}
          onValueChange={onValueChange}
          panelId={panelId}
          panelRef={panelRef}
          panelStyle={panelState.panelStyle}
          portalTarget={panelState.portalTarget}
          selectedMinute={selectedMinute}
          selectedParts={selectedParts}
          setTimeFormat={setTimeFormat}
          useMeridiem={useMeridiem}
        />
      ) : null}
    </div>
  );
}

export { TimeInput };
