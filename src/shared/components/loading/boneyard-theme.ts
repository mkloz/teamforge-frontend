export const TEAMFORGE_BONEYARD_BONE_CLASS = "boneyard-bone";

export const TEAMFORGE_BONEYARD_CONFIG = {
  color: "var(--boneyard-bone-light)",
  darkColor: "var(--boneyard-bone-dark)",
  animate: "pulse",
  shimmerColor: "var(--boneyard-shimmer-light)",
  darkShimmerColor: "var(--boneyard-shimmer-dark)",
  speed: "2.4s",
  shimmerAngle: 110,
  stagger: false,
  transition: false,
  boneClass: TEAMFORGE_BONEYARD_BONE_CLASS,
} as const;
