import { getBrowserDevicePixelRatio } from "@/shared/lib/browser-environment";

export const MAX_VORONOI_CANVAS_DEVICE_PIXEL_RATIO = 1.5;

export function getVoronoiCanvasDevicePixelRatio(
  devicePixelRatio = getBrowserDevicePixelRatio(),
) {
  return Math.min(
    MAX_VORONOI_CANVAS_DEVICE_PIXEL_RATIO,
    Math.max(1, devicePixelRatio),
  );
}
