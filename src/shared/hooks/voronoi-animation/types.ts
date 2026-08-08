import type { ScheduledAnimationFrameHandle } from "@/shared/lib/browser-scheduling";
import type {
  MouseState,
  Point,
  VoronoiFormationLayout,
} from "@/shared/lib/voronoi/voronoi-contract";

export interface MutableRef<T> {
  current: T;
}

export interface VoronoiAnimationRefs {
  currentMouseRef: MutableRef<MouseState>;
  currentProgressRef: MutableRef<number>;
  dprRef: MutableRef<number>;
  formationRef: MutableRef<VoronoiFormationLayout | null>;
  isTypingRef: MutableRef<boolean>;
  isVisibleRef: MutableRef<boolean>;
  lastFrameTimeRef: MutableRef<number | null>;
  mouseActiveRef: MutableRef<boolean>;
  pointsRef: MutableRef<Point[]>;
  progressRef: MutableRef<number>;
  requestRef: MutableRef<ScheduledAnimationFrameHandle | null>;
  startTimeRef: MutableRef<number>;
  targetMouseRef: MutableRef<MouseState>;
  timeRef: MutableRef<number>;
  typingPulseRef: MutableRef<number>;
}
