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

type SlicedEmptyStateMaskProps = Pick<
  SlicedMaskRenderOptions,
  "cutoutPaths" | "idPrefix" | "maskHeight" | "maskWidth"
> & {
  readonly path: MaskedEmptyStateVisiblePath;
};

type SlicedMaskedEmptyStatePathProps = Pick<
  SlicedPathRenderOptions,
  "cutoutPaths" | "idPrefix"
> & {
  readonly path: MaskedEmptyStateVisiblePath;
};

type EmptyStateCutoutShapeProps = {
  readonly path: EmptyStateCutoutPath;
};

type EmptyStateVisiblePathProps = {
  readonly mask?: string;
  readonly path: TokenizedEmptyStateVisiblePath;
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
        {visiblePaths.map((path) => (
          <SlicedEmptyStateMask
            key={getMaskId(idPrefix, path.id, path.cutoutStart)}
            cutoutPaths={cutoutPaths}
            idPrefix={idPrefix}
            maskHeight={maskHeight}
            maskWidth={maskWidth}
            path={path}
          />
        ))}
      </defs>

      <g stroke="none">
        {visiblePaths.map((path) => (
          <SlicedMaskedEmptyStatePath
            key={path.id}
            cutoutPaths={cutoutPaths}
            idPrefix={idPrefix}
            path={path}
          />
        ))}
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
        {visiblePaths.map((path) => (
          <EmptyStateVisiblePath key={path.id} path={path} />
        ))}
      </g>
    </svg>
  );
}

function SlicedEmptyStateMask({
  cutoutPaths,
  idPrefix,
  maskHeight,
  maskWidth,
  path,
}: SlicedEmptyStateMaskProps) {
  if (path.cutoutStart >= cutoutPaths.length) {
    return null;
  }

  const maskId = getMaskId(idPrefix, path.id, path.cutoutStart);

  return (
    <EmptyStateMask
      cutoutPaths={cutoutPaths.slice(path.cutoutStart)}
      id={maskId}
      maskHeight={maskHeight}
      maskWidth={maskWidth}
    />
  );
}

function SlicedMaskedEmptyStatePath({
  cutoutPaths,
  idPrefix,
  path,
}: SlicedMaskedEmptyStatePathProps) {
  const maskId =
    path.cutoutStart < cutoutPaths.length
      ? getMaskId(idPrefix, path.id, path.cutoutStart)
      : undefined;

  return (
    <EmptyStateVisiblePath
      mask={maskId ? `url(#${maskId})` : undefined}
      path={path}
    />
  );
}

function EmptyStateCutoutShape({ path }: EmptyStateCutoutShapeProps) {
  return <path d={path.d} fill="black" stroke="none" />;
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
      {cutoutPaths.map((path) => (
        <EmptyStateCutoutShape key={path.id} path={path} />
      ))}
    </mask>
  );
}

function EmptyStateVisiblePath({ mask, path }: EmptyStateVisiblePathProps) {
  return <path d={path.d} fill={getFillValue(path.fill)} mask={mask} />;
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
