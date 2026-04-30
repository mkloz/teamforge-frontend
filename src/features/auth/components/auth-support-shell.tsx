import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { Button } from "@/shared/components/ui/button";

import { VoronoiCatalyst } from "./voronoi-catalyst";

interface AuthSupportShellProps {
  title: string;
  description: string;
  backNavigation: {
    to: "/auth/login" | "/auth/register" | "/auth/forgot-password";
    search?: {
      returnTo: string;
    };
  };
  backLabel: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthSupportShell({
  title,
  description,
  backNavigation,
  backLabel,
  children,
  footer,
}: AuthSupportShellProps) {
  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-16 lg:h-24 flex items-center px-4 lg:px-10 z-30 pointer-events-none">
        <Button
          variant="ghost"
          asChild
          size="sm"
          className="pointer-events-auto rounded-full bg-canvas/10 backdrop-blur-sm border border-ink/5 text-primary-foreground hover:text-ink hover:bg-white hover:border-ink/10 hover:shadow-sm h-9 px-4 transition-all group"
        >
          <Link {...backNavigation} className="flex items-center gap-2">
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
            />
            <span className="text-xs font-medium">{backLabel}</span>
          </Link>
        </Button>
      </div>

      <div className="hidden lg:flex flex-1 relative bg-hero-bg border-r border-border items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={0.68} />
      </div>

      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        <BackgroundTexture />

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 scroll-smooth relative z-10">
          <div className="flex flex-col items-center justify-center w-full min-h-full pt-20 pb-10 lg:py-8">
            <div className="w-full max-w-sm px-2 sm:px-10 lg:p-0">
              <div className="rounded-[28px] border border-border/70 bg-card/95 backdrop-blur-xl shadow-[0_24px_80px_rgba(28,28,26,0.12)] p-6 sm:p-8">
                <div className="space-y-2 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-forge-teal">
                    TeamForge
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h1>
                  <p className="text-sm leading-6 text-slate-muted">
                    {description}
                  </p>
                </div>

                <div className="mt-6">{children}</div>

                {footer ? <div className="mt-6">{footer}</div> : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
