import { cn } from "@/shared/lib/utils";
import { appBottomNavigation } from "@/features/app-shell/lib/app-navigation";
import { TabButton } from "./tab-button";

interface AppBottomNavProps {
  className?: string;
}

export function AppBottomNav({ className }: AppBottomNavProps) {
  return (
    <nav
      aria-label="Mobile navigation"
      className={cn(
        "fixed bottom-2 left-1/2 z-50",
        "flex h-14 w-[calc(100dvw-1rem)] max-w-[30rem] -translate-x-1/2 items-stretch md:hidden",
        "rounded-full bg-background/92 backdrop-blur-2xl",
        "border border-border/80 shadow-[0_10px_34px_rgba(0,0,0,0.38)]",
        "safe-area-inset-bottom pointer-events-auto overflow-hidden [contain:layout_paint]",
        className,
      )}
    >
      <div className="z-10 flex h-full w-full items-center justify-between px-1.5">
        {appBottomNavigation.map((tab) => (
          <TabButton key={tab.id} item={tab} />
        ))}
      </div>
    </nav>
  );
}
