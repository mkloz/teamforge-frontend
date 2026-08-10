import {
  getVoronoiCanvasScale,
  NUM_FORMATION,
} from "@/shared/constants/voronoi.constants";
import { getBrowserDocument } from "@/shared/lib/browser-environment";
import type {
  Dimensions,
  MouseState,
  Point,
  VoronoiFormationBounds,
  VoronoiFormationLayout,
  VoronoiFormationSymbol,
  VoronoiFormationTarget,
} from "./voronoi-contract";
import { createVoronoiGlyphLayout } from "./voronoi-glyphs";
import {
  drawVoronoiSymbolMask,
  getVoronoiSymbolAccentWeight,
} from "./voronoi-symbols";

const DEFAULT_FORMATION = {
  kind: "text",
  value: "HELLO",
} as const satisfies VoronoiFormationTarget;

const MASK_ALPHA_THRESHOLD = 96;
const MAX_TEXT_LENGTH = 12;
const TEXT_MAX_HEIGHT_RATIO = 0.28;
const TEXT_MAX_WIDTH_RATIO = 0.78;

const GLYPH_SUBCELL_OFFSETS = [
  { x: 0, y: 0 },
  { x: -0.24, y: -0.24 },
  { x: 0.24, y: 0.24 },
  { x: 0.24, y: -0.24 },
  { x: -0.24, y: 0.24 },
] as const;

interface MaskSample {
  accentWeight?: number;
  groupIndex?: number;
  x: number;
  y: number;
}

export function getDefaultVoronoiFormation() {
  return DEFAULT_FORMATION;
}

export function getVoronoiFormationKey(target: VoronoiFormationTarget) {
  const baseKey = `${target.kind}:${target.value.trim().toLocaleUpperCase()}`;

  if (target.kind !== "text") {
    return baseKey;
  }

  const accentIndices =
    target.accentCharacterIndices === undefined
      ? "word-centres"
      : [...target.accentCharacterIndices]
          .sort((left, right) => left - right)
          .join(",");

  return `${baseKey}:accent-${accentIndices}`;
}

export function getVoronoiFormationLayoutKey(
  target: VoronoiFormationTarget,
  rotationDegrees: number,
) {
  return `${getVoronoiFormationKey(target)}@${rotationDegrees}`;
}

export function createVoronoiFormationLayout({
  dimensions,
  points,
  rotationDegrees,
  target,
}: {
  dimensions: Dimensions;
  points: Point[];
  rotationDegrees: number;
  target: VoronoiFormationTarget;
}): VoronoiFormationLayout {
  const formation =
    target.kind === "text"
      ? createTextFormation({
          count: NUM_FORMATION,
          dimensions,
          rotationDegrees,
          value: target.value,
          accentCharacterIndices: target.accentCharacterIndices,
        })
      : createSymbolFormation({
          count: NUM_FORMATION,
          dimensions,
          rotationDegrees,
          symbol: target.value,
        });
  const { cellRadius, samples } = formation;

  const assignments = assignSamplesToPoints(
    points.slice(0, NUM_FORMATION),
    samples,
  );
  const positions = assignments.map(({ x, y }) => ({ x, y }));
  const bounds = getSampleBounds(samples, dimensions);

  return {
    accentWeights: assignments.map((sample) => sample.accentWeight ?? 0),
    bounds,
    cellRadius,
    center: {
      x: bounds.x + bounds.width / 2,
      y: bounds.y + bounds.height / 2,
    },
    key: getVoronoiFormationLayoutKey(target, rotationDegrees),
    positions,
    particleEnabled: target.kind === "symbol",
  };
}

function createTextFormation({
  accentCharacterIndices,
  count,
  dimensions,
  rotationDegrees,
  value,
}: {
  accentCharacterIndices?: readonly number[];
  count: number;
  dimensions: Dimensions;
  rotationDegrees: number;
  value: string;
}) {
  const normalizedValue = normalizeFormationText(value);
  const glyphLayout = createVoronoiGlyphLayout(normalizedValue);
  const moduleSize = Math.max(
    2,
    Math.min(
      (dimensions.width * TEXT_MAX_WIDTH_RATIO) / glyphLayout.columns,
      (dimensions.height * TEXT_MAX_HEIGHT_RATIO) / glyphLayout.rows,
    ),
  );
  const layoutWidth = glyphLayout.columns * moduleSize;
  const layoutHeight = glyphLayout.rows * moduleSize;
  const originX = (dimensions.width - layoutWidth) / 2;
  const originY = (dimensions.height - layoutHeight) / 2;
  const accentedCharacters = new Set(
    accentCharacterIndices ??
      getVoronoiWordCenterCharacterIndices(normalizedValue),
  );
  const moduleCenters = glyphLayout.cells.map(
    ({ characterIndex, column, row }) => ({
      accentWeight: accentedCharacters.has(characterIndex) ? 1 : 0,
      groupIndex: characterIndex,
      x: originX + (column + 0.5) * moduleSize,
      y: originY + (row + 0.5) * moduleSize,
    }),
  );
  const samples = distributeGlyphSamples(
    moduleCenters,
    count,
    moduleSize,
    dimensions,
  ).map((sample) =>
    compensateForCanvasTransform(sample, dimensions, rotationDegrees),
  );

  return {
    cellRadius: moduleSize * 0.52,
    samples,
  };
}

