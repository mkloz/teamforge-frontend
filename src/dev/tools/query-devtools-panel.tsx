import { Database } from "lucide-react";
import { lazy, Suspense } from "react";
import { DevToolIconButton } from "@/dev/tools/dev-tool-icon-button";
import { Spinner } from "@/shared/components/ui/spinner";

const LazyReactQueryDevtoolsPanel = lazy(async () => {
  const { ReactQueryDevtoolsPanel } = await import(
    "@tanstack/react-query-devtools"
  );

  return { default: ReactQueryDevtoolsPanel };
});

interface QueryDevtoolsPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QueryDevtoolsPanel({
  isOpen,
  onOpenChange,
}: QueryDevtoolsPanelProps) {
  return (
    <section className="relative">
      {isOpen ? (
        <div
          className="fade-in slide-in-from-top-2 fixed top-16 right-2 left-2 z-10001 max-h-[calc(100dvh-5rem)] animate-in overflow-hidden rounded-xl border border-border/75 bg-card shadow-2xl duration-200 motion-reduce:animate-none md:top-3 md:right-14 md:left-auto md:h-[min(31.25rem,calc(100dvh-1.5rem))] md:w-[min(64rem,calc(100vw-6rem))]"
          data-react-query-devtools-panel
        >
          <Suspense
            fallback={
              <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground text-sm md:h-full">
                <Spinner aria-hidden="true" className="size-4" />
                Loading query inspector
              </div>
            }
          >
            <LazyReactQueryDevtoolsPanel onClose={() => onOpenChange(false)} />
          </Suspense>
        </div>
      ) : null}

      <DevToolIconButton
        active={isOpen}
        expanded={isOpen}
        label="React Query Devtools"
        onClick={() => onOpenChange(!isOpen)}
      >
        <Database aria-hidden="true" className="size-4" />
      </DevToolIconButton>
    </section>
  );
}
