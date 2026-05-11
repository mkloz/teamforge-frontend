import { useActivePathname } from "@/features/app-shell/hooks/use-active-pathname";
import { appBottomNavigation } from "@/features/app-shell/lib/app-navigation";
import { cn } from "@/shared/lib/utils";
import { TabButton } from "./tab-button";

interface AppBottomNavProps {
  className?: string;
}

export function AppBottomNav({ className }: AppBottomNavProps) {
  const pathname = useActivePathname();

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 isolate z-100 md:hidden",
        "px-3 pb-4",
        className,
      )}
    >
      <nav
        aria-label="Mobile navigation"
        className={cn(
          "pointer-events-auto mx-auto flex h-17 w-full max-w-88 items-stretch overflow-hidden rounded-full",
          "border border-border/55 bg-background/78 shadow-2xl shadow-black/15 backdrop-blur-2xl dark:bg-background/68",
          "contain-layout",
        )}
      >
        <div className="grid size-full grid-cols-5 items-stretch gap-1 p-1.5">
          {appBottomNavigation.map((tab) => (
            <TabButton key={tab.id} item={tab} pathname={pathname} />
          ))}
        </div>
      </nav>
    </div>
  );
}
