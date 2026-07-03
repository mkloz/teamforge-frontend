import { LegalPageHero } from "@/features/legal/components/legal-page-hero";
import { LegalPageNav } from "@/features/legal/components/legal-page-nav";
import { LegalSectionBlock } from "@/features/legal/components/legal-section-block";
import { legalPageCopy } from "@/features/legal/data/legal-page-copy";
import { legalPageMetadata } from "@/features/legal/data/legal-page-metadata";
import type { LegalPageProps } from "@/features/legal/types/legal-page";
import {
  Footer,
  Navbar,
} from "@/shared/components/public-site/public-site-shell";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";

export function LegalPage({ kind }: LegalPageProps) {
  usePageMetadata(legalPageMetadata[kind]);

  const copy = legalPageCopy[kind];

  return (
    <div className="bg-canvas font-sans text-ink antialiased">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-100 -translate-y-24 rounded-lg bg-primary px-4 py-2 text-primary-foreground opacity-0 transition focus:translate-y-0 focus:opacity-100 focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar actionSet={kind} forceSolid />
      <main id="main-content" className="min-h-screen bg-canvas pt-16 text-ink">
        <div className="mx-auto flex w-full max-w-6xl flex-col px-5 sm:px-8 lg:px-10">
          <section className="py-14 sm:py-18">
            <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
              <LegalPageHero kind={kind} />
              <LegalPageNav kind={kind} />
            </div>
          </section>

          <div className="grid gap-4 border-border/70 border-t pb-16">
            {copy.sections.map((section) => (
              <LegalSectionBlock key={section.id} section={section} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
