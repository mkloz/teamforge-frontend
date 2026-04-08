import {
  CANDIDATES,
  SELECTED_IDS,
} from "../components/algorithm/algorithm-data";
import type { DisplayNode } from "../components/algorithm/algorithm-types";

export function buildNodes(
  cx: number,
  cy: number,
  radius: number,
): DisplayNode[] {
  const nodes: DisplayNode[] = [
    {
      id: 0,
      x: cx,
      y: cy,
      label: "You",
      type: "center",
      interest: "",
      angle: 0,
      finalScore: 100,
      displayScore: 100,
    },
  ];
  CANDIDATES.forEach((d, i) => {
    const angle = (i / CANDIDATES.length) * Math.PI * 2 - Math.PI / 2;
    const isSelected = SELECTED_IDS.has(i + 1);
    const finalScore = isSelected
      ? Math.floor(Math.random() * 10) + 90
      : Math.floor(Math.random() * 40) + 10;
    nodes.push({
      id: i + 1,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      label: d.mbti,
      type: "candidate",
      interest: d.interest,
      angle,
      finalScore,
      displayScore: 0,
      avatar: d.avatar,
    });
  });
  return nodes;
}
