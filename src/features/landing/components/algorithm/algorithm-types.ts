export interface AlgoNode {
  id: number;
  x: number;
  y: number;
  label: string;
  type: "center" | "candidate" | "selected" | "rejected";
  interest: string;
  angle: number;
  avatar?: string;
}

export interface DisplayNode extends AlgoNode {
  finalScore: number;
  displayScore: number;
}

export type Phase = "idle" | "scanning" | "evaluating" | "selecting" | "formed";
