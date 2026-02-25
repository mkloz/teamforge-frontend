import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/use-in-view";

interface AlgoNode {
  id: number;
  x: number;
  y: number;
  label: string;
  type: "center" | "candidate" | "selected" | "rejected";
  mbti: string;
  interest: string;
}

const CANDIDATE_DATA = [
  { mbti: "INFP", interest: "Art" },
  { mbti: "ENTP", interest: "Tech" },
  { mbti: "ESTJ", interest: "Sport" },
  { mbti: "INTJ", interest: "Tech" },
  { mbti: "ENFJ", interest: "Music" },
  { mbti: "ISTP", interest: "Sport" },
  { mbti: "ENTJ", interest: "Tech" },
  { mbti: "INFJ", interest: "Art" },
  { mbti: "ESFP", interest: "Music" },
  { mbti: "INTP", interest: "Tech" },
];

const RADIUS = 130;

function buildNodes(cx: number, cy: number): AlgoNode[] {
  const nodes: AlgoNode[] = [
    {
      id: 0,
      x: cx,
      y: cy,
      label: "You",
      type: "center",
      mbti: "ENTJ",
      interest: "Tech",
    },
  ];

  CANDIDATE_DATA.forEach((d, i) => {
    const angle = (i / CANDIDATE_DATA.length) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id: i + 1,
      x: cx + Math.cos(angle) * RADIUS,
      y: cy + Math.sin(angle) * RADIUS,
      label: d.mbti,
      type: "candidate",
      mbti: d.mbti,
      interest: d.interest,
    });
  });

  return nodes;
}

type Phase = "idle" | "evaluating" | "filtering" | "formed";

const SELECTED_IDS = [2, 4, 7, 10]; // ENTP, ENFJ, ENTJ, INTP — all tech-compatible

