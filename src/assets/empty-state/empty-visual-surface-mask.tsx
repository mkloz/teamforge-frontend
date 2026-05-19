import {
  Children,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useId,
} from "react";
import { emptyVisualSurface } from "./tokens";

type SvgChildProps = {
  children?: ReactNode;
  d?: unknown;
  fill?: unknown;
  mask?: string;
};

type SvgSurfacePathProps = SvgChildProps & {
  d: string;
  fill: typeof emptyVisualSurface;
};

type EmptyVisualSurfaceMaskProps = {
  children: ReactNode;
};

type SurfaceMaskDefinition = {
  id: string;
  paths: string[];
};

function isPathElement(element: ReactElement<SvgChildProps>) {
  return element.type === "path";
}

function isSurfacePath(
  element: ReactElement<SvgChildProps>,
): element is ReactElement<SvgSurfacePathProps> {
  return (
    isPathElement(element) &&
    element.props.fill === emptyVisualSurface &&
    typeof element.props.d === "string"
  );
}

function uniquePaths(paths: string[]) {
  return Array.from(new Set(paths));
}

function buildSurfaceMaskLayers(children: ReactNode, maskIdPrefix: string) {
  const nodes = Children.toArray(children);
  const maskDefinitions: SurfaceMaskDefinition[] = [];
  const renderedChildren: ReactNode[] = [];
  const futureSurfacePaths: string[] = [];
  let visibleRun: ReactNode[] = [];

  function flushVisibleRun() {
    if (visibleRun.length === 0) {
      return;
    }

    const orderedRun = visibleRun.reverse();
    visibleRun = [];

    if (futureSurfacePaths.length === 0) {
      renderedChildren.unshift(...orderedRun);
      return;
    }

    const maskId = `${maskIdPrefix}-${maskDefinitions.length}`;
    maskDefinitions.push({
      id: maskId,
      paths: uniquePaths(futureSurfacePaths),
    });

    renderedChildren.unshift(
      <g key={`${maskId}-layer`} mask={`url(#${maskId})`}>
        {orderedRun}
      </g>,
    );
  }

  for (let nodeIndex = nodes.length - 1; nodeIndex >= 0; nodeIndex -= 1) {
    const child = nodes[nodeIndex];

    if (!isValidElement<SvgChildProps>(child)) {
      visibleRun.push(child);
      continue;
    }

    if (isSurfacePath(child)) {
      flushVisibleRun();
      futureSurfacePaths.push(child.props.d);
      continue;
    }

    visibleRun.push(child);
  }

  flushVisibleRun();

  return {
    maskDefinitions,
    renderedChildren,
  };
}

function hasMaskableSurface(children: ReactNode) {
  let hasSurface = false;

  Children.forEach(children, (child) => {
    if (hasSurface || !isValidElement<SvgChildProps>(child)) {
      return;
    }

    if (isSurfacePath(child)) {
      hasSurface = true;
    }
  });

  return hasSurface;
}

export function EmptyVisualSurfaceMask({
  children,
}: EmptyVisualSurfaceMaskProps) {
  const reactId = useId();
  const maskId = `empty-visual-surface-${reactId.replaceAll(":", "")}`;

  if (!hasMaskableSurface(children)) {
    return children;
  }

  const { maskDefinitions, renderedChildren } = buildSurfaceMaskLayers(
    children,
    maskId,
  );

  return (
    <>
      <defs>
        {maskDefinitions.map((mask) => (
          <mask
            id={mask.id}
            key={mask.id}
            x="-4096"
            y="-4096"
            width="8192"
            height="8192"
            maskUnits="userSpaceOnUse"
          >
            <rect x="-4096" y="-4096" width="8192" height="8192" fill="white" />
            {mask.paths.map((d) => (
              <path d={d} fill="black" key={`${mask.id}-${d}`} />
            ))}
          </mask>
        ))}
      </defs>
      {renderedChildren}
    </>
  );
}
