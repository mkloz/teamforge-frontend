import { useMouseGlow } from "../../hooks/use-mouse-glow";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  const { sectionRef, glowRef } = useMouseGlow();

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="relative overflow-hidden py-28 md:py-40 bg-hero-bg"
      aria-label="Get started with TeamForge"
    >
      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        aria-hidden="true"
        style={{
          opacity: 0,
          background: `radial-gradient(circle at center, rgba(13, 148, 136, 0.15) 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="inline-flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-forge-teal/25 bg-forge-teal/10 text-forge-teal mb-8">
            <span
              className="w-1.5 h-1.5 rounded-full bg-forge-teal shadow-[0_0_6px_#0D9488]"
              aria-hidden="true"
            />
            Ready when you are
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <h2 className="font-sans font-bold text-white text-balance mb-6 leading-tight text-[clamp(2rem,5.5vw,3.5rem)]">
            Stop waiting for the right{" "}
            <span className="text-forge-teal">group</span> to appear.
          </h2>
          <p className="font-sans text-lg leading-relaxed text-pretty max-w-xl mx-auto mb-12 text-text-dark-secondary">
            Your personality, your interests, your people – forged into a group
            made for you, in one tap.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <Button
            asChild
            className="group relative w-full sm:w-auto px-8 py-7 text-base overflow-hidden hover:bg-[#0f9e92] shadow-[0_0_24px_rgba(13,148,136,0.35)] hover:shadow-[0_0_40px_rgba(13,148,136,0.55)]"
          >
            <Link
              to="/auth/register"
              aria-label="Create your free TeamForge account"
            >
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-[linear-gradient(105deg,transparent_30%,rgba(255,255,255,0.12)_50%,transparent_70%)] bg-size-[200%_100%]"
                aria-hidden="true"
              />
              <span className="relative z-10">Create Free Account</span>
              <ArrowRight
                size={18}
                className="relative z-10 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
            className="w-full sm:w-auto px-8 py-7 text-base text-text-dark-secondary bg-white/5 border-white/10 hover:text-white hover:border-white/15 hover:bg-white/10"
          >
            <a href="#how-it-works">See how it works</a>
          </Button>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.7 }}
          className="font-sans text-xs text-text-dark-muted"
        >
          No credit card required &nbsp;&middot;&nbsp; No spam
        </motion.p>
      </div>
    </section>
  );
}
