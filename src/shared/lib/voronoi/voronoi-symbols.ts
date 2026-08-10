import type {
  Dimensions,
  MouseState,
  VoronoiFormationSymbol,
} from "./voronoi-contract";

interface AccentAnchor {
  radius: number;
  strength: number;
  x: number;
  y: number;
}

export function drawVoronoiSymbolMask(
  context: CanvasRenderingContext2D,
  dimensions: Dimensions,
  symbol: VoronoiFormationSymbol,
) {
  switch (symbol) {
    case "constellation":
      drawConstellationMask(context, dimensions);
      return;
    case "convergence":
      drawConvergenceMask(context, dimensions);
      return;
    case "pathways":
      drawPathwaysMask(context, dimensions);
      return;
    case "shared-orbit":
      drawSharedOrbitMask(context, dimensions);
  }
}

export function getVoronoiSymbolAccentWeight(
  symbol: VoronoiFormationSymbol,
  sample: MouseState,
  dimensions: Dimensions,
) {
  const unit = Math.min(dimensions.width, dimensions.height);
  const anchors = getAccentAnchors(symbol, dimensions, unit);

  return anchors.reduce((strongest, anchor) => {
    const distance = Math.hypot(sample.x - anchor.x, sample.y - anchor.y);
    if (distance > anchor.radius) return strongest;

    const proximity = 1 - distance / anchor.radius;
    return Math.max(strongest, anchor.strength * (0.58 + proximity * 0.42));
  }, 0);
}

// oxlint-disable-next-line typescript/consistent-return -- the symbol union makes this switch exhaustive.
function getAccentAnchors(
  symbol: VoronoiFormationSymbol,
  dimensions: Dimensions,
  unit: number,
): AccentAnchor[] {
  const at = (
    x: number,
    y: number,
    radius: number,
    strength = 0.9,
  ): AccentAnchor => ({
    radius: radius * unit,
    strength,
    x: dimensions.width * x,
    y: dimensions.height * y,
  });

  switch (symbol) {
    case "constellation":
      return [at(0.42, 0.44, 0.065, 0.92), at(0.62, 0.38, 0.05, 0.76)];
    case "convergence":
      return [at(0.5, 0.51, 0.065, 1)];
    case "pathways":
      return [at(0.52, 0.52, 0.065, 0.96)];
    case "shared-orbit":
      return [at(0.5, 0.5, 0.06, 0.98)];
  }
}

