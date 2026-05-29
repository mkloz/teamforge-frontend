import { ChevronUp } from "lucide-react";
import { LANDING_SECTIONS } from "@/features/landing/constants/landing-sections";
import { useLandingSectionNavigation } from "@/features/landing/hooks/use-landing-section-navigation";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

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
              className="group relative size-6 rounded-full focus-visible:ring-forge-teal"
              aria-label={`Go to ${section.label}`}
              aria-current={isActive ? "location" : undefined}
              title={section.label}
            >
              <div
                className={cn(
                  "rounded-full transition-all duration-300",
                  isActive
                    ? "size-2.5 bg-forge-teal shadow-teal-glow"
                    : "size-1 bg-slate-muted group-hover:bg-forge-teal/50",
                )}
              />
            </Button>
          );
        })}
      </nav>

      {/* Scroll to top hint */}
      {activeSection !== "hero" && (
        <div className="mt-8 animate-side-nav-reveal motion-reduce:animate-none">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={scrollToTop}
            className="p-1.5 text-slate-muted hover:text-forge-teal"
            aria-label="Back to top"
            title="Back to top"
          >
            <ChevronUp className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}
    </div>
  );
}
