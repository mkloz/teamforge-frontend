import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const sharedUiPath = "src/shared/components/ui";
const anchoredSurfaceFiles = [
  "popover.tsx",
  "dropdown-menu.tsx",
  "context-menu-content.tsx",
  "select.tsx",
] as const;

function readSource(path: string) {
  return readFileSync(path, "utf8");
}

describe("shared overlay motion contract", () => {
  it("uses semantic recipes with explicit reduced-motion behavior", () => {
    const dialog = readSource(`${sharedUiPath}/dialog.tsx`);
    const sheet = readSource(`${sharedUiPath}/sheet.tsx`);
    const drawer = readSource(`${sharedUiPath}/drawer.tsx`);
    const tooltip = readSource(`${sharedUiPath}/tooltip.tsx`);

    expect(dialog).toContain("motion-overlay-scrim");
    expect(dialog).toContain("motion-dialog-content");
    expect(sheet).toContain("motion-overlay-scrim");
    expect(sheet).toContain("motion-sheet-content");
    expect(drawer).toContain("motion-overlay-scrim");
    expect(tooltip).toContain("motion-tooltip-content");

    for (const file of anchoredSurfaceFiles) {
      const source = readSource(`${sharedUiPath}/${file}`);
      expect(source).toContain("motion-anchored-content");
      expect(source).toContain("motion-reduce:animate-none");
      expect(source).not.toContain("zoom-in-95");
      expect(source).not.toContain("zoom-out-95");
    }
  });

  it("defines disclosure motion and a scoped reduced Vaul override", () => {
    const theme = readSource("src/styles/theme.css");
    const reducedMotion = readSource(
      "src/styles/animations/reduced-motion.css",
    );
    const accordion = readSource(`${sharedUiPath}/accordion.tsx`);
    const collapsible = readSource(`${sharedUiPath}/collapsible-content.tsx`);

    expect(theme).toContain("--animate-accordion-down");
    expect(theme).toContain("--radix-accordion-content-height");
    expect(accordion).toContain("motion-reduce:animate-none");
    expect(collapsible).not.toContain("will-change-[height,opacity]");
    expect(reducedMotion).toContain("[data-vaul-drawer]");
    expect(reducedMotion).toContain("[data-vaul-overlay]");
  });
});
