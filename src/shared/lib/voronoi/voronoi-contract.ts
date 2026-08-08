import type { Ref } from "react";

export interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  opacity: number;
}

export type VoronoiFormationSymbol = "calendar" | "group" | "location";

export type VoronoiFormationTarget =
  | {
      kind: "symbol";
      value: VoronoiFormationSymbol;
    }
  | {
      kind: "text";
      value: string;
      accentCharacterIndices?: readonly number[];
      accentStrength?: number;
    };

export interface VoronoiFormationBounds {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface VoronoiFormationLayout {
  bounds: VoronoiFormationBounds;
  cellRadius: number;
  center: MouseState;
  key: string;
  positions: MouseState[];
  accentWeights: number[];
  sparkEnabled: boolean;
}

export interface VoronoiCatalystProps {
  ref?: Ref<VoronoiCatalystHandle>;
  progress?: number;
  className?: string;
  formation?: VoronoiFormationTarget;
  rotationDegrees?: number;
}

export interface VoronoiCatalystHandle {
  pulseTyping: () => void;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface MouseState {
  x: number;
  y: number;
}
