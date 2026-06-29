import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import type { ErrorStateVisualBaseProps } from "./types";

type ErrorStateSvgProps = {
  children: ReactNode;
} & ErrorStateVisualBaseProps;

type ErrorStateVisiblePath = {
  cutoutStart: number;
  d: string;
  fill: string;
  id: string;
};

type ErrorStateCutoutPath = {
  d: string;
  id: string;
};

type ErrorStateLayerProps = {
  cutoutPaths: readonly ErrorStateCutoutPath[];
  idPrefix: string;
  visiblePaths: readonly ErrorStateVisiblePath[];
};

function getMaskId(prefix: string, pathId: string, cutoutStart: number) {
  return `${prefix}-${pathId}-${cutoutStart}`;
}

export function ErrorStateSvg({
  title,
  className,
  children,
  ...props
}: ErrorStateSvgProps) {
  return (
    <svg
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      fill="none"
      className={cn("block h-auto w-40 max-w-full text-foreground", className)}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

function renderErrorStateLayerMasks({
  cutoutPaths,
  idPrefix,
  visiblePaths,
}: ErrorStateLayerProps) {
  return (
    <>
      {visiblePaths.map((path) =>
        path.cutoutStart < cutoutPaths.length ? (
          <mask
            id={getMaskId(idPrefix, path.id, path.cutoutStart)}
            key={getMaskId(idPrefix, path.id, path.cutoutStart)}
            x="0"
            y="0"
            width="2048"
            height="2048"
            maskUnits="userSpaceOnUse"
          >
            <rect width="2048" height="2048" fill="white" />
            {cutoutPaths.slice(path.cutoutStart).map((cutoutPath) => (
              <path key={cutoutPath.id} d={cutoutPath.d} fill="black" />
            ))}
          </mask>
        ) : null,
      )}
    </>
  );
}

function renderErrorStateLayeredPaths({
  cutoutPaths,
  idPrefix,
  visiblePaths,
}: ErrorStateLayerProps) {
  return (
    <g stroke="none">
      {visiblePaths.map((path) => {
        const maskId =
          path.cutoutStart < cutoutPaths.length
            ? getMaskId(idPrefix, path.id, path.cutoutStart)
            : undefined;

        return (
          <path
            d={path.d}
            fill={path.fill}
            key={path.id}
            mask={maskId ? `url(#${maskId})` : undefined}
          />
        );
      })}
    </g>
  );
}

const ErrorStateLayerMasks = renderErrorStateLayerMasks;
const ErrorStateLayeredPaths = renderErrorStateLayeredPaths;

export { ErrorStateLayeredPaths, ErrorStateLayerMasks };