export function AlgorithmSection() {
  const { ref, inView } = useInView(0.2);
  const [phase, setPhase] = useState<Phase>("idle");
  const [nodes, setNodes] = useState<AlgoNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ cx: 180, cy: 180 });
  const hasRun = useRef(false);

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = Math.min(containerRef.current.offsetWidth, 400);
        const size = w;
        setDims({ cx: size / 2, cy: size / 2 });
        setNodes(buildNodes(size / 2, size / 2));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!inView || hasRun.current || nodes.length === 0) return;
    hasRun.current = true;

    setPhase("evaluating");

    const t1 = setTimeout(() => setPhase("filtering"), 1400);
    const t2 = setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.type === "candidate"
            ? {
                ...n,
                type: SELECTED_IDS.includes(n.id) ? "selected" : "rejected",
              }
            : n,
        ),
      );
    }, 2200);
    const t3 = setTimeout(() => setPhase("formed"), 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [inView, nodes.length]);

  const svgSize = Math.min(dims.cx * 2, 400);

  const getNodeStyle = (node: AlgoNode) => {
    if (node.type === "center")
      return {
        fill: "#0D9488",
        r: 20,
        textFill: "white",
        opacity: 1,
        glow: true,
      };
    if (node.type === "selected")
      return {
        fill: "#F59E0B",
        r: 14,
        textFill: "#1C1C1A",
        opacity: 1,
        glow: true,
      };
    if (node.type === "rejected")
      return {
        fill: "#374151",
        r: 10,
        textFill: "#6B7280",
        opacity: 0.3,
        glow: false,
      };
    return {
      fill: "#0D9488",
      r: 12,
      textFill: "white",
      opacity: phase === "idle" ? 0 : 0.75,
      glow: false,
    };
  };

  const getLineOpacity = (node: AlgoNode) => {
    if (phase === "idle") return 0;
    if (node.type === "rejected") return 0.04;
    if (node.type === "selected") return 0.7;
    return 0.2;
  };

  const getLineStroke = (node: AlgoNode) => {
    if (node.type === "selected") return "#F59E0B";
    return "#0D9488";
  };

  return (
    <section
      id="algorithm"
      ref={ref}
      className="relative bg-[#090909] py-24 md:py-32 overflow-hidden"
      aria-label="How The Algorithm Works"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: copy */}
          <div
            className={`flex-1 transition-all duration-700 ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
          >
            <p className="font-sans text-xs font-semibold uppercase tracking-widest text-[#0D9488] mb-3">
              Under The Hood
            </p>
            <h2
              className="font-sans font-bold text-white text-balance mb-5"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}
            >
              A live look at your group forming.
            </h2>
            <p className="font-sans text-base text-white/55 leading-relaxed mb-8 max-w-md text-pretty">
              When you press Forge, the algorithm evaluates every candidate in
              your city across five weighted dimensions simultaneously. Watch it
              identify your best group in real time.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { value: "< 2s", label: "Formation time" },
                { value: "5", label: "Scoring factors" },
                { value: "50+", label: "Candidates evaluated" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4 text-center"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p className="font-sans font-bold text-[#0D9488] text-xl mb-1">
                    {value}
                  </p>
                  <p className="font-sans text-white/40 text-xs">{label}</p>
                </div>
              ))}
            </div>

            {/* Factor breakdown */}
            <div className="space-y-2.5">
              {[
                { label: "Personality distance", weight: 30 },
                { label: "Interest similarity", weight: 30 },
                { label: "Age alignment", weight: 10 },
                { label: "Trust score", weight: 10 },
                { label: "Social graph proximity", weight: 20 },
              ].map(({ label, weight }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="font-sans text-xs text-white/45 w-40 flex-shrink-0">
                    {label}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[#0D9488] transition-all duration-1000"
                      style={{
                        width: inView ? `${weight * 3}%` : "0%",
                        transitionDelay: "600ms",
                      }}
                    />
                  </div>
                  <span className="font-sans text-xs font-semibold text-[#0D9488] w-8 text-right">
                    {weight}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: SVG visualization */}
          <div
            ref={containerRef}
            className={`flex-shrink-0 w-full max-w-sm transition-all duration-700 delay-200 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          >
            <svg
              width={svgSize}
              height={svgSize}
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="w-full"
              aria-label="Algorithm visualization diagram"
            >
              {/* Connection lines */}
              {nodes
                .filter((n) => n.type !== "center")
                .map((node) => {
                  const center = nodes[0];
                  if (!center) return null;
                  return (
                    <line
                      key={`line-${node.id}`}
                      x1={center.x}
                      y1={center.y}
                      x2={node.x}
                      y2={node.y}
                      stroke={getLineStroke(node)}
                      strokeWidth={node.type === "selected" ? 1.5 : 1}
                      opacity={getLineOpacity(node)}
                      style={{ transition: "opacity 0.5s ease, stroke 0.5s ease" }}
                    />
                  );
                })}

              {/* Nodes */}
              {nodes.map((node) => {
                const style = getNodeStyle(node);
                return (
                  <g
                    key={node.id}
                    style={{
                      transition: "opacity 0.6s ease, transform 0.6s ease",
                      opacity: style.opacity,
                    }}
                  >
                    {style.glow && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={style.r + 8}
                        fill={style.fill}
                        opacity={0.15}
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={style.r}
                      fill={style.fill}
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={style.textFill}
                      fontSize={node.type === "center" ? 10 : 8}
                      fontWeight="700"
                      fontFamily="Inter, sans-serif"
                    >
                      {node.label}
                    </text>
                    {node.type !== "center" && (
                      <text
                        x={node.x}
                        y={node.y + style.r + 10}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.25)"
                        fontSize="7"
                        fontFamily="Inter, sans-serif"
                      >
                        {node.interest}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Phase label */}
            <p className="text-center font-sans text-sm text-white/40 mt-4 h-5">
              {phase === "idle" && ""}
              {phase === "evaluating" && "Evaluating candidates..."}
              {phase === "filtering" && "Ranking by compatibility..."}
              {phase === "formed" && (
                <span className="text-[#F59E0B]">Group forged.</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
