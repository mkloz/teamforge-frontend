import type { Dispatch, SetStateAction } from "react";

import { Button } from "@/shared/components/ui/button";
import type { TimeFormat } from "@/shared/components/ui/time-input/types";

interface TimeInputPanelFooterProps {
  clearable: boolean;
  closePanel: () => void;
  onValueChange: (value: string) => void;
  setTimeFormat: Dispatch<SetStateAction<TimeFormat>>;
  useMeridiem: boolean;
}

export function TimeInputPanelFooter({
  clearable,
  closePanel,
  onValueChange,
  setTimeFormat,
  useMeridiem,
}: TimeInputPanelFooterProps) {
  return (
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
  );
}
