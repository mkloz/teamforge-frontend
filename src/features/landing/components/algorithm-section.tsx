import { useEffect, useRef, useState, useCallback } from "react";
import { useInView } from "../hooks/use-in-view";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface AlgoNode {
  id: number;
  x: number;
  y: number;
  label: string;
  type: "center" | "candidate" | "selected" | "rejected";
  interest: string;
  angle: number;
}

type Phase = "idle" | "scanning" | "evaluating" | "selecting" | "formed";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const CANDIDATES = [
  { mbti: "INFP", interest: "Art" },
  { mbti: "ENTP", interest: "Tech" },
  { mbti: "ESTJ", interest: "Sport" },
  { mbti: "INTJ", interest: "Code" },
  { mbti: "ENFJ", interest: "Music" },
  { mbti: "ISTP", interest: "Sport" },
  { mbti: "ENTJ", interest: "Tech" },
  { mbti: "INFJ", interest: "Art" },
  { mbti: "ESFP", interest: "Music" },
  { mbti: "INTP", interest: "Tech" },
  { mbti: "ISFJ", interest: "Cook" },
  { mbti: "ENFP", interest: "Travel" },
];

const SELECTED_IDS = new Set([2, 4, 7, 10]);

const FACTORS = [
  { label: "Personality match", weight: 30, color: "#0D9488" },
  { label: "Shared interests", weight: 30, color: "#14B8A6" },
  { label: "Friend connections", weight: 20, color: "#F59E0B" },
  { label: "Reliability", weight: 10, color: "#0D9488" },
  { label: "Age range", weight: 10, color: "#14B8A6" },
];

