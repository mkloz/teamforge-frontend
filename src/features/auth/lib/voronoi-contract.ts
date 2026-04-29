export interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  opacity: number;
}

export interface VoronoiCatalystProps {
  isTyping?: boolean;
  progress?: number;
  className?: string;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface MouseState {
  x: number;
  y: number;
}
