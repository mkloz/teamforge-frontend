import { Link } from "@tanstack/react-router";
import { legalPageCopy } from "@/features/legal/data/legal-page-copy";
import type { LegalPageKind } from "@/features/legal/types/legal-page";
import { buttonVariants } from "@/shared/components/ui/button-variants";
import { cn } from "@/shared/lib/utils";

interface LegalPageNavProps {
  kind: LegalPageKind;
}

function legalLinkButtonClassName(className?: string) {
  return cn(
    buttonVariants({ variant: "outline", size: "sm", className }).replace(
      /:enabled/g,
      "",
    ),
  );
}

export function LegalPageNav({ kind }: LegalPageNavProps) {
  const copy = legalPageCopy[kind];
  const alternate = kind === "privacy" ? "terms" : "privacy";
  const alternateCopy = legalPageCopy[alternate];

  return (
    <aside className="rounded-2xl border border-border/70 bg-card/55 p-4 lg:sticky lg:top-20">
      <p className="font-semibold text-slate-muted text-xs">On this page</p>
      <nav
        aria-label={`${copy.eyebrow} sections`}
        className="mt-3 grid max-h-48 gap-1 overflow-y-auto pr-1"
      >
        {copy.sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-lg px-2 py-1.5 font-semibold text-slate-muted text-xs leading-snug transition-colors hover:bg-muted/60 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {section.heading}
          </a>
        ))}
      </nav>

      <div className="mt-4 border-border/70 border-t pt-4">
        <Link
          to={alternate === "privacy" ? "/privacy" : "/terms"}
          className={legalLinkButtonClassName("w-full")}
        >
          <span className="flex size-full items-center justify-center gap-2">
            {alternateCopy.eyebrow}
          </span>
        </Link>
      </div>
    </aside>
  );
}