function distributeGlyphSamples(
  moduleCenters: MaskSample[],
  count: number,
  moduleSize: number,
  dimensions: Dimensions,
) {
  if (moduleCenters.length === 0) {
    return [];
  }

  if (moduleCenters.length >= count) {
    return selectGlyphSamples(moduleCenters, count, dimensions);
  }

  const samples = [...moduleCenters];
  let sampleIndex = 0;
  while (samples.length < count) {
    const module = moduleCenters[sampleIndex % moduleCenters.length];
    const layer =
      GLYPH_SUBCELL_OFFSETS[
        1 +
          (Math.floor(sampleIndex / moduleCenters.length) %
            (GLYPH_SUBCELL_OFFSETS.length - 1))
      ];
    samples.push({
      accentWeight: module.accentWeight,
      x: module.x + layer.x * moduleSize,
      y: module.y + layer.y * moduleSize,
    });
    sampleIndex += 1;
  }

  return samples;
}

function selectGlyphSamples(
  moduleCenters: MaskSample[],
  count: number,
  dimensions: Dimensions,
) {
  const accentSamples = moduleCenters.filter(
    (sample) => (sample.accentWeight ?? 0) > 0,
  );
  const selectedAccents =
    accentSamples.length <= count
      ? accentSamples
      : selectBalancedGlyphSamples(accentSamples, count, dimensions);
  const remainingCount = count - selectedAccents.length;

  if (remainingCount <= 0) return selectedAccents;

  const neutralSamples = moduleCenters.filter(
    (sample) => (sample.accentWeight ?? 0) === 0,
  );
  return [
    ...selectedAccents,
    ...selectBalancedGlyphSamples(neutralSamples, remainingCount, dimensions),
  ];
}

function selectBalancedGlyphSamples(
  candidates: MaskSample[],
  count: number,
  dimensions: Dimensions,
) {
  if (count <= 0 || candidates.length === 0) return [];
  if (candidates.length <= count) return candidates;

  const groupedCandidates = new Map<number, MaskSample[]>();
  for (const candidate of candidates) {
    if (candidate.groupIndex === undefined) {
      return selectEvenlySpacedSamples(candidates, count, dimensions);
    }

    const group = groupedCandidates.get(candidate.groupIndex) ?? [];
    group.push(candidate);
    groupedCandidates.set(candidate.groupIndex, group);
  }

  const groups = [...groupedCandidates.entries()]
    .sort(([leftIndex], [rightIndex]) => leftIndex - rightIndex)
    .map(([groupIndex, samples]) => ({
      groupIndex,
      samples,
      selectedCount: 0,
    }));
  const minimumPerCharacter = Math.max(
    1,
    Math.min(8, Math.floor(count / groups.length)),
  );

  let allocatedCount = 0;
  for (const group of groups) {
    group.selectedCount = Math.min(minimumPerCharacter, group.samples.length);
    allocatedCount += group.selectedCount;
  }

  while (allocatedCount < count) {
    const nextGroup = groups
      .filter((group) => group.selectedCount < group.samples.length)
      .sort((left, right) => {
        const leftCoverage = left.selectedCount / left.samples.length;
        const rightCoverage = right.selectedCount / right.samples.length;

        return (
          leftCoverage - rightCoverage || left.groupIndex - right.groupIndex
        );
      })[0];

    if (!nextGroup) break;
    nextGroup.selectedCount += 1;
    allocatedCount += 1;
  }

  return groups.flatMap((group) =>
    selectEvenlySpacedSamples(
      group.samples,
      group.selectedCount,
      dimensions,
      getSampleCenter(group.samples),
    ),
  );
}

