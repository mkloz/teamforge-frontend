import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { TeamForgeLogo } from "@/assets/logo";
import { cn } from "@/shared/lib/utils";

interface ForgeHeroProps {
  onForgeClick: () => void;
}

export function ForgeHero({ onForgeClick }: ForgeHeroProps) {
  return (
    <section
      id="forge-hero"
      className="relative overflow-hidden rounded-4xl border border-accent/20 bg-linear-to-br from-accent/5 via-card to-accent/10 dark:from-accent/10 dark:via-card dark:to-accent/5 p-8 md:p-10 shadow-sm"
    >
      {/* Decorative glow blobs */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/8 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/6 blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative flex flex-col items-center text-center gap-8">
        {/* Logo Badge — The Voronoi Nexus */}
        <div className="relative group">
          <motion.div
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.15, 0.35, 0.15],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-accent/40 blur-3xl rounded-full"
          />
          <div className="relative flex items-center justify-center w-28 h-28 rounded-4xl bg-card border border-accent/20 shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-1 active:scale-95">
            <TeamForgeLogo className="w-16 h-16" showBackground={false} />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Ready to forge?
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Press once. Get your people. Our algorithm does the rest.
          </p>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onForgeClick}
          className={cn(
            "group relative flex items-center justify-center gap-3 rounded-2xl px-10 py-4.5 w-full max-w-xs overflow-hidden",
            "bg-accent text-accent-foreground font-bold text-base",
            "shadow-[0_12px_40px_rgba(245,158,11,0.35)]",
            "hover:brightness-110 hover:shadow-[0_15px_45px_rgba(245,158,11,0.45)]",
            "active:scale-[0.98] active:shadow-[0_4px_15px_rgba(245,158,11,0.3)]",
            "transition duration-300",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          )}
        >
          {/* Animated Shine Effect */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shine_2s_ease-in-out_infinite] pointer-events-none" />

          <Zap
            size={20}
            aria-hidden="true"
            className="fill-current group-hover:scale-110 group-hover:rotate-12 transition-transform"
          />
          <span className="tracking-tight">Forge My Group</span>
        </button>
      </div>
    </section>
  );
}
