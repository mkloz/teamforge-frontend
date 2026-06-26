import { EmptyStateSvg } from "@/assets/empty-state/empty-state-svg";
import {
  emptyVisualAmber,
  emptyVisualStroke,
  emptyVisualTeal,
} from "@/assets/empty-state/tokens";
import type { EmptyStateVisualBaseProps } from "@/assets/empty-state/types";
import { cn } from "@/shared/lib/utils";

type EmptyStateCutoutPath = {
  readonly d: string;
  readonly id: string;
};

type EmptyStateFillToken = "amber" | "stroke" | "teal";

type TokenizedEmptyStateVisiblePath = EmptyStateCutoutPath & {
  readonly fill: string;
};

type MaskedEmptyStateVisiblePath = TokenizedEmptyStateVisiblePath & {
  readonly cutoutStart: number;
};

type SlicedMaskRenderOptions = {
  readonly cutoutPaths: readonly EmptyStateCutoutPath[];
  readonly idPrefix: string;
  readonly maskHeight: string;
  readonly maskWidth: string;
  readonly visiblePaths: readonly MaskedEmptyStateVisiblePath[];
};

type SlicedPathRenderOptions = Pick<
  SlicedMaskRenderOptions,
  "cutoutPaths" | "idPrefix" | "visiblePaths"
>;

type EmptyStateMaskProps = {
  readonly cutoutPaths: readonly EmptyStateCutoutPath[];
  readonly id: string;
  readonly maskHeight: string;
  readonly maskWidth: string;
};

type SlicedMaskedEmptyStateSvgProps = SlicedMaskRenderOptions &
  EmptyStateVisualBaseProps & {
    readonly viewBox: string;
  };

type TokenizedMaskedEmptyStateSvgProps = EmptyStateVisualBaseProps & {
  readonly cutoutPaths: readonly EmptyStateCutoutPath[];
  readonly maskHeight: string;
  readonly maskId: string;
  readonly maskWidth: string;
  readonly viewBox: string;
  readonly visiblePaths: readonly TokenizedEmptyStateVisiblePath[];
};

const fillByToken: Record<EmptyStateFillToken, string> = {
  amber: emptyVisualAmber,
  stroke: emptyVisualStroke,
  teal: emptyVisualTeal,
};

export function SlicedMaskedEmptyStateSvg({
  cutoutPaths,
  idPrefix,
  maskHeight,
  maskWidth,
  visiblePaths,
  viewBox,
  ...props
}: SlicedMaskedEmptyStateSvgProps) {
  return (
    <EmptyStateSvg viewBox={viewBox} {...props}>
      <defs>
        {renderSlicedEmptyStateMasks({
          cutoutPaths,
          idPrefix,
          maskHeight,
          maskWidth,
          visiblePaths,
        })}
      </defs>

      <g stroke="none">
        {renderSlicedMaskedEmptyStatePaths({
          cutoutPaths,
          idPrefix,
          visiblePaths,
        })}
      </g>
    </EmptyStateSvg>
  );
}

export function TokenizedMaskedEmptyStateSvg({
  className,
  cutoutPaths,
  maskHeight,
  maskId,
  maskWidth,
  title,
  viewBox,
  visiblePaths,
  ...props
}: TokenizedMaskedEmptyStateSvgProps) {
  const maskUrl = `url(#${maskId})`;

  return (
    <svg
      viewBox={viewBox}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
      className={cn("block h-auto max-w-full text-foreground", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <defs>
        <EmptyStateMask
          cutoutPaths={cutoutPaths}
          id={maskId}
          maskHeight={maskHeight}
          maskWidth={maskWidth}
        />
      </defs>
      <g mask={maskUrl} stroke="none">
        {renderTokenizedEmptyStatePaths(visiblePaths)}
      </g>
    </svg>
  );
}

function renderSlicedEmptyStateMasks({
  cutoutPaths,
  idPrefix,
  maskHeight,
  maskWidth,
  visiblePaths,
}: SlicedMaskRenderOptions) {
  return visiblePaths.map((path) =>
    path.cutoutStart < cutoutPaths.length ? (
      <EmptyStateMask
        key={getMaskId(idPrefix, path.id, path.cutoutStart)}
        cutoutPaths={cutoutPaths.slice(path.cutoutStart)}
        id={getMaskId(idPrefix, path.id, path.cutoutStart)}
        maskHeight={maskHeight}
        maskWidth={maskWidth}
      />
    ) : null,
  );
}

function renderSlicedMaskedEmptyStatePaths({
  cutoutPaths,
  idPrefix,
  visiblePaths,
}: SlicedPathRenderOptions) {
  return visiblePaths.map((path) => {
    const maskId =
      path.cutoutStart < cutoutPaths.length
        ? getMaskId(idPrefix, path.id, path.cutoutStart)
        : undefined;

    return renderEmptyStateVisiblePath(
      path,
      maskId ? `url(#${maskId})` : undefined,
    );
  });
}

function renderEmptyStateCutoutPaths(
  cutoutPaths: readonly EmptyStateCutoutPath[],
) {
  return cutoutPaths.map((path) => (
    <path key={path.id} d={path.d} fill="black" stroke="none" />
  ));
}

function renderTokenizedEmptyStatePaths(
  visiblePaths: readonly TokenizedEmptyStateVisiblePath[],
) {
  return visiblePaths.map((path) => renderEmptyStateVisiblePath(path));
}

function EmptyStateMask({
  cutoutPaths,
  id,
  maskHeight,
  maskWidth,
}: EmptyStateMaskProps) {
  return (
    <mask
      id={id}
      x="0"
      y="0"
      width={maskWidth}
      height={maskHeight}
      maskUnits="userSpaceOnUse"
    >
      <rect width={maskWidth} height={maskHeight} fill="white" stroke="none" />
      {renderEmptyStateCutoutPaths(cutoutPaths)}
    </mask>
  );
}

function renderEmptyStateVisiblePath(
  path: TokenizedEmptyStateVisiblePath,
  mask?: string,
) {
  return (
    <path key={path.id} d={path.d} fill={getFillValue(path.fill)} mask={mask} />
  );
}

function getFillValue(fill: string) {
  return isEmptyStateFillToken(fill) ? fillByToken[fill] : fill;
}

function isEmptyStateFillToken(fill: string): fill is EmptyStateFillToken {
  return fill === "amber" || fill === "stroke" || fill === "teal";
}

function getMaskId(prefix: string, pathId: string, cutoutStart: number) {
  return `${prefix}-${pathId}-${cutoutStart}`;
}
