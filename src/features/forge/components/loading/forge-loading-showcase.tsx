"use client";

/**
 * ForgeLoadingShowcase — interactive comparison page for all 5 loading concepts.
 * Allows cycling through progress, selecting a concept, and reading the brief
 * for each. The recommended concept is highlighted.
 */

import { useState, useEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { ForgeLoadingAnvil } from "./forge-loading-anvil";
import { ForgeLoadingFurnace } from "./forge-loading-furnace";
import { ForgeLoadingPour } from "./forge-loading-pour";
import { ForgeLoadingOrbit } from "./forge-loading-orbit";
import { ForgeLoadingWave } from "./forge-loading-wave";
import { Play, Pause, RotateCcw, CheckCircle2, Star } from "lucide-react";

const CONCEPTS = [
  {
    id: "anvil",
    label: "A — Anvil Strike",
    tag: "Forge-themed",
    recommended: true,
    summary: "Hammer meets anvil; sparks fly on every strike, a ring fills with progress.",
    description:
      "A hammer swings down onto an anvil at a fixed rhythm. On each strike, 18 spark particles burst outward with realistic gravity and fade. A teal progress arc fills around the outer ring. The animation is kinetic, punchy, and on-brand — every strike reinforces the 'forge' metaphor literally.",
    why: "Directly maps the brand credo ('forge') to a visual action. The rhythm gives time-perception anchoring even without deterministic progress. Sparks create delight without distracting from the wait.",
    colors: ["#0d9488", "#f59e0b", "#374151"],
  },
  {
    id: "furnace",
    label: "B — Glowing Furnace",
    tag: "Forge-themed",
    recommended: false,
    summary: "Furnace door pulses with heat; a bar fills from cold iron to glowing amber.",
    description:
      "A furnace illustration glows with increasing intensity as the progress bar fills. Ember particles float upward like heat shimmer. The bar transitions through steel grey → orange → white-hot amber — a natural temperature metaphor for 'heating up.' Calmer pace than Concept A.",
    why: "Great for longer waits (10s+). The ambient glow and ember flow feel atmospheric rather than frenetic. The temperature metaphor is intuitive ('things are heating up').",
    colors: ["#f59e0b", "#ef4444", "#1f2937"],
  },
  {
    id: "pour",
    label: "C — Molten Pour",
    tag: "Forge-themed",
    recommended: false,
    summary: "A ladle tips and pours glowing metal into a mold that cools and solidifies.",
    description:
      "A ladle SVG tilts and drips simulated molten particles into a crucible mold. The fill level rises with progress, and the metal color cools from amber to silver as it approaches 100%. Unique narrative arc: pour → fill → solidify = waiting → assembling → locked in.",
    why: "Strong visual narrative that maps well to a 3-stage process (scanning, matching, finalizing). The cooling color is a clever way to signal 'almost done.' Works best for slower deterministic loads.",
    colors: ["#fbbf24", "#9ca3af", "#374151"],
  },
  {
    id: "orbit",
    label: "D — Orbital Assembly",
    tag: "Alternative / Geometric",
    recommended: false,
    summary: "Person-tokens orbit a hub and converge into a ring as the algorithm completes.",
    description:
      "Abstract people-tokens orbit a central TeamForge hub in scattered elliptical paths. As progress increases they converge into a tight equidistant ring, and connection lines appear between them. A teal progress arc and amber 'You' token distinguish the viewer from their future group.",
    why: "Directly visualizes the product outcome: scattered individuals becoming a connected group. Clear, modern, and legible on small screens. Best choice for users who prefer data-forward rather than metaphor-based animation.",
    colors: ["#0d9488", "#f59e0b", "#1f2937"],
  },
  {
    id: "wave",
    label: "E — Signal Wave",
    tag: "Alternative / Fluid",
    recommended: false,
    summary: "Radar rings sweep outward; amber match-dots appear around the ring as matches are found.",
    description:
      "Concentric rings radiate from a central origin like a radar ping, with a rotating sweep line. As progress increases, amber person-tokens appear around the outer ring — one per match found. A compact dot-counter at the bottom ticks up. Highly communicative: the user can see the group assembling in real time.",
    why: "Most information-dense of all concepts. Excellent for the TeamForge use case where group-finding is the core value — each amber dot feels like a genuine discovery. Fluid and calm despite being busy.",
    colors: ["#0d9488", "#f59e0b", "#d1d5db"],
  },
];

interface ForgeLoadingShowcaseProps {
  className?: string;
}

export function ForgeLoadingShowcase({ className }: ForgeLoadingShowcaseProps) {
  const [active, setActive] = useState("anvil");
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setPlaying(false); return 100; }
        return p + 0.8;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [playing]);

  const reset = () => { setProgress(0); setPlaying(true); };

  const concept = CONCEPTS.find((c) => c.id === active)!;

  const renderAnimation = () => {
    const p = progress;
    switch (active) {
      case "anvil": return <ForgeLoadingAnvil progress={p} />;
      case "furnace": return <ForgeLoadingFurnace progress={p} />;
      case "pour": return <ForgeLoadingPour progress={p} />;
      case "orbit": return <ForgeLoadingOrbit progress={p} memberCount={5} />;
      case "wave": return <ForgeLoadingWave progress={p} />;
      default: return null;
    }
  };

  return (
    <div className={cn("space-y-6 py-6", className)}>
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-black text-foreground tracking-tight">
          Loading Animation Concepts
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Five proposed concepts for the Phase 1 → Phase 2 transition. Concept A is recommended.
          Use the progress controls to preview each concept at different stages.
        </p>
      </div>

      {/* Tab selector */}
      <div className="flex flex-wrap gap-2">
        {CONCEPTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => { setActive(c.id); reset(); }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200",
              active === c.id
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-card border-border/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {c.recommended && <Star size={11} className={cn("shrink-0", active === c.id ? "fill-current" : "fill-accent text-accent")} />}
            {c.label}
          </button>
        ))}
      </div>

      {/* Main preview + detail */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Animation preview card */}
        <div className="bg-card border border-border/40 rounded-2xl p-6 flex flex-col items-center gap-5">
          <div className="flex items-center gap-2 w-full">
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              concept.tag.includes("Forge") ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
            )}>
              {concept.tag}
            </span>
            {concept.recommended && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full ml-auto">
                <CheckCircle2 size={10} />
                Recommended
              </span>
            )}
          </div>

          {/* Animation stage */}
          <div className="flex-1 flex items-center justify-center min-h-52">
            {renderAnimation()}
          </div>

          {/* Progress controls */}
          <div className="w-full space-y-3">
            <input
              type="range"
              min={0}
              max={100}
              step={0.5}
              value={progress}
              onChange={(e) => { setPlaying(false); setProgress(Number(e.target.value)); }}
              className="w-full accent-primary cursor-pointer h-1.5"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground tabular-nums">{Math.round(progress)}%</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={reset}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                >
                  <RotateCcw size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => { if (progress >= 100) reset(); else setPlaying((p) => !p); }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  {playing ? <Pause size={13} /> : <Play size={13} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Concept brief */}
        <div className="space-y-4">
          <div className="bg-card border border-border/40 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground">{concept.label}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{concept.description}</p>
          </div>

          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">Why it works</p>
            <p className="text-sm text-foreground/80 leading-relaxed">{concept.why}</p>
          </div>

          {/* Color palette preview */}
          <div className="bg-card border border-border/40 rounded-2xl p-4 flex items-center gap-3">
            <p className="text-xs font-semibold text-muted-foreground shrink-0">Palette</p>
            <div className="flex gap-2">
              {concept.colors.map((color) => (
                <div key={color} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-md shadow-sm border border-border/20" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-mono text-muted-foreground">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison summary table */}
      <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/30">
          <h3 className="text-sm font-bold text-foreground">Quick Comparison</h3>
        </div>
        <div className="divide-y divide-border/20">
          {CONCEPTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => { setActive(c.id); reset(); }}
              className={cn(
                "w-full flex items-start gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30",
                active === c.id && "bg-primary/5",
              )}
            >
              <div className="shrink-0 mt-0.5">
                {c.recommended
                  ? <Star size={15} className="text-accent fill-accent" />
                  : <div className="w-3.5 h-3.5 rounded-full border-2 border-border/40 mt-0.5" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">{c.label}</span>
                  <span className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                    c.tag.includes("Forge") ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                  )}>
                    {c.tag}
                  </span>
                  {c.recommended && (
                    <span className="text-[10px] font-bold text-emerald-600">Recommended</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.summary}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
