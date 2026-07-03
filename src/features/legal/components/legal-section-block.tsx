import { FileCheck2, LockKeyhole } from "lucide-react";
import { legalSectionIcons } from "@/features/legal/data/legal-section-icons";
import type { LegalSection } from "@/features/legal/types/legal-page";
import { IconTile } from "@/shared/components/ui/icon-tile";

interface LegalSectionBlockProps {
  section: LegalSection;
}

export function LegalSectionBlock({ section }: LegalSectionBlockProps) {
  const SectionIcon = legalSectionIcons[section.id] ?? FileCheck2;

  return (
    <section
      id={section.id}
      className="legal-section-containment grid scroll-mt-24 gap-5 border-border/70 border-b py-7 lg:grid-cols-[minmax(16rem,20rem)_minmax(0,1fr)] lg:gap-10"
    >
      <div className="flex min-w-0 items-start gap-3">
        <IconTile
          icon={SectionIcon}
          size="sm"
          shape="square"
          bordered
          className="mt-0.5 size-6 rounded-xl bg-primary/8"
          iconClassName="size-3.5"
        />
        <h2 className="max-w-sm text-balance font-black text-ink text-xl leading-tight">
          {section.heading}
        </h2>
      </div>

      <div className="grid max-w-3xl gap-4">
        <p className="font-medium text-base text-slate-muted leading-relaxed">
          {section.body}
        </p>
        <ul className="grid gap-2">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2.5">
              <LockKeyhole
                className="mt-1 size-3.5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="font-medium text-ink/82 text-sm leading-relaxed">
                {bullet}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
