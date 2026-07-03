import type { CSSProperties, KeyboardEvent } from "react";

export const TIME_PERIODS = ["AM", "PM"] as const;

const TIME_OPTION_KEY_OFFSETS: Record<string, number> = {
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowRight: 1,
  ArrowUp: -1,
};
const TIME_INPUT_PANEL_OPEN_KEYS = new Set([" ", "ArrowDown", "Enter"]);

export interface TimeInputPanelState {
  panelStyle: CSSProperties;
  portalTarget: Element;
}

export function getTimePickerGridClass(useMeridiem: boolean) {
  return useMeridiem
    ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(3.5rem,0.7fr)]"
    : "grid-cols-2";
}

export function getTimePickerPanelWidth(useMeridiem: boolean) {
  return useMeridiem ? 188 : 144;
}

export function openTimeInputPanelIfEnabled({
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

export function handleTimeInputKeyDown({
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

function shouldOpenTimeInputPanel(disabled: boolean | undefined, key: string) {
  return !disabled && TIME_INPUT_PANEL_OPEN_KEYS.has(key);
}

export function getTimeInputPanelState({
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

export function handleColumnKeyDown<T>(
  options: readonly T[],
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