function createSymbolFormation({
  count,
  dimensions,
  rotationDegrees,
  symbol,
}: {
  count: number;
  dimensions: Dimensions;
  rotationDegrees: number;
  symbol: VoronoiFormationSymbol;
}) {
  const maskCanvas = createFormationMaskCanvas(dimensions);
  const context = maskCanvas?.getContext("2d") ?? null;

  if (context) {
    drawFormationMask({ context, dimensions, rotationDegrees, symbol });
  }

  const maskSamples = context
    ? sampleMaskAlpha({
        alpha: context.getImageData(0, 0, dimensions.width, dimensions.height)
          .data,
        count,
        height: dimensions.height,
        width: dimensions.width,
      })
    : createFallbackSamples(dimensions, count);
  const samples = maskSamples.map((sample) => ({
    accentWeight: getVoronoiSymbolAccentWeight(
      symbol,
      restoreCanvasTransform(sample, dimensions, rotationDegrees),
      dimensions,
    ),
    x: sample.x,
    y: sample.y,
  }));

  return {
    cellRadius: estimateCellRadius(samples, dimensions),
    samples,
  };
}

function estimateCellRadius(samples: MaskSample[], dimensions: Dimensions) {
  if (samples.length < 2) {
    return Math.min(dimensions.width, dimensions.height) * 0.025;
  }

  const nearestDistances = samples
    .map((sample, sampleIndex) =>
      Math.sqrt(
        samples.reduce((nearest, candidate, candidateIndex) => {
          if (sampleIndex === candidateIndex) return nearest;
          return Math.min(nearest, squaredDistance(sample, candidate));
        }, Number.POSITIVE_INFINITY),
      ),
    )
    .sort((left, right) => left - right);
  const median = nearestDistances[Math.floor(nearestDistances.length / 2)];

  return Math.max(3, median * 0.72);
}

function compensateForCanvasTransform(
  sample: MaskSample,
  dimensions: Dimensions,
  rotationDegrees: number,
) {
  if (rotationDegrees === 0) return sample;

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const scale = 1 / getVoronoiCanvasScale(rotationDegrees);
  const radians = (-rotationDegrees * Math.PI) / 180;
  const x = (sample.x - centerX) * scale;
  const y = (sample.y - centerY) * scale;

  return {
    accentWeight: sample.accentWeight,
    x: centerX + x * Math.cos(radians) - y * Math.sin(radians),
    y: centerY + x * Math.sin(radians) + y * Math.cos(radians),
  };
}

function restoreCanvasTransform(
  sample: MaskSample,
  dimensions: Dimensions,
  rotationDegrees: number,
) {
  if (rotationDegrees === 0) return sample;

  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const scale = getVoronoiCanvasScale(rotationDegrees);
  const radians = (rotationDegrees * Math.PI) / 180;
  const x = (sample.x - centerX) * scale;
  const y = (sample.y - centerY) * scale;

  return {
    x: centerX + x * Math.cos(radians) - y * Math.sin(radians),
    y: centerY + x * Math.sin(radians) + y * Math.cos(radians),
  };
}

export function sampleMaskAlpha({
  alpha,
  count,
  height,
  width,
}: {
  alpha: ArrayLike<number>;
  count: number;
  height: number;
  width: number;
}): MaskSample[] {
  if (count <= 0 || width <= 0 || height <= 0) {
    return [];
  }

  const candidates = collectMaskCandidates(alpha, width, height);
  if (candidates.length === 0) {
    return createFallbackSamples({ width, height }, count);
  }

  return selectEvenlySpacedSamples(candidates, count, { width, height });
}

function createFormationMaskCanvas(dimensions: Dimensions) {
  const document = getBrowserDocument();
  if (!document || dimensions.width <= 0 || dimensions.height <= 0) {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(dimensions.width));
  canvas.height = Math.max(1, Math.round(dimensions.height));
  return canvas;
}

function drawFormationMask({
  context,
  dimensions,
  rotationDegrees,
  symbol,
}: {
  context: CanvasRenderingContext2D;
  dimensions: Dimensions;
  rotationDegrees: number;
  symbol: VoronoiFormationSymbol;
}) {
  context.clearRect(0, 0, dimensions.width, dimensions.height);
  context.fillStyle = "#fff";
  context.strokeStyle = "#fff";
  context.lineCap = "round";
  context.lineJoin = "round";
  context.save();
  context.translate(dimensions.width / 2, dimensions.height / 2);
  context.rotate((-rotationDegrees * Math.PI) / 180);
  const canvasScale = getVoronoiCanvasScale(rotationDegrees);
  context.scale(1 / canvasScale, 1 / canvasScale);
  context.translate(-dimensions.width / 2, -dimensions.height / 2);

  drawVoronoiSymbolMask(context, dimensions, symbol);
  context.restore();
}

