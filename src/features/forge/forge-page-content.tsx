import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { AnimatedBriefCycler } from "./components/animated-brief-cycler";
import { ForgeTemplateRecommendations } from "./components/forge-template-recommendations";

interface ForgePageShellProps {
  children: React.ReactNode;
  isOpen?: boolean;
}

interface ForgeIntroContentProps {
  onForgeClick: (options?: {
    idea?: { detail?: string; laneKey?: string; title: string };
    templateId?: string;
  }) => void;
}

export function ForgePageShell({
  children,
  isOpen = false,
}: ForgePageShellProps) {
  return (
    <div
      className={cn(
        "mx-auto flex h-full flex-col md:pb-12",
        isOpen
          ? "w-full max-w-none gap-0 px-0"
          : "w-full max-w-6xl gap-8 px-4 sm:px-6 md:px-8",
      )}
    >
      {children}
    </div>
  );
}

export function ForgeIntroContent({ onForgeClick }: ForgeIntroContentProps) {
  return (
    <div className="flex flex-col gap-10 py-5 lg:py-10">
      {/* Hero */}
      <section
        id="forge-hero"
        className="grid gap-7 border-border border-b pb-8 md:grid-cols-[minmax(0,1fr)_minmax(16rem,25rem)] md:items-end md:pb-10 lg:gap-12"
      >
        <div className="flex min-w-0 flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h1 className="max-w-3xl text-balance text-center font-black text-4xl text-foreground leading-tight md:text-left md:text-display-lg">
              What are you trying to make happen?
            </h1>
            <p className="max-w-xl text-pretty font-medium text-base text-muted-foreground leading-relaxed">
              Set the activity and group size. TeamForge opens the conversation.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              onClick={() => onForgeClick()}
              variant="primary"
              size="hero"
              className="w-full sm:w-auto"
              aria-label="Start forging a group"
            >
              <Plus size={20} />
              Start
            </Button>
          </div>
        </div>

        <AnimatedBriefCycler />
      </section>

      <ForgeTemplateRecommendations
        onSelect={(templateId) => onForgeClick({ templateId })}
      />
    </div>
  );
}
