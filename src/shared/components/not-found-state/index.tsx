import { Link } from "@tanstack/react-router";
import { Home } from "lucide-react";
import type { ReactNode } from "react";

import { TeamForgeLogo } from "@/assets/logo";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

import { SoloActivityScene } from "./solo-activity-scene";

interface NotFoundStateProps {
  fullPage?: boolean;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export function NotFoundState({
  fullPage = false,
  primaryAction,
  secondaryAction,
}: NotFoundStateProps) {
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
          <IconTile
            tone="none"
            size="lg"
            bordered
            className="size-9 bg-card/80 shadow-sm"
          >
            <TeamForgeLogo className="size-6" showBackground={false} />
          </IconTile>
          <span className="font-black">TeamForge</span>
        </Link>

        <div className="relative z-10 flex flex-1 items-center py-8 lg:py-0">
          <div className="relative mx-auto grid w-full max-w-5xl justify-items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)] lg:items-stretch lg:justify-items-stretch xl:gap-8">
            <SoloActivityScene inline className="h-52 sm:h-60 lg:hidden" />
            <SoloActivityScene className="hidden overflow-visible lg:block" />
            <div className="w-full max-w-lg text-center lg:justify-self-start lg:text-left">
              <p className="mb-4 font-black text-slate-muted text-sm tracking-widest">
                404
              </p>
              <h1
                id="not-found-heading"
                className="mx-auto max-w-96 font-black text-5xl text-ink leading-none tracking-tight sm:text-6xl lg:mx-0 lg:text-7xl"
              >
                A group of one.
              </h1>
              <p className="mt-6 max-w-lg text-base text-slate-muted leading-relaxed sm:text-lg">
                This page does not exist or is no longer available. Choose
                another place to continue.
              </p>

              <div className="mt-8 grid gap-3 sm:flex sm:justify-center lg:justify-start">
                {primaryAction}
                {secondaryAction ?? (
                  <Button asChild variant="outline" size="lg">
                    <Link to="/">
                      <Home className="size-5" aria-hidden="true" />
                      Back to landing
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
