import { describe, expect, it } from "vitest";

import {
  getVoronoiCanvasScale,
  NUM_FORMATION,
} from "@/shared/constants/voronoi.constants";
import { getNextProgress } from "@/shared/hooks/voronoi-animation/frame-utils";
import { getCanvasPointerPosition } from "@/shared/hooks/voronoi-animation/mouse";
import {
  createVoronoiFormationLayout,
  getVoronoiWordCenterCharacterIndices,
  sampleMaskAlpha,
} from "@/shared/lib/voronoi/voronoi-formation";
import { createVoronoiGlyphLayout } from "@/shared/lib/voronoi/voronoi-glyphs";
import { getVoronoiSymbolAccentWeight } from "@/shared/lib/voronoi/voronoi-symbols";

describe("Voronoi cell glyphs", () => {
  it("maps characters to discrete active modules instead of a text overlay", () => {
    const glyph = createVoronoiGlyphLayout("A");
    const occupied = new Set(
      glyph.cells.map(({ column, row }) => `${column}:${row}`),
    );

    expect(glyph).toMatchObject({ columns: 5, rows: 7 });
    expect(occupied.has("0:0")).toBe(false);
    expect(occupied.has("1:0")).toBe(true);
    expect([0, 1, 2, 3, 4].every((column) => occupied.has(`${column}:3`))).toBe(
      true,
    );
  });

  it("keeps the longest shipped word within the available cell budget", () => {
    const glyph = createVoronoiGlyphLayout("TOGETHER");

    expect(glyph.cells.length).toBeLessThanOrEqual(NUM_FORMATION);
    expect(glyph.columns).toBe(47);
  });

  it("creates one physical target for every formation cell", () => {
    const dimensions = { height: 700, width: 900 };
    const points = Array.from({ length: NUM_FORMATION }, (_, index) => ({
      opacity: 0.05,
      targetX: (index % 16) * 50,
      targetY: Math.floor(index / 16) * 50,
      vx: 0,
      vy: 0,
      x: (index % 16) * 50,
      y: Math.floor(index / 16) * 50,
    }));
    const layout = createVoronoiFormationLayout({
      dimensions,
      points,
      rotationDegrees: 0,
      target: { kind: "text", value: "TOGETHER" },
    });

    expect(layout.positions).toHaveLength(NUM_FORMATION);
    expect(layout.cellRadius).toBeGreaterThan(3);
    expect(layout.bounds.width).toBeLessThan(dimensions.width);
    expect(layout.bounds.height).toBeLessThan(dimensions.height / 2);
  });

  it("fills every cell in an explicitly accented character with amber", () => {
    const dimensions = { height: 700, width: 900 };
    const points = Array.from({ length: NUM_FORMATION }, (_, index) => ({
      opacity: 0.05,
      targetX: (index % 16) * 50,
      targetY: Math.floor(index / 16) * 50,
      vx: 0,
      vy: 0,
      x: (index % 16) * 50,
      y: Math.floor(index / 16) * 50,
    }));
    const layout = createVoronoiFormationLayout({
      dimensions,
      points,
      rotationDegrees: 0,
      target: {
        kind: "text",
        value: "INFJ",
        accentCharacterIndices: [1],
      },
    });

    const amberCells = layout.accentWeights.filter((weight) => weight > 0);

    expect(layout.accentWeights).toHaveLength(NUM_FORMATION);
    expect(amberCells.length).toBeGreaterThan(10);
    expect(amberCells.length).toBeLessThan(NUM_FORMATION / 2);
    expect(new Set(amberCells)).toEqual(new Set([1]));
  });

  it("uses explicit empty accents without falling back to a centre letter", () => {
    const layout = createVoronoiFormationLayout({
      dimensions: { height: 700, width: 900 },
      points: createFormationPoints(),
      rotationDegrees: 0,
      target: {
        kind: "text",
        value: "INFJ",
        accentCharacterIndices: [],
      },
    });

    expect(layout.accentWeights.every((weight) => weight === 0)).toBe(true);
  });

  it("selects the centre character of each word by default", () => {
    expect(getVoronoiWordCenterCharacterIndices("YOUR FEW")).toEqual([1, 6]);

    const layout = createVoronoiFormationLayout({
      dimensions: { height: 700, width: 900 },
      points: createFormationPoints(),
      rotationDegrees: 0,
      target: { kind: "text", value: "YOUR FEW" },
    });
    const amberCells = layout.accentWeights.filter((weight) => weight > 0);

    expect(amberCells.length).toBeGreaterThan(20);
    expect(amberCells.length).toBeLessThan(NUM_FORMATION / 2);
    expect(new Set(amberCells)).toEqual(new Set([1]));
  });
});

