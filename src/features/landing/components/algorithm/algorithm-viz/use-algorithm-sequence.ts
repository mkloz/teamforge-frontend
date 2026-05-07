import { useEffect, useState } from "react";
import { SELECTED_IDS } from "@/features/landing/components/algorithm/algorithm-data";
import type {
  DisplayNode,
  Phase,
} from "@/features/landing/components/algorithm/algorithm-types";

type SequenceStep =
  | {
      action?: never;
      delay: number;
      phase: Phase;
    }
  | {
      action: () => void;
      delay: number;
      phase?: never;
    };

export function useAlgorithmSequence(
  inView: boolean,
  initialNodes: DisplayNode[],
) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [nodes, setNodes] = useState<DisplayNode[]>(initialNodes);
  const [prevInitialNodes, setPrevInitialNodes] =
    useState<DisplayNode[]>(initialNodes);

  // Sync state with props during render
  if (initialNodes !== prevInitialNodes) {
    setNodes(initialNodes);
    setPrevInitialNodes(initialNodes);
  }

  if (!inView && phase !== "idle") {
    setPhase("idle");
  }

  const nodesEmpty = nodes.length === 0;

  useEffect(() => {
    if (!inView || nodesEmpty) return;

    let isCancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    const runSequence = () => {
      if (isCancelled) return;

      // Reset nodes for new cycle
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          type: n.id === 0 ? "center" : "candidate",
          displayScore: n.id === 0 ? 100 : 0,
        })),
      );

      setPhase("scanning");

      const sequence: SequenceStep[] = [
        { phase: "evaluating", delay: 2000 },
        { phase: "selecting", delay: 5500 },
        {
          action: () =>
            setNodes((prev) =>
              prev.map((n) =>
                n.type === "candidate"
                  ? {
                      ...n,
                      type: SELECTED_IDS.has(n.id) ? "selected" : "rejected",
                    }
                  : n,
              ),
            ),
          delay: 5900,
        },
        { phase: "formed", delay: 7500 },
        {
          action: () => {
            setPhase("idle");
            const t = setTimeout(() => {
              if (!isCancelled) runSequence();
            }, 1500);
            timeouts.push(t);
          },
          delay: 12000,
        },
      ];

      sequence.forEach((step) => {
        const t = setTimeout(() => {
          if (isCancelled) return;
          if (step.phase) setPhase(step.phase);
          if (step.action) step.action();
        }, step.delay);
        timeouts.push(t);
      });
    };

    const startDelay = setTimeout(() => {
      if (!isCancelled) runSequence();
    }, 400);
    timeouts.push(startDelay);

    return () => {
      isCancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [inView, nodesEmpty, initialNodes]);

  return { phase, nodes, setNodes };
}
