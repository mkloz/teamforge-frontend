import { useRef } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useNodeCanvas } from "../hooks/use-node-canvas";
import { TeamForgeLogo } from "./logo";

/* ─── Glass cards ─── */

function MbtiCard() {
  return (
    <div
      className="rounded-2xl px-4 py-3.5 w-[180px]"
      style={{
        background: "rgba(10,18,18,0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(13,148,136,0.2)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        animation: "card-reveal 0.6s ease-out 0.9s both, float-card 4s ease-in-out 1.5s infinite alternate",
      }}
      aria-hidden="true"
    >
      <p className="text-[#0D9488]/60 text-[9px] font-semibold font-sans mb-1.5 uppercase tracking-[0.15em]">
        Personality
      </p>
      <p className="text-[#14B8A6] text-2xl font-extrabold font-sans tracking-tight mb-2.5">
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
            <span className="text-[#14B8A6] text-[8px] font-bold font-sans w-2.5">
              {label}
            </span>
            <div className="flex-1 h-[3px] rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${fill}%`,
                  background: "linear-gradient(90deg, #0D9488, #14B8A6)",
                }}
              />
            </div>
            <span className="text-white/20 text-[8px] font-sans w-2.5 text-right">
              {peer}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GroupCard() {
  const members = [
    { initials: "AK", color: "#0D9488" },
    { initials: "MR", color: "#14B8A6" },
    { initials: "LP", color: "#0f766e" },
    { initials: "DH", color: "#0a6460" },
  ];

  return (
    <div
      className="rounded-2xl px-4 py-3.5 w-[200px]"
      style={{
        background: "rgba(10,18,18,0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(13,148,136,0.2)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        animation: "card-reveal 0.6s ease-out 1.1s both, float-card-b 5s ease-in-out 1.7s infinite alternate",
      }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[#0D9488]/60 text-[9px] font-semibold font-sans uppercase tracking-[0.15em]">
          Your Group
        </p>
        <span className="text-[#F59E0B] text-[9px] font-bold font-sans bg-[#F59E0B]/10 px-2 py-0.5 rounded-full border border-[#F59E0B]/20">
          94% match
        </span>
      </div>
      <div className="flex -space-x-2 mb-3">
        {members.map((m, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold font-sans ring-2 ring-[#090909]"
            style={{ background: m.color, zIndex: members.length - i }}
          >
            {m.initials}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {["Hiking", "Tech", "Coffee"].map((tag) => (
          <span
            key={tag}
            className="text-[8px] font-medium font-sans text-white/30 bg-white/[0.05] px-1.5 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrustCard() {
  const circumference = 2 * Math.PI * 16;
  const score = 4.2;

  return (
    <div
      className="rounded-2xl px-4 py-3.5 w-[150px]"
      style={{
        background: "rgba(10,18,18,0.8)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(13,148,136,0.2)",
        boxShadow:
          "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        animation: "card-reveal 0.6s ease-out 1.3s both, float-card-c 3.5s ease-in-out 1.9s infinite alternate",
      }}
      aria-hidden="true"
    >
      <p className="text-[#0D9488]/60 text-[9px] font-semibold font-sans mb-2.5 uppercase tracking-[0.15em]">
        Trust Score
      </p>
      <div className="flex items-center gap-2.5">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle
            cx="20" cy="20" r="16"
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"
          />
          <circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke="url(#heroTrustGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - score / 5)}
            transform="rotate(-90 20 20)"
          />
          <defs>
            <linearGradient id="heroTrustGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0D9488" />
              <stop offset="100%" stopColor="#14B8A6" />
            </linearGradient>
          </defs>
          <text
            x="20" y="20" textAnchor="middle" dominantBaseline="central"
            fill="white" fontSize="9" fontWeight="700" fontFamily="Inter, sans-serif"
          >
            {score}
          </text>
        </svg>
        <div>
          <p className="text-white/40 text-[9px] font-sans leading-snug">Verified</p>
          <p className="text-[#14B8A6] text-[9px] font-semibold font-sans leading-snug">
            Reliable
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Animated orb ─── */

function ForgeOrb() {
  return (
    <div
      className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px]"
      style={{ animation: "hero-fade-in-right 1s ease-out 0.3s both" }}
    >
      {/* Outer rotating ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(13,148,136,0.25), rgba(20,184,166,0.08), rgba(245,158,11,0.12), rgba(13,148,136,0.25))",
          animation: "orb-rotate 20s linear infinite",
          filter: "blur(1px)",
        }}
        aria-hidden="true"
      />

      {/* Inner glow */}
      <div
        className="absolute inset-3 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(13,148,136,0.15), rgba(9,9,9,0.95) 70%)",
          animation: "orb-pulse 4s ease-in-out infinite",
        }}
        aria-hidden="true"
      />

      {/* Core dark circle */}
      <div
        className="absolute inset-4 rounded-full bg-[#090909] border border-white/[0.04]"
        aria-hidden="true"
      />

      {/* Orbiting dots */}
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <div
          key={deg}
          className="absolute inset-0"
          style={{ animation: `orb-rotate ${18 + i * 2}s linear infinite` }}
          aria-hidden="true"
        >
          <div
            className="absolute rounded-full"
            style={{
              width: i === 0 ? 8 : 5,
              height: i === 0 ? 8 : 5,
              top: "4%",
              left: "50%",
              transform: `translateX(-50%) rotate(${deg}deg)`,
              background: i === 0 ? "#F59E0B" : "#0D9488",
              boxShadow:
                i === 0
                  ? "0 0 12px rgba(245,158,11,0.6)"
                  : "0 0 8px rgba(13,148,136,0.4)",
            }}
          />
        </div>
      ))}

      {/* Center logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <TeamForgeLogo className="w-20 h-20 md:w-24 md:h-24" showBackground={false} />
      </div>

      {/* Glass cards positioned around the orb */}
      <div className="absolute -left-44 top-4 hidden lg:block">
        <MbtiCard />
      </div>
      <div className="absolute -right-48 top-8 hidden lg:block">
        <GroupCard />
      </div>
      <div className="absolute -right-36 -bottom-4 hidden lg:block">
        <TrustCard />
      </div>
    </div>
  );
}

/* ─── Hero ─── */

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
      className="relative min-h-screen flex items-center overflow-hidden bg-[#090909]"
      aria-label="Hero"
    >
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(13,148,136,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13,148,136,0.025) 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 0%, #090909 100%)",
        }}
      />

      {/* Bottom fade for section transition */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        aria-hidden="true"
        style={{
          background: "linear-gradient(to bottom, transparent, #090909)",
        }}
      />

      {/* ─── Content ─── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-28 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">

          {/* Left: copy + CTAs */}
          <div
            className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl"
            style={{ animation: "hero-fade-in 0.8s ease-out both" }}
          >
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full border border-[#0D9488]/25 bg-[#0D9488]/[0.06]">
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#0D9488]"
                style={{
                  boxShadow: "0 0 6px rgba(13,148,136,0.8)",
                  animation: "pulse-glow 2.5s ease-in-out infinite",
                }}
                aria-hidden="true"
              />
              <span className="text-[#14B8A6] text-[11px] font-semibold font-sans uppercase tracking-[0.14em]">
                Smart Group Formation
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-sans font-extrabold text-white leading-[1.08] mb-5 text-balance"
              style={{ fontSize: "clamp(2.25rem, 5.5vw, 4rem)" }}
            >
              Find your people,
              <br />
              <span
                className="relative inline-block"
                style={{
                  background:
                    "linear-gradient(135deg, #14B8A6, #0D9488 40%, #F59E0B)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 32px rgba(13,148,136,0.35))",
                }}
              >
                intelligently.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="font-sans text-base md:text-lg text-white/50 leading-relaxed mb-8 max-w-md text-pretty">
              TeamForge maps your personality, interests, and social connections
              to form the perfect small group for any activity — in under two
              seconds.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-10 w-full sm:w-auto">
              <a
                href="/register"
                className="group w-full sm:w-auto flex items-center justify-center gap-2.5 font-sans text-sm font-semibold text-white bg-[#0D9488] hover:bg-[#0f9e92] rounded-xl px-7 py-3.5 transition-all duration-200"
                style={{
                  boxShadow:
                    "0 0 24px rgba(13,148,136,0.35), 0 2px 8px rgba(0,0,0,0.4)",
                }}
              >
                Get Started — Free
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </a>
              <button
                onClick={() =>
                  document
                    .querySelector("#how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="w-full sm:w-auto flex items-center justify-center gap-2 font-sans text-sm font-medium text-white/50 hover:text-white/80 border border-white/10 hover:border-white/25 rounded-xl px-7 py-3.5 transition-all duration-200"
              >
                See How It Works
              </button>
            </div>

            {/* Stats bar */}
            <div
              className="flex items-center gap-6 px-5 py-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {PRODUCT_STATS.map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-5">
                  {i > 0 && (
                    <div
                      className="w-px h-5 bg-white/[0.07]"
                      aria-hidden="true"
                    />
                  )}
                  <div className="text-center lg:text-left">
                    <p className="font-sans font-bold text-[#14B8A6] text-base leading-none mb-0.5">
                      {value}
                    </p>
                    <p className="font-sans text-[10px] text-white/30 leading-none">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: animated orb + floating cards */}
          <div className="flex-1 flex justify-center lg:justify-end">
            <ForgeOrb />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={() =>
          document
            .querySelector("#how-it-works")
            ?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-7 left-1/2 -translate-x-1/2 text-white/15 hover:text-white/40 transition-colors z-10"
        aria-label="Scroll to next section"
      >
        <ChevronDown size={24} className="animate-bounce" />
      </button>
    </section>
  );
}
