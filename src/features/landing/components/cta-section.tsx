import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useInView } from "../hooks/use-in-view";

export function CtaSection() {
  const { ref, inView } = useInView(0.15);
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      setMouse({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };

    section.addEventListener("mousemove", handleMove);
    return () => section.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <section
      id="cta"
      ref={(node) => {
        (ref as (node: HTMLElement | null) => void)(node);
        (sectionRef as React.MutableRefObject<HTMLElement | null>).current =
          node;
      }}
      className="relative overflow-hidden py-28 md:py-40"
      style={{ background: "#090909" }}
      aria-label="Get started with TeamForge"
    >
      {/* Animated cursor spotlight */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        aria-hidden="true"
        style={{
          opacity: hovered ? 1 : 0.4,
          background: `radial-gradient(ellipse 55% 55% at ${mouse.x}% ${mouse.y}%, rgba(13,148,136,0.12) 0%, transparent 70%)`,
        }}
      />

      {/* Static ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(13,148,136,0.07) 0%, transparent 65%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Decorative teal arc — top-left */}
      <div
        className="absolute -top-32 -left-32 w-80 h-80 rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          border: "1px solid rgba(13,148,136,0.12)",
        }}
      />
      <div
        className="absolute -top-20 -left-20 w-56 h-56 rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          border: "1px solid rgba(13,148,136,0.08)",
        }}
      />

      {/* Decorative amber arc — bottom-right */}
      <div
        className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          border: "1px solid rgba(245,158,11,0.1)",
        }}
      />
      <div
        className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
        aria-hidden="true"
        style={{
          border: "1px solid rgba(245,158,11,0.07)",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* ---- OVERLINE ---- */}
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0s, transform 0.6s ease 0s",
          }}
        >
          <span
            className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border mb-8"
            style={{
              color: "#0D9488",
              borderColor: "rgba(13,148,136,0.25)",
              background: "rgba(13,148,136,0.07)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-forge-teal"
              style={{ boxShadow: "0 0 6px #0D9488" }}
              aria-hidden="true"
            />
            Ready when you are
          </span>
        </div>

        {/* ---- HEADLINE ---- */}
        <div
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}
        >
          <h2
            className="font-sans font-bold text-white text-balance mb-6 leading-tight"
            style={{ fontSize: "clamp(2rem, 5.5vw, 3.5rem)" }}
          >
            Stop waiting for the right{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #0D9488, #14B8A6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              group
            </span>{" "}
            to appear.
          </h2>
          <p
            className="font-sans text-lg leading-relaxed text-pretty max-w-xl mx-auto mb-12"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Your personality, your interests, your people – forged into a group
            made for you, in one tap.
          </p>
        </div>

        {/* ---- CTAs ---- */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
          }}
        >
          <a
            href="/register"
            className="group relative inline-flex items-center gap-2.5 font-sans text-base font-semibold rounded-xl px-8 py-4 transition-all duration-300 overflow-hidden"
            style={{
              background: "#0D9488",
              color: "white",
              boxShadow: "0 0 24px rgba(13,148,136,0.35)",
            }}
            onMouseEnter={(e) => {
              setHovered(true);
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 40px rgba(13,148,136,0.55)";
              (e.currentTarget as HTMLAnchorElement).style.background =
                "#0f9e92";
            }}
            onMouseLeave={(e) => {
              setHovered(false);
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 24px rgba(13,148,136,0.35)";
              (e.currentTarget as HTMLAnchorElement).style.background =
                "#0D9488";
            }}
            aria-label="Create your free TeamForge account"
          >
            {/* Shimmer sweep on hover */}
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)",
                backgroundSize: "200% 100%",
              }}
            />
            <span className="relative">Create Free Account</span>
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="relative transition-transform duration-200 group-hover:translate-x-1"
            />
          </a>

          <a
            href="#how-it-works"
            className="inline-flex items-center gap-2 font-sans text-base font-medium rounded-xl px-8 py-4 transition-all duration-200"
            style={{
              color: "rgba(255,255,255,0.55)",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color =
                "rgba(255,255,255,0.85)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(255,255,255,0.15)";
              (e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(255,255,255,0.07)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color =
                "rgba(255,255,255,0.55)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(255,255,255,0.04)";
            }}
          >
            See how it works
          </a>
        </div>

        {/* ---- REASSURANCE LINE ---- */}
        <p
          className="font-sans text-xs"
          style={{
            color: "rgba(255,255,255,0.25)",
            opacity: inView ? 1 : 0,
            transition: "opacity 0.6s ease 0.65s",
          }}
        >
          No credit card required &nbsp;&middot;&nbsp; No spam
          &nbsp;&middot;&nbsp; Free to use
        </p>
      </div>
    </section>
  );
}
