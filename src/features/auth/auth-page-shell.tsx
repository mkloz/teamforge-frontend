import type { ReactNode } from "react";
import { useRef } from "react";
import { AuthPageContent } from "@/features/auth/auth-page-content";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import type {
  VoronoiCatalystHandle,
  VoronoiFormationTarget,
} from "@/shared/lib/voronoi/voronoi-contract";

interface AuthPageShellProps {
  children: ReactNode;
  formation?: VoronoiFormationTarget;
  progress: number;
  scrollDeps: unknown[];
}

export function AuthPageShell({
  children,
  formation,
  progress,
  scrollDeps,
}: AuthPageShellProps) {
  const scrollContainerRef = useRef<HTMLElement>(null);
  const catalystRef = useRef<VoronoiCatalystHandle>(null);

  useScrollToTop(scrollDeps, scrollContainerRef);

  const handleInput = () => {
    catalystRef.current?.pulseTyping();
  };

  return (
    <AuthPageContent
      catalystRef={catalystRef}
      formation={formation}
      onInput={handleInput}
      progress={progress}
      scrollContainerRef={scrollContainerRef}
    >
      {children}
    </AuthPageContent>
  );
}
