import { LANDING_SECTIONS } from "@/features/landing/constants/landing-sections";
import { useLandingSectionNavigation } from "@/features/landing/hooks/use-landing-section-navigation";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

export function SideNav() {
  const { activeSection, scrollToSection, scrollToTop } =
    useLandingSectionNavigation();

  return (
    <div className="fixed top-1/2 left-6 z-100 hidden -translate-y-1/2 flex-col items-center lg:flex">
      <nav
        className="flex flex-col items-center gap-5"
        aria-label="Page navigation"
      >
        {LANDING_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <Button
              key={section.id}
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => scrollToSection(section.id)}
              className="group relative h-6 w-6 rounded-full focus-visible:ring-forge-teal"
              aria-label={`Go to ${section.label}`}
              aria-current={isActive ? "location" : undefined}
            >
              {/* Central Dot */}
              <div
                className={cn(
                  "rounded-full transition-all duration-300",
                  isActive
                    ? "h-2.5 w-2.5 bg-forge-teal shadow-[0_0_10px_rgba(13,148,136,0.4)]"
                    : "h-1 w-1 bg-slate-muted group-hover:bg-forge-teal/50 dark:text-white/40",
                )}
              />

              {/* Hover Label */}
              <span className="pointer-events-none absolute left-full ml-4 -translate-x-1 rounded-md border border-ink/5 bg-white px-2 py-1 text-[10px] font-bold tracking-wider whitespace-nowrap text-ink uppercase opacity-0 shadow-lg transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 dark:border-white/10 dark:bg-zinc-900 dark:text-white">
                {section.label}
              </span>
            </Button>
          );
        })}
      </nav>

      {/* Scroll to top hint */}
      {activeSection !== "hero" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={scrollToTop}
            className="p-1.5 text-slate-muted hover:text-forge-teal"
            aria-label="Scroll to top"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
