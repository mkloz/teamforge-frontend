import { Link } from "@tanstack/react-router";
import { Home, Plus } from "lucide-react";

import { TeamForgeLogo } from "@/assets/logo";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import { SoloActivityScene } from "./solo-activity-scene";

interface NotFoundStateProps {
  fullPage?: boolean;
}

export function NotFoundState({ fullPage = false }: NotFoundStateProps) {
  return (
    <main
      className={cn(
        "relative isolate overflow-hidden bg-canvas text-ink",
        fullPage ? "min-h-screen" : "min-h-96 rounded-2xl",
      )}
    >
      <section
        aria-labelledby="not-found-heading"
        className={cn(
          "relative mx-auto flex w-full max-w-7xl flex-col px-5 pt-6 pb-8 sm:px-8 sm:pt-8 lg:px-12",
          fullPage ? "min-h-screen" : "min-h-96",
        )}
      >
        <Link
          to="/"
          className="relative z-20 inline-flex w-fit items-center gap-3 rounded-xl text-ink/70 text-sm transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          aria-label="Go to TeamForge start page"
        >
          <span className="flex size-9 items-center justify-center rounded-lg border border-border bg-card/80 shadow-sm">
            <TeamForgeLogo className="size-6" showBackground={false} />
          </span>
          <span className="font-black">TeamForge</span>
        </Link>

        <SoloActivityScene className="absolute inset-0 lg:hidden" />

        <div className="relative z-10 flex flex-1 items-end pb-8 sm:pb-12 lg:items-center lg:pb-0">
          <div className="relative grid w-full gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12">
            <SoloActivityScene className="hidden overflow-visible lg:block" />
            <div className="w-full max-w-lg lg:justify-self-end">
              <p className="mb-4 font-black text-slate-muted text-sm uppercase tracking-widest">
                404
              </p>
              <h1
                id="not-found-heading"
                className="max-w-96 font-black text-5xl text-ink leading-none tracking-tight sm:text-6xl lg:text-7xl"
              >
                A group of one.
              </h1>
              <p className="mt-6 max-w-lg text-base text-slate-muted leading-relaxed sm:text-lg">
                You're the only person here because this page is a dead end.
                TeamForge is about shared experiences, so let's get you back.
              </p>

              <div className="mt-8 grid gap-3 sm:flex">
                <Button asChild size="lg">
                  <Link {...buildForgeLaunchNavigation()}>
                    <Plus className="size-5" aria-hidden="true" />
                    Forge my group
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/">
                    <Home className="size-5" aria-hidden="true" />
                    Back to landing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
