import { useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useNodeCanvas } from "../hooks/use-node-canvas";
import { TeamForgeLogo } from "./logo";

function MbtiCard() {
  return (
    <div
      className="absolute -left-10 top-16 md:-left-20 md:top-12 z-10 rounded-2xl px-4 py-3.5 w-48"
      style={{
        background: "rgba(13,20,20,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(13,148,136,0.25)",
        animation: "float-card 4s ease-in-out infinite alternate",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(13,148,136,0.1)",
      }}
      aria-hidden="true"
    >
      <p className="text-[#0D9488]/70 text-[10px] font-semibold font-sans mb-2 uppercase tracking-widest">
        Personality Type
      </p>
      <p className="text-[#0D9488] text-3xl font-bold font-sans tracking-tight mb-3">
        ENTJ
      </p>
      <div className="space-y-1.5">
        {[
          { label: "E", fill: 80, peer: "I" },
          { label: "N", fill: 55, peer: "S" },
          { label: "T", fill: 70, peer: "F" },
          { label: "J", fill: 65, peer: "P" },
        ].map(({ label, fill, peer }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-[#0D9488] text-[9px] font-bold font-sans w-3">{label}</span>
            <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${fill}%`,
                  background: "linear-gradient(90deg, #0D9488, #14B8A6)",
                }}
              />
            </div>
            <span className="text-white/25 text-[9px] font-sans w-3 text-right">{peer}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupCard() {
  const members = [
    { initials: "AK", hue: "#0D9488" },
    { initials: "MR", hue: "#14B8A6" },
    { initials: "LP", hue: "#0f766e" },
    { initials: "DH", hue: "#0a6460" },
  ];

  return (
    <div
      className="absolute -right-8 top-8 md:-right-16 md:top-4 z-10 rounded-2xl px-4 py-3.5 w-52"
      style={{
        background: "rgba(13,20,20,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(13,148,136,0.25)",
        animation: "float-card-b 5s ease-in-out infinite alternate",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(13,148,136,0.1)",
      }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#0D9488]/70 text-[10px] font-semibold font-sans uppercase tracking-widest">
          Your Group
        </p>
        <span className="text-[#F59E0B] text-[10px] font-bold font-sans bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">
          94% match
        </span>
      </div>
      <div className="flex -space-x-2.5 mb-3">
        {members.map((m, i) => (
          <div
            key={i}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold font-sans ring-2 ring-[#090909]"
            style={{ background: m.hue }}
          >
            {m.initials}
          </div>
        ))}
      </div>
      <div className="h-1 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: "94%",
            background: "linear-gradient(90deg, #F59E0B, #FCD34D)",
          }}
        />
      </div>
      <div className="flex items-center gap-1.5 mt-2.5">
        {["Hiking", "Tech", "Coffee"].map((tag) => (
          <span
            key={tag}
            className="text-[9px] font-medium font-sans text-white/40 bg-white/6 px-1.5 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrustCard() {
  const circumference = 2 * Math.PI * 18;
  const score = 4.2;

  return (
    <div
      className="absolute -right-6 bottom-12 md:-right-12 md:bottom-16 z-10 rounded-2xl px-4 py-3.5 w-40"
      style={{
        background: "rgba(13,20,20,0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(13,148,136,0.25)",
        animation: "float-card-c 3.5s ease-in-out infinite alternate",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(13,148,136,0.1)",
      }}
      aria-hidden="true"
    >
      <p className="text-[#0D9488]/70 text-[10px] font-semibold font-sans mb-2.5 uppercase tracking-widest">
        Trust Score
      </p>
      <div className="flex items-center gap-3">
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
          <circle
            cx="22" cy="22" r="18"
            fill="none"
            stroke="url(#trustGrad)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - score / 5)}
            transform="rotate(-90 22 22)"
          />
          <defs>
            <linearGradient id="trustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
          <text x="22" y="22" textAnchor="middle" dominantBaseline="central"
            fill="white" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">
            {score}
          </text>
        </svg>
        <div>
          <p className="text-white/60 text-[10px] font-sans leading-snug">Verified</p>
          <p className="text-[#0D9488] text-[10px] font-semibold font-sans leading-snug">Reliable</p>
        </div>
      </div>
    </div>
  );
}

const PRODUCT_STATS = [
  { value: "4D", label: "personality vectors" },
  { value: "5", label: "matching factors" },
  { value: "< 2s", label: "group formation" },
];

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useNodeCanvas(canvasRef);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#090909]"
      aria-label="Hero"
    >
      {/* Animated node-graph canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `linear-gradient(rgba(13,148,136,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13,148,136,0.03) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 0%, #090909 100%)",
        }}
      />

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
        aria-hidden="true"
        style={{ background: "linear-gradient(to bottom, transparent, #090909)" }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto pt-28 pb-16">

        {/* Logo mark */}
        <div className="mb-6">
          <TeamForgeLogo className="w-16 h-16" showBackground={false} />
        </div>

        {/* Eyebrow pill */}
        <div className="flex items-center gap-2 mb-7 px-3.5 py-1.5 rounded-full border border-[#0D9488]/30 bg-[#0D9488]/8">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#0D9488]"
            style={{ boxShadow: "0 0 6px rgba(13,148,136,0.8)", animation: "pulse-glow 2.5s ease-in-out infinite" }}
            aria-hidden="true"
          />
          <span className="text-[#0D9488] text-xs font-semibold font-sans uppercase tracking-widest">
            Smart Group Formation
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-balance font-sans font-bold text-white leading-[1.1] mb-5"
          style={{ fontSize: "clamp(2.5rem, 7vw, 4.25rem)" }}
        >
          Find your people,{" "}
          <span
            className="relative"
            style={{
              color: "#14B8A6",
              textShadow: "0 0 48px rgba(13,148,136,0.5)",
            }}
          >
            intelligently.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-lg md:text-xl text-white/55 leading-relaxed mb-10 max-w-xl text-pretty">
          TeamForge uses personality science, shared interests, and your social
          graph to form the perfect small group for any activity.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-12 w-full sm:w-auto">
          <a
            href="/register"
            className="group w-full sm:w-auto flex items-center justify-center gap-2.5 font-sans text-base font-semibold text-white bg-[#0D9488] rounded-xl px-8 py-3.5 transition-all duration-200 hover:bg-[#0f9e92]"
            style={{ boxShadow: "0 0 28px rgba(13,148,136,0.4), 0 2px 8px rgba(0,0,0,0.3)" }}
          >
            Get Started — Free
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
          </a>
          <button
            onClick={() =>
              document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-sans text-base font-medium text-white/60 hover:text-white border border-white/12 hover:border-white/30 rounded-xl px-8 py-3.5 transition-all duration-200"
          >
            See How It Works
          </button>
        </div>

        {/* Product stats — real, factual */}
        <div
          className="flex items-center gap-5 md:gap-8 px-6 py-3.5 rounded-2xl"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {PRODUCT_STATS.map(({ value, label }, i) => (
            <div key={label} className="flex items-center gap-4">
              {i > 0 && <div className="w-px h-6 bg-white/10" aria-hidden="true" />}
              <div className="text-center">
                <p className="font-sans font-bold text-[#0D9488] text-lg leading-none mb-0.5">{value}</p>
                <p className="font-sans text-[11px] text-white/35 leading-none">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Glass cards — desktop only */}
      <div className="relative hidden lg:block w-full max-w-3xl mx-auto h-0" aria-hidden="true">
        <MbtiCard />
        <GroupCard />
        <TrustCard />
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() =>
          document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 hover:text-white/50 transition-colors"
        aria-label="Scroll to next section"
      >
        <ChevronDown size={26} className="animate-bounce" />
      </button>
    </section>
  );
}