describe("Voronoi symbolic ember accents", () => {
  const dimensions = { height: 700, width: 900 };
  const anchors = [
    ["constellation", { x: 378, y: 308 }],
    ["convergence", { x: 450, y: 357 }],
    ["pathways", { x: 468, y: 364 }],
    ["shared-orbit", { x: 450, y: 350 }],
  ] as const;

  it.each(
    anchors,
  )("places ember cells at the semantic center of %s", (symbol, sample) => {
    expect(
      getVoronoiSymbolAccentWeight(symbol, sample, dimensions),
    ).toBeGreaterThan(0);
  });

  it("keeps unrelated outer cells teal", () => {
    expect(
      getVoronoiSymbolAccentWeight("convergence", { x: 40, y: 40 }, dimensions),
    ).toBe(0);
  });
});

describe("Voronoi formation progress", () => {
  it("eases cells toward the requested progress without jumping", () => {
    const firstFrame = getNextProgress(0, 1, 1 / 60);
    const nextFrame = getNextProgress(firstFrame, 1, 1 / 60);

    expect(firstFrame).toBeGreaterThan(0);
    expect(firstFrame).toBeLessThan(0.1);
    expect(nextFrame).toBeGreaterThan(firstFrame);
    expect(nextFrame).toBeLessThan(1);
  });
});

describe("Voronoi formation masks", () => {
  it("returns a stable number of points distributed inside the opaque mask", () => {
    const width = 24;
    const height = 16;
    const alpha = new Uint8ClampedArray(width * height * 4);

    for (let y = 4; y < 12; y++) {
      for (let x = 5; x < 19; x++) {
        alpha[(y * width + x) * 4 + 3] = 255;
      }
    }

    const samples = sampleMaskAlpha({ alpha, count: 12, height, width });

    expect(samples).toHaveLength(12);
    expect(
      samples.every(({ x, y }) => x >= 5 && x < 19 && y >= 4 && y < 12),
    ).toBe(true);
    expect(new Set(samples.map(({ x, y }) => `${x}:${y}`)).size).toBe(12);
  });

  it("falls back to a centered deterministic formation for an empty mask", () => {
    const options = {
      alpha: new Uint8ClampedArray(80 * 60 * 4),
      count: 8,
      height: 60,
      width: 80,
    };

    expect(sampleMaskAlpha(options)).toEqual(sampleMaskAlpha(options));
    expect(sampleMaskAlpha(options)).toHaveLength(8);
  });

  it("keeps enough unique targets for thin outlined symbols", () => {
    const width = 180;
    const height = 120;
    const alpha = new Uint8ClampedArray(width * height * 4);

    for (let y = 18; y <= 102; y++) {
      for (let x = 28; x <= 152; x++) {
        const isOutline = x <= 32 || x >= 148 || y <= 22 || y >= 98;
        if (isOutline) alpha[(y * width + x) * 4 + 3] = 255;
      }
    }

    const samples = sampleMaskAlpha({ alpha, count: 64, height, width });

    expect(samples).toHaveLength(64);
    expect(new Set(samples.map(({ x, y }) => `${x}:${y}`)).size).toBe(64);
  });
});

describe("Voronoi canvas presentation", () => {
  it("only adds cover scale when the field is rotated", () => {
    expect(getVoronoiCanvasScale(0)).toBe(1);
    expect(getVoronoiCanvasScale(-25)).toBe(1.25);
  });
});

describe("Voronoi pointer mapping", () => {
  it("inverts scale and translation around the canvas center", () => {
    expect(
      getCanvasPointerPosition({
        center: { x: 50, y: 50 },
        point: { x: 80, y: 50 },
        transform: "matrix(2, 0, 0, 2, 10, 0)",
      }),
    ).toEqual({ x: 60, y: 50 });
  });

  it("inverts canvas rotation instead of relying on a hard-coded angle", () => {
    expect(
      getCanvasPointerPosition({
        center: { x: 50, y: 50 },
        point: { x: 50, y: 60 },
        transform: "matrix(0, 1, -1, 0, 0, 0)",
      }),
    ).toEqual({ x: 60, y: 50 });
  });
});

function createFormationPoints() {
  return Array.from({ length: NUM_FORMATION }, (_, index) => ({
    opacity: 0.05,
    targetX: (index % 16) * 50,
    targetY: Math.floor(index / 16) * 50,
    vx: 0,
    vy: 0,
    x: (index % 16) * 50,
    y: Math.floor(index / 16) * 50,
  }));
}
