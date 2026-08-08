import { ChevronUp } from "lucide-react";
import { useLandingSectionNavigation } from "@/features/landing/hooks/use-landing-section-navigation";
import { LANDING_SECTIONS } from "@/shared/components/public-site/landing-sections";
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
              className="group relative size-6 rounded-full focus-visible:ring-primary"
              aria-label={`Go to ${section.label}`}
              aria-current={isActive ? "location" : undefined}
              title={section.label}
            >
              <div
                className={cn(
                  "rounded-full transition-all duration-300",
                  isActive
                    ? "size-2.5 bg-primary shadow-teal-glow"
                    : "size-1 bg-slate-muted group-hover:bg-primary/50",
                )}
              />
            </Button>
          );
        })}
      </nav>

      <div className="mt-8 flex size-9 items-center justify-center">
        {activeSection !== "hero" ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={scrollToTop}
            className="animate-side-nav-reveal p-1.5 text-slate-muted hover:text-foreground motion-reduce:animate-none"
            aria-label="Back to top"
            title="Back to top"
          >
            <ChevronUp className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
