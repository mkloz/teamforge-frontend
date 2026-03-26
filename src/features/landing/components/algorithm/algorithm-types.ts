export interface AlgoNode {
  id: number;
  x: number;
  y: number;
  label: string;
  type: "center" | "candidate" | "selected" | "rejected";
  interest: string;
  angle: number;
}

export type Phase = "idle" | "scanning" | "evaluating" | "selecting" | "formed";
