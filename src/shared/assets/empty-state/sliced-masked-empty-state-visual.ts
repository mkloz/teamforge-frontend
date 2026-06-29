import { createElement, useId } from "react";
import type { EmptyStateVisualBaseProps } from "@/assets/empty-state/types";
import { getEmptyStateIdPrefix } from "@/shared/assets/empty-state/id-prefix";
import { SlicedMaskedEmptyStateSvg } from "@/shared/assets/empty-state/masked-svg-paths";

type EmptyStateCutoutPath = {
  readonly d: string;
  readonly id: string;
};

type MaskedEmptyStateVisiblePath = EmptyStateCutoutPath & {
  readonly cutoutStart: number;
  readonly fill: string;
};

type SlicedMaskedEmptyStateVisualOptions = {
  readonly cutoutPaths: readonly EmptyStateCutoutPath[];
  readonly idPrefix: string;
  readonly maskHeight: string;
  readonly maskWidth: string;
  readonly viewBox: string;
  readonly visiblePaths: readonly MaskedEmptyStateVisiblePath[];
};

type EmptyStateVisiblePathTuple = readonly [
  d: string,
  fill: string,
  cutoutStart: number,
];

type SlicedMaskedEmptyStateVisualFromPathDataOptions = Omit<
  SlicedMaskedEmptyStateVisualOptions,
  "cutoutPaths" | "visiblePaths"
> & {
  readonly cutoutPathData: readonly string[];
  readonly visiblePathData: readonly EmptyStateVisiblePathTuple[];
};

export function createEmptyStateCutoutPaths(paths: readonly string[]) {
  return paths.map((d, index) => ({
    id: `cutout-${index + 1}`,
    d,
  }));
}

export function createEmptyStateVisiblePaths(
  paths: readonly EmptyStateVisiblePathTuple[],
) {
  return paths.map(([d, fill, cutoutStart], index) => ({
    id: `visible-${index + 1}`,
    d,
    fill,
    cutoutStart,
  }));
}

export function createSlicedMaskedEmptyStateVisual({
  idPrefix,
  ...svgProps
}: SlicedMaskedEmptyStateVisualOptions) {
  function SlicedMaskedEmptyStateVisual(props: EmptyStateVisualBaseProps) {
    const reactId = useId();
    const scopedIdPrefix = getEmptyStateIdPrefix(idPrefix, reactId);

    return createElement(SlicedMaskedEmptyStateSvg, {
      idPrefix: scopedIdPrefix,
      ...svgProps,
      ...props,
    });
  }

  return SlicedMaskedEmptyStateVisual;
}

export function createSlicedMaskedEmptyStateVisualFromPathData({
  cutoutPathData,
  visiblePathData,
  ...options
}: SlicedMaskedEmptyStateVisualFromPathDataOptions) {
  return createSlicedMaskedEmptyStateVisual({
    ...options,
    cutoutPaths: createEmptyStateCutoutPaths(cutoutPathData),
    visiblePaths: createEmptyStateVisiblePaths(visiblePathData),
  });
}
