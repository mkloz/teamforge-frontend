import { Box } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/shared/components/ui/button";

const BOX_BORDERS_STYLE_ID = "teamforge-dev-box-borders";

function removeBoxBordersStyle() {
  document.getElementById(BOX_BORDERS_STYLE_ID)?.remove();
}

function applyBoxBordersStyle() {
  if (document.getElementById(BOX_BORDERS_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = BOX_BORDERS_STYLE_ID;
  style.textContent = `
    * {
      outline: 1px solid rgba(239, 68, 68, 0.75) !important;
      outline-offset: -1px !important;
    }
  `;

  document.head.append(style);
}

export function BoxBordersSwitch() {
  const [showBorders, setShowBorders] = useState(false);
  const labelId = useId();

  useEffect(() => {
    if (showBorders) {
      applyBoxBordersStyle();
    } else {
      removeBoxBordersStyle();
    }

    return removeBoxBordersStyle;
  }, [showBorders]);

  return (
    <Button
      type="button"
      variant={showBorders ? "secondary" : "surface"}
      size="icon-xs"
      aria-pressed={showBorders}
      aria-labelledby={labelId}
      className="h-6 w-6 rounded-md border-ink/20 bg-card/95 p-0 shadow-sm backdrop-blur"
      onClick={() => setShowBorders((current) => !current)}
    >
      <Box size={12} />
      <span id={labelId} className="sr-only">
        Toggle box borders
      </span>
    </Button>
  );
}
