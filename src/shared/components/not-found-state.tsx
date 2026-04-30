import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface NotFoundStateProps {
  fullPage?: boolean;
}

export function NotFoundState({ fullPage = false }: NotFoundStateProps) {
  return (
    <main
      className={cn(
        "flex items-center justify-center bg-canvas px-4 py-10",
        fullPage ? "min-h-screen" : "min-h-[60vh]",
      )}
    >
      <section
        aria-labelledby="not-found-heading"
        className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-forge-teal/10 text-forge-teal"
          aria-hidden="true"
        >
          <Compass size={22} />
        </div>

        <h1 id="not-found-heading" className="text-2xl font-bold text-ink">
          This page is not here
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-muted">
          The link may be old, or the page may have moved.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="primary">
            <Link to="/home">Go home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Start page</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
