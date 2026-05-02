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
        "fixed bottom-0 left-0 right-0 z-40",
        "flex md:hidden items-stretch h-14 pt-0 pb-0",
        "bg-background/95 backdrop-blur-2xl",
        "safe-area-inset-bottom pointer-events-auto", // Removed hard horizontal border mapping
        className,
      )}
    >
      <div className="flex w-full items-center justify-around px-2 z-10 h-full">
        {appBottomNavigation.map((tab) => (
          <TabButton key={tab.id} item={tab} />
        ))}
      </div>
    </nav>
  );
}
