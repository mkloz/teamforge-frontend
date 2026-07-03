import type { DateInputPanelState } from "@/shared/components/ui/date-input/types";

export function getDateInputPanelState({
  open,
  panelStyle,
  portalTarget,
}: {
  open: boolean;
  panelStyle: DateInputPanelState["panelStyle"] | null;
  portalTarget: Element | null;
}) {
  if (!open || !panelStyle || !portalTarget) {
    return null;
  }

  return { panelStyle, portalTarget };
}
