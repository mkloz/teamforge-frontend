import { Link } from "@tanstack/react-router";
import { ArrowRight, Download } from "lucide-react";
import { Fragment } from "react";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { SheetClose } from "@/shared/components/ui/sheet";
import { usePwaDisplayMode } from "@/shared/hooks/use-pwa-display-mode";

const TEAMFORGE_LINKS = [
  { to: "/", label: "About TeamForge" },
  { to: "/download", label: "Download" },
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of use" },
] as const;

export function TeamForgeLinks() {
  const { isStandalone } = usePwaDisplayMode();
  const links = isStandalone
    ? TEAMFORGE_LINKS
    : TEAMFORGE_LINKS.filter((link) => link.to !== "/download");

  return (
    <section
      aria-labelledby="teamforge-links-title"
      className="border-border/50 border-t px-4 py-3"
    >
      <p
        id="teamforge-links-title"
        className="px-3 pb-1.5 font-semibold text-muted-foreground text-xs"
      >
        TeamForge
      </p>

      {!isStandalone ? <InstallTeamForgeLink /> : null}

      <nav
        aria-label="TeamForge information"
        className="flex flex-wrap items-center gap-x-3 px-3"
      >
        {links.map((link, index) => (
          <Fragment key={link.to}>
            {index > 0 ? (
              <span
                className="h-3 w-px shrink-0 bg-border/80"
                aria-hidden="true"
              />
            ) : null}
            <SheetClose asChild>
              <Link
                to={link.to}
                className="inline-flex min-h-11 items-center rounded-md font-medium text-muted-foreground text-xs transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            </SheetClose>
          </Fragment>
        ))}
      </nav>
    </section>
  );
}

function InstallTeamForgeLink() {
  return (
    <SheetClose asChild>
      <Link
        to="/download"
        className="group flex min-w-0 items-center gap-3 rounded-xl px-3 py-2 text-foreground transition-colors duration-150 hover:bg-muted/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Install TeamForge on your phone or computer"
      >
        <IconTile icon={Download} tone="neutral" size="md" />

        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-sm">Install TeamForge</span>
          <span className="block text-muted-foreground text-xs">
            On your phone or computer
          </span>
        </span>

        <ArrowRight
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          strokeWidth={2}
          aria-hidden="true"
        />
      </Link>
    </SheetClose>
  );
}
