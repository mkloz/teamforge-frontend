import { useRef } from "react";
import { ArrowRight, ChevronDown, Users, Zap, Shield } from "lucide-react";
import { useNodeCanvas } from "../hooks/use-node-canvas";

function MbtiCard() {
  return (
    <div
      className="absolute -left-8 top-24 md:-left-16 md:top-20 z-10 rounded-2xl px-4 py-3 w-44"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.10)",
        animation: "float-card 4s ease-in-out infinite alternate",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
      aria-hidden="true"
    >
      <p className="text-white/50 text-xs font-medium font-sans mb-1.5 uppercase tracking-wider">
        Your Type
      </p>
      <p className="text-[#0D9488] text-2xl font-bold font-sans tracking-tight">
        ENTJ
      </p>
      <div className="mt-2 space-y-1">
        {[
          { label: "E", fill: 80 },
          { label: "N", fill: 55 },
          { label: "T", fill: 70 },
          { label: "J", fill: 65 },
        ].map(({ label, fill }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className="text-white/40 text-[10px] font-sans w-3">
              {label}
            </span>
            <div className="flex-1 h-1 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#0D9488]"
                style={{ width: `${fill}%` }}
              />
            </div>
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
    { initials: "DH", color: "#0D9488" },
  ];

  return (
    <div
      className="absolute -right-6 top-16 md:-right-12 md:top-12 z-10 rounded-2xl px-4 py-3 w-48"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.10)",
        animation: "float-card-b 5s ease-in-out infinite alternate",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
      aria-hidden="true"
    >
      <p className="text-white/50 text-xs font-medium font-sans mb-2.5 uppercase tracking-wider">
        Your Group
      </p>
      <div className="flex -space-x-2 mb-2.5">
        {members.map((m, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold font-sans border-2 border-[#090909]"
            style={{ background: m.color }}
          >
            {m.initials}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-white/50 text-xs font-sans">Compatibility</span>
        <span className="text-[#F59E0B] text-xs font-bold font-sans">
          94%
        </span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#F59E0B]"
          style={{ width: "94%" }}
        />
      </div>
    </div>
  );
}

function TrustCard() {
  const circumference = 2 * Math.PI * 20;
  const score = 4.2;
  const fraction = score / 5;

  return (
    <div
      className="absolute -right-4 bottom-20 md:-right-8 md:bottom-24 z-10 rounded-2xl px-4 py-3 w-36"
      style={{
        background: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.10)",
        animation: "float-card-c 3.5s ease-in-out infinite alternate",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
      aria-hidden="true"
    >
      <p className="text-white/50 text-xs font-medium font-sans mb-2 uppercase tracking-wider">
        Trust Score
      </p>
      <div className="flex items-center gap-3">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="#0D9488"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - fraction)}
            transform="rotate(-90 24 24)"
          />
          <text
            x="24"
            y="24"
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize="11"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
          >
            {score}
          </text>
        </svg>
        <div>
          <div className="text-white/40 text-[10px] font-sans leading-snug">
            Verified
          </div>
          <div className="text-[#0D9488] text-[10px] font-sans leading-snug">
            Reliable
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useNodeCanvas(canvasRef);

  const scrollToNext = () => {
    const target = document.querySelector("#how-it-works");
    if (target) target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#090909]"
      aria-label="Hero"
    >
      {/* Animated node-graph canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      />

      {/* Radial vignette overlay to focus center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, #090909 100%)",
        }}
        aria-hidden="true"
      />

      {/* Bottom fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent, #090909)",
        }}
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl mx-auto pt-24 pb-20">
        {/* Eyebrow pill */}
        <div className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-[#0D9488]/30 bg-[#0D9488]/10">
          <Zap size={12} className="text-[#F59E0B]" aria-hidden="true" />
          <span className="text-[#0D9488] text-xs font-semibold font-sans uppercase tracking-widest">
            AI-Powered Group Matching
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-balance font-sans font-bold text-white leading-tight mb-5"
          style={{ fontSize: "clamp(2.25rem, 6vw, 3.75rem)" }}>
          Find your people,{" "}
          <span
            className="relative inline-block"
            style={{
              color: "#0D9488",
              textShadow: "0 0 40px rgba(13,148,136,0.4)",
            }}
          >
            intelligently.
          </span>
        </h1>

        {/* Subheadline */}
        <p className="font-sans text-lg md:text-xl text-white/60 leading-relaxed mb-8 max-w-xl text-pretty">
          TeamForge uses personality science, shared interests, and your
          social graph to form the perfect small group for any activity. One
          button. Your people.
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-6 mb-10">
          {[
            { icon: Users, value: "2,400+", label: "active users" },
            { icon: Zap, value: "800+", label: "groups forged" },
            { icon: Shield, value: "4.8", label: "avg trust score" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon size={14} className="text-[#0D9488]" aria-hidden="true" />
              <span className="font-sans text-sm font-semibold text-white/80">
                {value}
              </span>
              <span className="font-sans text-sm text-white/35">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <a
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-sans text-base font-semibold text-white bg-[#0D9488] rounded-xl px-7 py-3.5 transition-all duration-200"
            style={{
              boxShadow: "0 0 24px rgba(13,148,136,0.4)",
              animation: "pulse-glow 2.5s ease-in-out infinite",
            }}
          >
            Get Started — Free
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <button
            onClick={() =>
              document
                .querySelector("#how-it-works")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="w-full sm:w-auto flex items-center justify-center gap-2 font-sans text-base font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-xl px-7 py-3.5 transition-all duration-200"
          >
            See How It Works
          </button>
        </div>
      </div>

      {/* Glass cards cluster — desktop only */}
      <div
        className="relative hidden lg:block w-full max-w-3xl mx-auto"
        aria-hidden="true"
      >
        <MbtiCard />
        <GroupCard />
        <TrustCard />
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 transition-colors"
        aria-label="Scroll to next section"
      >
        <ChevronDown size={28} className="animate-bounce" />
      </button>
    </section>
  );
}
