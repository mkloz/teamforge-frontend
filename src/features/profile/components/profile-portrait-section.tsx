import type { ProfilePortraitInsight } from "../lib/profile-insights";
import { ProfileSectionHeading } from "./profile-section-heading";

interface ProfilePortraitSectionProps {
  portrait: ProfilePortraitInsight;
}

export function ProfilePortraitSection({
  portrait,
}: ProfilePortraitSectionProps) {
  const confidenceLabel = {
    early: "Early read",
    high: "Strong read",
    medium: "Good read",
  }[portrait.confidence];
  const readLabel =
    portrait.mode === "hybrid" ? "Blended read" : confidenceLabel;
  const visibleDetails = portrait.details.slice(0, 2);

  return (
    <section className="flex flex-col gap-5 border-t border-border/60 pt-6 sm:pt-8">
      <div className="flex max-w-4xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <ProfileSectionHeading>Profile sketch</ProfileSectionHeading>
          <span className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] font-black text-slate-muted">
            {readLabel}
          </span>
        </div>
        <h2 className="max-w-3xl text-[1.6rem] font-black leading-tight tracking-tight text-ink md:text-3xl">
          {portrait.title}
        </h2>
        <p className="max-w-3xl text-base font-medium leading-relaxed text-ink/82 text-pretty md:text-lg">
          {getCompactLead(portrait.lead)}
        </p>
      </div>

      <div className="grid max-w-3xl gap-4 sm:grid-cols-2 sm:gap-5">
        {visibleDetails.map((detail) => (
          <div
            key={`${detail.label}-${detail.value}`}
            className="flex flex-col gap-1"
          >
            <p className="text-xs font-black uppercase tracking-widest text-slate-muted">
              {detail.label}
            </p>
            <p className="text-sm font-semibold leading-snug text-ink/85">
              {getCompactSentence(detail.value)}
            </p>
          </div>
        ))}
      </div>

      {portrait.mode === "hybrid" && portrait.secondaryCandidate ? (
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-muted">
          <span>Also reads as</span>
          <span className="h-px w-5 bg-border" aria-hidden="true" />
          <span className="text-ink/80">
            {portrait.secondaryCandidate.title}
          </span>
        </div>
      ) : null}
    </section>
  );
}

function getCompactLead(value: string) {
  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentences.slice(0, 2).join(" ").trim();
}

function getCompactSentence(value: string) {
  const [sentence] = value.match(/[^.!?]+[.!?]+/g) ?? [value];
  return sentence.trim();
}
