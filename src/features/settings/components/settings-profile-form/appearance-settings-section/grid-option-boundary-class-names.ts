import {
  GRID_OPTION_BOUNDARY_CLASS_RULES,
  type GridOptionBoundaryState,
} from "./appearance-options";

export function getGridOptionBoundaryClassNames({
  isFirstColumnOnDesktop,
  isLastInGroup,
  isLastRowOnDesktop,
}: GridOptionBoundaryState) {
  const boundaryState = {
    isFirstColumnOnDesktop,
    isLastInGroup,
    isLastRowOnDesktop,
  };

  return GRID_OPTION_BOUNDARY_CLASS_RULES.map(
    (rule) => rule.isActive(boundaryState) && rule.className,
  );
}