function normalizeFormationText(value: string) {
  const normalized = value
    .trim()
    .toLocaleUpperCase()
    .replaceAll(/[^A-Z0-9 ?]/g, "")
    .slice(0, MAX_TEXT_LENGTH);

  return normalized || "READY";
}

export function getVoronoiWordCenterCharacterIndices(value: string) {
  const normalizedValue = normalizeFormationText(value);
  const indices: number[] = [];
  let wordStart = -1;

  for (let index = 0; index <= normalizedValue.length; index += 1) {
    const isWordBoundary =
      index === normalizedValue.length || normalizedValue[index] === " ";

    if (!isWordBoundary && wordStart < 0) {
      wordStart = index;
      continue;
    }

    if (isWordBoundary && wordStart >= 0) {
      const wordLength = index - wordStart;
      indices.push(wordStart + Math.floor((wordLength - 1) / 2));
      wordStart = -1;
    }
  }

  return indices;
}

function collectMaskCandidates(
  alpha: ArrayLike<number>,
  width: number,
  height: number,
) {
  const candidates: MaskSample[] = [];
  const step = Math.max(2, Math.floor(Math.min(width, height) / 150));

  for (let y = Math.floor(step / 2); y < height; y += step) {
    for (let x = Math.floor(step / 2); x < width; x += step) {
      const alphaIndex = (y * width + x) * 4 + 3;
      if ((alpha[alphaIndex] ?? 0) >= MASK_ALPHA_THRESHOLD) {
        candidates.push({ x, y });
      }
    }
  }

  return candidates;
}

function selectEvenlySpacedSamples(
  candidates: MaskSample[],
  count: number,
  dimensions: Dimensions,
  selectionCenter = {
    x: dimensions.width / 2,
    y: dimensions.height / 2,
  },
) {
  const selected: MaskSample[] = [];
  const first = candidates.reduce((closest, candidate) =>
    squaredDistance(candidate, selectionCenter) <
    squaredDistance(closest, selectionCenter)
      ? candidate
      : closest,
  );
  selected.push(first);

  while (selected.length < count && selected.length < candidates.length) {
    let bestCandidate = candidates[0];
    let bestDistance = -1;

    for (const candidate of candidates) {
      const nearestDistance = selected.reduce(
        (nearest, sample) =>
          Math.min(nearest, squaredDistance(candidate, sample)),
        Number.POSITIVE_INFINITY,
      );

      if (nearestDistance > bestDistance) {
        bestCandidate = candidate;
        bestDistance = nearestDistance;
      }
    }

    selected.push(bestCandidate);
  }

  while (selected.length < count) {
    selected.push(selected[selected.length % Math.max(1, selected.length)]);
  }

  return selected;
}

function getSampleCenter(samples: MaskSample[]) {
  const bounds = samples.reduce(
    (current, sample) => ({
      maxX: Math.max(current.maxX, sample.x),
      maxY: Math.max(current.maxY, sample.y),
      minX: Math.min(current.minX, sample.x),
      minY: Math.min(current.minY, sample.y),
    }),
    {
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
    },
  );

  return {
    x: (bounds.minX + bounds.maxX) / 2,
    y: (bounds.minY + bounds.maxY) / 2,
  };
}

function assignSamplesToPoints(points: Point[], samples: MaskSample[]) {
  const remaining = [...samples];

  return points.map((point) => {
    const nearestIndex = remaining.reduce((bestIndex, sample, index) => {
      const best = remaining[bestIndex];
      return !best ||
        squaredDistance(point, sample) < squaredDistance(point, best)
        ? index
        : bestIndex;
    }, 0);
    const [nearest] = remaining.splice(nearestIndex, 1);
    return nearest ?? { x: point.x, y: point.y };
  });
}

function getSampleBounds(
  samples: MaskSample[],
  dimensions: Dimensions,
): VoronoiFormationBounds {
  if (samples.length === 0) {
    return {
      x: dimensions.width * 0.35,
      y: dimensions.height * 0.35,
      width: dimensions.width * 0.3,
      height: dimensions.height * 0.3,
    };
  }

  const xs = samples.map((sample) => sample.x);
  const ys = samples.map((sample) => sample.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

function createFallbackSamples(dimensions: Dimensions, count: number) {
  const radius = Math.min(dimensions.width, dimensions.height) * 0.14;
  const center = { x: dimensions.width / 2, y: dimensions.height / 2 };
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  return Array.from({ length: count }, (_, index) => {
    const distance = radius * Math.sqrt((index + 0.5) / count);
    const angle = index * goldenAngle;
    return {
      x: center.x + Math.cos(angle) * distance,
      y: center.y + Math.sin(angle) * distance,
    };
  });
}

function squaredDistance(a: MouseState, b: MouseState) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}
