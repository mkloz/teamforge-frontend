import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const hookSource = readFileSync(
  "src/shared/hooks/use-voronoi-animation.ts",
  "utf8",
);
const loopSource = readFileSync(
  "src/shared/hooks/voronoi-animation/animation-loop.ts",
  "utf8",
);
const catalystSource = readFileSync(
  "src/shared/components/visuals/voronoi-catalyst.tsx",
  "utf8",
);

describe("Voronoi visibility lifecycle source contract", () => {
  it("gates loop creation on both intersection and document visibility", () => {
    expect(hookSource).toContain("isIntersecting &&");
    expect(hookSource).toContain("isDocumentVisible &&");
    expect(hookSource).toContain("if (!canRunAnimation)");
    expect(hookSource).toContain('"visibilitychange"');
  });

  it("does not keep an offscreen polling branch inside the animation loop", () => {
    expect(loopSource).not.toContain("isVisibleRef");
    expect(loopSource).toContain("refs.requestRef.current = null");
    expect(loopSource).toContain("refs.lastFrameTimeRef.current = null");
  });

  it("uses the hook's capped DPR for backing dimensions", () => {
    expect(catalystSource).not.toContain("getBrowserDevicePixelRatio");
    expect(catalystSource).toContain(
      "Math.round(dimensions.width * canvasDevicePixelRatio)",
    );
    expect(catalystSource).toContain(
      "Math.round(dimensions.height * canvasDevicePixelRatio)",
    );
  });
});