const PHASE_LABELS: Record<Phase, string> = {
  idle: "",
  scanning: "Scanning for compatible people nearby...",
  evaluating: "Evaluating personality and interests...",
  selecting: "Picking your perfect group...",
  formed: "Group forged.",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function buildNodes(cx: number, cy: number, radius: number): AlgoNode[] {
  const nodes: AlgoNode[] = [
    { id: 0, x: cx, y: cy, label: "You", type: "center", interest: "", angle: 0 },
  ];
  CANDIDATES.forEach((d, i) => {
    const angle = (i / CANDIDATES.length) * Math.PI * 2 - Math.PI / 2;
    nodes.push({
      id: i + 1,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      label: d.mbti,
      type: "candidate",
      interest: d.interest,
      angle,
    });
  });
  return nodes;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AlgorithmSection() {
  const { ref, inView } = useInView(0.15);
  const [phase, setPhase] = useState<Phase>("idle");
  const [nodes, setNodes] = useState<AlgoNode[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(380);
  const hasRun = useRef(false);

  /* Responsive sizing */
  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth;
        setSize(Math.min(w, 420));
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  /* Rebuild nodes when size changes */
  useEffect(() => {
    const cx = size / 2;
    const cy = size / 2;
    const r = size * 0.36;
    setNodes(buildNodes(cx, cy, r));
  }, [size]);

  /* Phased animation sequence */
  useEffect(() => {
    if (!inView || hasRun.current || nodes.length === 0) return;
    hasRun.current = true;

    setPhase("scanning");

    const t1 = setTimeout(() => setPhase("evaluating"), 1200);
    const t2 = setTimeout(() => setPhase("selecting"), 2400);
    const t3 = setTimeout(() => {
      setNodes((prev) =>
        prev.map((n) =>
          n.type === "candidate"
            ? { ...n, type: SELECTED_IDS.has(n.id) ? "selected" : "rejected" }
            : n,
        ),
      );
    }, 2600);
    const t4 = setTimeout(() => setPhase("formed"), 3400);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [inView, nodes.length]);

  /* Node visual style resolver */
  const getNodeStyle = useCallback(
    (node: AlgoNode) => {
      if (node.type === "center")
        return { fill: "#0D9488", r: size * 0.055, textFill: "#fff", opacity: 1, glow: true, glowColor: "#0D9488" };
      if (node.type === "selected")
        return { fill: "#F59E0B", r: size * 0.038, textFill: "#1C1C1A", opacity: 1, glow: true, glowColor: "#F59E0B" };
      if (node.type === "rejected")
        return { fill: "#1f2937", r: size * 0.025, textFill: "#4b5563", opacity: 0.25, glow: false, glowColor: "" };
      return {
        fill: "#0D9488",
        r: size * 0.032,
        textFill: "#fff",
        opacity: phase === "idle" ? 0 : 0.7,
        glow: false,
        glowColor: "",
      };
    },
    [phase, size],
  );

  const getLineProps = useCallback(
    (node: AlgoNode) => {
      if (phase === "idle") return { opacity: 0, stroke: "#0D9488", width: 0.8 };
      if (node.type === "rejected") return { opacity: 0.03, stroke: "#374151", width: 0.5 };
      if (node.type === "selected") return { opacity: 0.75, stroke: "#F59E0B", width: 1.8 };
      if (phase === "scanning") return { opacity: 0.15, stroke: "#0D9488", width: 0.8 };
      return { opacity: 0.12, stroke: "#0D9488", width: 0.8 };
    },
    [phase],
  );

  const cx = size / 2;
  const cy = size / 2;

  /* Cross-links between selected nodes */
  const selectedNodes = nodes.filter((n) => n.type === "selected");

  return (
    <section
      id="algorithm"
      ref={ref}
      className="relative bg-[#060606] py-24 md:py-36 overflow-hidden"
      aria-label="How The Algorithm Works"
    >
      {/* Subtle radial glow behind the section */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 40%, rgba(13,148,136,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* ---- HEADER ---- */}
        <div
          className="text-center mb-16 md:mb-20"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#0D9488] mb-4">
            Under The Hood
          </p>
          <h2
            className="font-sans font-extrabold text-white text-balance mx-auto max-w-2xl"
            style={{ fontSize: "clamp(1.85rem, 4.5vw, 2.75rem)", lineHeight: 1.15 }}
          >
            Watch the algorithm{" "}
            <span className="bg-gradient-to-r from-[#0D9488] to-[#F59E0B] bg-clip-text text-transparent">
              forge your group
            </span>{" "}
            in real time.
          </h2>
          <p className="font-sans text-base md:text-lg text-white/50 mt-5 max-w-xl mx-auto leading-relaxed text-pretty">
            Personality, interests, trust, age, and your social circle --
            five factors, weighed and balanced in under two seconds.
          </p>
        </div>

        {/* ---- MAIN CONTENT: viz left, factors right ---- */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* --- Visualization --- */}
          <div
            ref={containerRef}
            className={`relative flex-1 w-full max-w-md lg:max-w-none transition-all duration-700 delay-200 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          >
            {/* Orbital ring decoration behind the SVG */}
            <div
              className="absolute inset-0 m-auto rounded-full pointer-events-none"
              aria-hidden="true"
              style={{
                width: size * 0.78,
                height: size * 0.78,
                border: "1px solid rgba(13,148,136,0.12)",
              }}
            />
            <div
              className="absolute inset-0 m-auto rounded-full pointer-events-none"
              aria-hidden="true"
              style={{
                width: size * 0.56,
                height: size * 0.56,
                border: "1px dashed rgba(13,148,136,0.07)",
              }}
            />

            <svg
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              className="w-full mx-auto block"
              aria-label="Interactive algorithm visualization showing group formation"
              role="img"
            >
              <defs>
                <radialGradient id="centerGlow">
                  <stop offset="0%" stopColor="#0D9488" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="amberGlow">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                </radialGradient>
                <filter id="softBlur">
                  <feGaussianBlur stdDeviation="3" />
                </filter>
              </defs>

              {/* Center ambient glow */}
              <circle cx={cx} cy={cy} r={size * 0.18} fill="url(#centerGlow)" />

              {/* Scanning ring animation */}
              {(phase === "scanning" || phase === "evaluating") && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={size * 0.36}
                  fill="none"
                  stroke="#0D9488"
                  strokeWidth="1"
                  opacity="0.2"
                  strokeDasharray="6 8"
                  style={{ animation: "orb-rotate 6s linear infinite" }}
                />
              )}

              {/* Connection lines from center to each candidate */}
              {nodes
                .filter((n) => n.type !== "center")
                .map((node) => {
                  const lp = getLineProps(node);
                  return (
                    <line
                      key={`line-${node.id}`}
                      x1={cx}
                      y1={cy}
                      x2={node.x}
                      y2={node.y}
                      stroke={lp.stroke}
                      strokeWidth={lp.width}
                      opacity={lp.opacity}
                      style={{ transition: "all 0.6s ease" }}
                    />
                  );
                })}

              {/* Cross-links between selected nodes */}
              {selectedNodes.length > 1 &&
                selectedNodes.map((a, i) =>
                  selectedNodes.slice(i + 1).map((b) => (
                    <line
                      key={`cross-${a.id}-${b.id}`}
                      x1={a.x}
                      y1={a.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="#F59E0B"
                      strokeWidth="1"
                      opacity={phase === "formed" ? 0.35 : 0}
                      strokeDasharray="3 4"
                      style={{ transition: "opacity 0.8s ease 0.2s" }}
                    />
                  )),
                )}

              {/* Nodes */}
              {nodes.map((node) => {
                const ns = getNodeStyle(node);
                return (
                  <g
                    key={node.id}
                    style={{ transition: "opacity 0.5s ease", opacity: ns.opacity }}
                  >
                    {/* Multi-layer glow */}
                    {ns.glow && (
                      <>
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={ns.r * 2.8}
                          fill={node.type === "selected" ? "url(#amberGlow)" : "url(#centerGlow)"}
                        />
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={ns.r * 1.6}
                          fill={ns.glowColor}
                          opacity={0.15}
                          filter="url(#softBlur)"
                        />
                      </>
                    )}
                    <circle cx={node.x} cy={node.y} r={ns.r} fill={ns.fill} />
                    <text
                      x={node.x}
                      y={node.y + 0.5}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill={ns.textFill}
                      fontSize={node.type === "center" ? size * 0.028 : size * 0.02}
                      fontWeight="700"
                      fontFamily="Inter, sans-serif"
                    >
                      {node.label}
                    </text>
                    {/* Interest label below non-center nodes */}
                    {node.type !== "center" && (
                      <text
                        x={node.x}
                        y={node.y + ns.r + size * 0.025}
                        textAnchor="middle"
                        fill={
                          node.type === "selected"
                            ? "rgba(245,158,11,0.65)"
                            : node.type === "rejected"
                              ? "rgba(255,255,255,0.08)"
                              : "rgba(255,255,255,0.22)"
                        }
                        fontSize={size * 0.018}
                        fontFamily="Inter, sans-serif"
                        style={{ transition: "fill 0.6s ease" }}
                      >
                        {node.interest}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Phase label */}
            <div className="text-center mt-6 h-7">
              <p
                className="font-sans text-sm transition-all duration-500"
                style={{
                  color: phase === "formed" ? "#F59E0B" : "rgba(255,255,255,0.4)",
                  fontWeight: phase === "formed" ? 600 : 400,
                }}
              >
                {PHASE_LABELS[phase]}
              </p>
            </div>
          </div>

          {/* --- Right: Factor breakdown + stats --- */}
          <div
            className={`flex-1 max-w-md w-full transition-all duration-700 delay-300 ${inView ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
          >
            {/* Pipeline description */}
            <div className="mb-10">
              <h3 className="font-sans font-bold text-white text-xl mb-3">
                How it finds your people
              </h3>
              <div className="space-y-4">
                {[
                  {
                    step: "01",
                    title: "Find compatible candidates",
                    desc: "The system scans nearby users and scores them against your personality, interests, age, and trust. The top 50 most compatible advance.",
                  },
                  {
                    step: "02",
                    title: "Build the best group",
                    desc: "Members are picked one by one, each chosen to maximize the group's overall compatibility. Friends and friends-of-friends get a boost.",
                  },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <span className="flex-shrink-0 font-sans font-extrabold text-[#0D9488]/25 text-2xl leading-none mt-0.5 select-none">
                      {step}
                    </span>
                    <div>
                      <p className="font-sans font-semibold text-white text-sm mb-1">{title}</p>
                      <p className="font-sans text-sm text-white/40 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Factor weight bars */}
            <div className="mb-10">
              <h3 className="font-sans font-bold text-white text-sm mb-4 uppercase tracking-widest">
                Scoring Factors
              </h3>
              <div className="space-y-3">
                {FACTORS.map(({ label, weight, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <span className="font-sans text-xs text-white/40 w-36 flex-shrink-0 truncate">
                      {label}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: inView ? `${weight * 3.3}%` : "0%",
                          background: `linear-gradient(90deg, ${color}, ${color}88)`,
                          transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1) 800ms",
                        }}
                      />
                    </div>
                    <span className="font-sans text-xs font-bold text-white/60 w-8 text-right tabular-nums">
                      {weight}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "< 2s", label: "Formation time" },
                { value: "5", label: "Scoring factors" },
                { value: "50+", label: "Candidates evaluated" },
              ].map(({ value, label }, i) => (
                <div
                  key={label}
                  className="rounded-2xl p-4 text-center backdrop-blur-sm"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateY(0)" : "translateY(12px)",
                    transition: `opacity 0.5s ease ${1000 + i * 100}ms, transform 0.5s ease ${1000 + i * 100}ms`,
                  }}
                >
                  <p className="font-sans font-extrabold text-[#0D9488] text-xl mb-1">{value}</p>
                  <p className="font-sans text-white/35 text-[11px] leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
