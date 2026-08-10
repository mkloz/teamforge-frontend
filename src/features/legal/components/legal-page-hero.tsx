import { BadgeCheck } from "lucide-react";
import { LegalBadge } from "@/features/legal/components/legal-badge";
import { legalPageCopy } from "@/features/legal/data/legal-page-copy";
import type { LegalPageKind } from "@/features/legal/types/legal-page";
import { Notice } from "@/shared/components/ui/notice";

interface LegalPageHeroProps {
  kind: LegalPageKind;
}

export function LegalPageHero({ kind }: LegalPageHeroProps) {
  const copy = legalPageCopy[kind];

  return (
    <div className="lg:col-span-2">
      <div className="flex flex-wrap items-center gap-2">
        <LegalBadge kind={kind} />
        <p className="font-semibold text-slate-muted text-xs">
          {copy.updatedAt.startsWith("Pre-launch")
            ? copy.updatedAt
            : `Effective ${copy.updatedAt}`}
        </p>
      </div>

      <h1 className="mt-4 max-w-4xl text-balance font-black text-4xl leading-none tracking-tight sm:text-5xl">
        {copy.title}
      </h1>
      <p className="mt-5 max-w-3xl font-medium text-base text-slate-muted leading-relaxed sm:text-lg">
        {copy.summary}
      </p>

      <Notice
        tone="warning"
        size="lg"
        icon={<BadgeCheck className="size-4" aria-hidden="true" />}
        className="mt-6 max-w-3xl"
        contentClassName="text-ink/80"
      >
        <p className="font-semibold text-sm leading-relaxed">{copy.notice}</p>
      </Notice>
    </div>
  );
}