function drawSharedOrbitMask(
  context: CanvasRenderingContext2D,
  dimensions: Dimensions,
) {
  const unit = Math.min(dimensions.width, dimensions.height);
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;

  context.lineWidth = unit * 0.024;
  for (const direction of [-1, 1]) {
    context.save();
    context.translate(centerX + direction * unit * 0.08, centerY);
    context.rotate(direction * Math.PI * 0.16);
    context.beginPath();
    context.ellipse(0, 0, unit * 0.19, unit * 0.095, 0, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  context.lineWidth = unit * 0.016;
  context.beginPath();
  context.moveTo(centerX - unit * 0.24, centerY + unit * 0.13);
  context.bezierCurveTo(
    centerX - unit * 0.08,
    centerY - unit * 0.18,
    centerX + unit * 0.08,
    centerY + unit * 0.18,
    centerX + unit * 0.24,
    centerY - unit * 0.13,
  );
  context.stroke();
  drawSharedEmber(context, centerX, centerY, unit);
}

function drawConstellationMask(
  context: CanvasRenderingContext2D,
  dimensions: Dimensions,
) {
  const unit = Math.min(dimensions.width, dimensions.height);
  const nodes = [
    { x: 0.3, y: 0.57, radius: 0.027 },
    { x: 0.41, y: 0.43, radius: 0.047 },
    { x: 0.48, y: 0.61, radius: 0.024 },
    { x: 0.57, y: 0.5, radius: 0.035 },
    { x: 0.64, y: 0.37, radius: 0.04 },
    { x: 0.72, y: 0.59, radius: 0.026 },
    { x: 0.52, y: 0.31, radius: 0.021 },
  ] as const;
  const links = [
    [0, 1],
    [1, 2],
    [1, 6],
    [2, 3],
    [3, 4],
    [3, 5],
    [4, 6],
  ] as const;

  context.lineWidth = unit * 0.016;
  for (const [fromIndex, toIndex] of links) {
    const from = nodes[fromIndex];
    const to = nodes[toIndex];
    context.beginPath();
    context.moveTo(dimensions.width * from.x, dimensions.height * from.y);
    context.lineTo(dimensions.width * to.x, dimensions.height * to.y);
    context.stroke();
  }

  for (const node of nodes) {
    context.beginPath();
    context.arc(
      dimensions.width * node.x,
      dimensions.height * node.y,
      unit * node.radius,
      0,
      Math.PI * 2,
    );
    context.fill();
  }
}

function drawConvergenceMask(
  context: CanvasRenderingContext2D,
  dimensions: Dimensions,
) {
  const unit = Math.min(dimensions.width, dimensions.height);
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height * 0.51;

  context.lineWidth = unit * 0.022;
  for (let index = 0; index < 6; index += 1) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / 6;
    const startX = centerX + Math.cos(angle) * unit * 0.25;
    const startY = centerY + Math.sin(angle) * unit * 0.19;
    const sweepAngle = angle + Math.PI * 0.34;

    context.beginPath();
    context.moveTo(startX, startY);
    context.bezierCurveTo(
      centerX + Math.cos(sweepAngle) * unit * 0.19,
      centerY + Math.sin(sweepAngle) * unit * 0.15,
      centerX + Math.cos(sweepAngle) * unit * 0.07,
      centerY + Math.sin(sweepAngle) * unit * 0.06,
      centerX,
      centerY,
    );
    context.stroke();

    context.beginPath();
    context.arc(startX, startY, unit * 0.024, 0, Math.PI * 2);
    context.fill();
  }

  drawSharedEmber(context, centerX, centerY, unit);
}

function drawPathwaysMask(
  context: CanvasRenderingContext2D,
  dimensions: Dimensions,
) {
  const unit = Math.min(dimensions.width, dimensions.height);
  const centerX = dimensions.width * 0.52;
  const centerY = dimensions.height * 0.52;
  const starts = [
    { x: 0.25, y: 0.29 },
    { x: 0.22, y: 0.61 },
    { x: 0.43, y: 0.76 },
  ] as const;

  context.lineWidth = unit * 0.024;
  for (const start of starts) {
    const startX = dimensions.width * start.x;
    const startY = dimensions.height * start.y;
    context.beginPath();
    context.moveTo(startX, startY);
    context.bezierCurveTo(
      (startX + centerX) / 2,
      startY,
      centerX - unit * 0.07,
      centerY,
      centerX,
      centerY,
    );
    context.stroke();

    context.beginPath();
    context.arc(startX, startY, unit * 0.025, 0, Math.PI * 2);
    context.fill();
  }

  context.beginPath();
  context.moveTo(centerX, centerY);
  context.bezierCurveTo(
    dimensions.width * 0.61,
    dimensions.height * 0.51,
    dimensions.width * 0.67,
    dimensions.height * 0.41,
    dimensions.width * 0.76,
    dimensions.height * 0.36,
  );
  context.stroke();
  drawSharedEmber(context, centerX, centerY, unit);
}

function drawSharedEmber(
  context: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  unit: number,
) {
  context.beginPath();
  context.moveTo(centerX, centerY - unit * 0.06);
  context.bezierCurveTo(
    centerX + unit * 0.04,
    centerY - unit * 0.022,
    centerX + unit * 0.03,
    centerY + unit * 0.022,
    centerX,
    centerY + unit * 0.06,
  );
  context.bezierCurveTo(
    centerX - unit * 0.03,
    centerY + unit * 0.022,
    centerX - unit * 0.04,
    centerY - unit * 0.022,
    centerX,
    centerY - unit * 0.06,
  );
  context.fill();
}
