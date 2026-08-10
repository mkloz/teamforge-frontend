import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const viteConfig = readFileSync("vite.config.ts", "utf8");
const completionBackground = readFileSync(
  "src/features/onboarding/components/interests/interests-page/completion-blueprint/completion-blueprint-background.tsx",
  "utf8",
);

describe("optional Voronoi chunk contract", () => {
  it("routes geometry dependencies before the broad charts rule", () => {
    const geometryRule = viteConfig.indexOf('name: "voronoi-geometry"');
    const chartsRule = viteConfig.indexOf('name: "charts"');

    expect(geometryRule).toBeGreaterThan(-1);
    expect(geometryRule).toBeLessThan(chartsRule);
    expect(viteConfig).toContain('"/d3-delaunay/"');
    expect(viteConfig).toContain('"/delaunator/"');
    expect(viteConfig).toContain('"/robust-predicates/"');
  });

  it("keeps the completion canvas optional and excludes it from PWA precache", () => {
    expect(completionBackground).toContain("lazy(() =>");
    expect(completionBackground).toContain("DecorativeVisualBoundary");
    expect(completionBackground).toContain("useVoronoiVisualEnabled");
    expect(viteConfig).toContain('"**/voronoi-catalyst-*.js"');
    expect(viteConfig).toContain('"**/voronoi-geometry-*.js"');
  });
});
