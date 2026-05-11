import { LockKeyhole, ShieldCheck, UserCheck } from "lucide-react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

interface SafetyNotesSectionProps {
  detail: GroupPlanDetail;
}

export function SafetyNotesSection({ detail }: SafetyNotesSectionProps) {
  const notes = [
    {
      icon: <UserCheck className="size-4" aria-hidden="true" />,
      label: "Access",
      value: detail.safety.accessNote,
    },
    {
      icon: <LockKeyhole className="size-4" aria-hidden="true" />,
      label: "Privacy",
      value: detail.safety.privacyNote,
    },
    {
      icon: <ShieldCheck className="size-4" aria-hidden="true" />,
      label: "Trust",
      value: detail.safety.trustNote,
    },
  ].filter((note) => note.value);

  if (notes.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="safety-notes-heading">
      <p className="font-black text-forge-teal text-xs uppercase tracking-widest">
        Good to know
      </p>
      <h2
        id="safety-notes-heading"
        className="mt-2 font-black text-2xl text-foreground tracking-tight"
      >
        Boundaries and context
      </h2>

      <div className="mt-6 grid gap-3">
        {notes.map((note) => (
          <article key={note.label} className="flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              {note.icon}
            </div>
            <div>
              <h3 className="font-black text-foreground text-sm">
                {note.label}
              </h3>
              <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                {note.value}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
