import { Box } from "lucide-react";
import { useEffect, useState } from "react";

import { DevToolIconButton } from "@/dev/tools/dev-tool-icon-button";
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

  useEffect(() => {
    if (showBorders) {
      applyBoxBordersStyle();
    } else {
      removeBoxBordersStyle();
    }

    return removeBoxBordersStyle;
  }, [showBorders]);

  return (
    <DevToolIconButton
      active={showBorders}
      label={showBorders ? "Hide box borders" : "Show box borders"}
      onClick={() => setShowBorders((current) => !current)}
      pressed={showBorders}
    >
      <Box aria-hidden="true" className="size-4" />
    </DevToolIconButton>
  );
}
