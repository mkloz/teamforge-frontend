import { Box } from "lucide-react";
import { useEffect, useId, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { getBrowserDocument } from "@/shared/lib/browser-environment";

const BOX_BORDERS_STYLE_ID = "teamforge-dev-box-borders";

function removeBoxBordersStyle() {
  getBrowserDocument()?.getElementById(BOX_BORDERS_STYLE_ID)?.remove();
}

function applyBoxBordersStyle() {
  const browserDocument = getBrowserDocument();

  if (!browserDocument?.head) {
    return;
  }

  if (browserDocument.getElementById(BOX_BORDERS_STYLE_ID)) {
    return;
  }

  const style = browserDocument.createElement("style");
  style.id = BOX_BORDERS_STYLE_ID;
  style.textContent = `
 * {
 outline: 1px solid color-mix(in srgb, var(--color-destructive) 75%, transparent) !important;
 outline-offset: -1px !important;
 }
 `;

  browserDocument.head.append(style);
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
      variant={showBorders ? "secondary" : "subtle"}
      size="icon-xs"
      aria-pressed={showBorders}
      aria-labelledby={labelId}
      className="size-6 rounded-md border-ink/20 bg-card/95 p-0 shadow-sm backdrop-blur"
      onClick={() => setShowBorders((current) => !current)}
    >
      <Box size={12} />
      <span id={labelId} className="sr-only">
        Toggle box borders
      </span>
    </Button>
  );
}
