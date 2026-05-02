import { LANDING_SECTIONS } from "@/features/landing/constants/landing-sections";
import { useLandingSectionNavigation } from "@/features/landing/hooks/use-landing-section-navigation";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

export function SideNav() {
  const { activeSection, scrollToSection, scrollToTop } =
    useLandingSectionNavigation();

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-100 hidden lg:flex flex-col items-center">
      <nav
        className="flex flex-col gap-5 items-center"
        aria-label="Page navigation"
      >
        {LANDING_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="group relative flex items-center justify-center w-6 h-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal rounded-full"
              aria-label={`Go to ${section.label}`}
              aria-current={isActive ? "location" : undefined}
            >
              {/* Central Dot */}
              <div
                className={cn(
                  "rounded-full transition-all duration-300",
                  isActive
                    ? "w-2.5 h-2.5 bg-forge-teal shadow-[0_0_10px_rgba(13,148,136,0.4)]"
                    : "w-1 h-1 bg-slate-muted dark:text-white/40 group-hover:bg-forge-teal/50",
                )}
              />

              {/* Hover Label */}
              <span className="absolute left-full ml-4 px-2 py-1 rounded-md bg-white dark:bg-zinc-900 border border-ink/5 dark:border-white/10 text-ink dark:text-white text-[10px] font-bold uppercase tracking-wider pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 -translate-x-1 group-hover:translate-x-0 whitespace-nowrap shadow-lg">
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Scroll to top hint */}
      {activeSection !== "hero" && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={scrollToTop}
          className="mt-8 p-1.5 text-slate-muted hover:text-forge-teal transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        </motion.button>
      )}
    </div>
  );
}
