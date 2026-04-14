import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Home" },
  { id: "how-it-works", label: "How It Works" },
  { id: "algorithm", label: "The Algorithm" },
  { id: "about", label: "About" },
  { id: "cta", label: "Get Started" },
];

export function SideNav() {
  const [activeSection, setActiveSection] = useState("hero");

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the entry that has crossed the threshold most recently or is most prominent
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    SECTIONS.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1-5 keys for jumping to sections
      const key = parseInt(e.key);
      if (key >= 1 && key <= SECTIONS.length) {
        const section = SECTIONS[key - 1];
        const element = document.getElementById(section.id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-100 hidden lg:flex flex-col items-center">
      <nav
        className="flex flex-col gap-5 items-center"
        aria-label="Page navigation"
      >
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className="group relative flex items-center justify-center w-6 h-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal rounded-full"
              aria-label={`Go to ${section.label}`}
              aria-current={isActive ? "true" : "false"}
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
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="mt-8 p-1.5 text-slate-muted hover:text-forge-teal transition-colors"
          aria-label="Scroll to top"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </motion.button>
      )}
    </div>
  );
}
