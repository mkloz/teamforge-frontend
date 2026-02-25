import { ArrowRight } from "lucide-react";
import { useInView } from "../hooks/use-in-view";

export function CtaSection() {
  const { ref, inView } = useInView(0.2);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 md:py-32"
      style={{ background: "#0D9488" }}
      aria-label="Get started with TeamForge"
    >
      {/* Subtle node-pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Radial light source at center */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(20,184,166,0.35) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <div
          className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2
            className="font-sans font-bold text-white text-balance mb-4"
            style={{ fontSize: "clamp(1.75rem, 5vw, 2.75rem)" }}
          >
            Ready to forge your first group?
          </h2>
          <p className="font-sans text-lg text-white/70 leading-relaxed mb-10 text-pretty">
            Join thousands of students and young professionals who stopped
            scrolling and started meeting.
          </p>

          <a
            href="/register"
            className="inline-flex items-center gap-2.5 font-sans text-base font-semibold rounded-xl px-8 py-4 transition-all duration-200"
            style={{
              background: "white",
              color: "#0D9488",
              boxShadow: "0 0 0 0 rgba(255,255,255,0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 24px rgba(255,255,255,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 0 0 0 rgba(255,255,255,0.3)";
            }}
          >
            Create Your Free Account
            <ArrowRight size={18} aria-hidden="true" />
          </a>

          <p className="font-sans text-sm text-white/50 mt-5">
            No credit card. No spam. Just real connections.
          </p>
        </div>
      </div>
    </section>
  );
}
