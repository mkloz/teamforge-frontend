import { cn } from "@/shared/lib/utils";
import type { ShowUpSignal } from "./show-up-profile";
import type { UserProfilePanelParticipant } from "./types";

const PERSONALITY_SEGMENTS = [1, 2, 3, 4, 5];

export function ProfilePanelAboutSection({
  participant,
}: {
  participant: UserProfilePanelParticipant;
}) {
  return (
    <section className="border-border/70 border-b px-5 py-5">
      <h4 className="font-bold text-slate-muted text-xs">About</h4>
      {participant.bio ? (
        <p className="mt-2 text-pretty text-ink/80 text-sm leading-relaxed">
          {participant.bio}
        </p>
      ) : (
        <p className="mt-2 text-slate-muted text-sm leading-relaxed">
          {participant.name} has not added a profile note yet.
        </p>
      )}
    </section>
  );
}

export function ProfilePanelSignalsSection({
  isHydratingProfile,
  personalitySignals,
}: {
  isHydratingProfile: boolean;
  personalitySignals: ShowUpSignal[];
}) {
  return (
    <section className="px-5 py-5">
      <h4 className="font-bold text-slate-muted text-xs">
        Personality profile
      </h4>

      {personalitySignals.length > 0 ? (
        <div className="mt-4 flex flex-col gap-4">
          {personalitySignals.map((signal) => (
            <PersonalitySignal key={signal.key} signal={signal} />
          ))}
        </div>
      ) : (
        <p className="mt-2 font-medium text-slate-muted text-sm">
          {isHydratingProfile
            ? "Personality profile is loading."
            : "Personality profile is not available yet."}
        </p>
      )}
    </section>
  );
}

function PersonalitySignal({ signal }: { signal: ShowUpSignal }) {
  const filledSegments =
    typeof signal.value === "number"
      ? Math.max(1, Math.min(5, Math.round(signal.value / 20)))
      : null;
  const roundedValue = Math.round(signal.value ?? 0);

  return (
    <div className="min-w-0 border-border/70 border-b pb-4 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 items-baseline justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-bold text-ink text-sm leading-tight">
            {signal.label}
          </p>
          <p className="mt-0.5 font-bold text-slate-muted text-xs leading-tight">
            {signal.level}
          </p>
        </div>
        {signal.source === "ocean" ? (
          <p className="shrink-0 font-bold text-forge-teal text-xs leading-tight">
            {roundedValue}%
          </p>
        ) : (
          <p className="shrink-0 font-bold text-slate-muted text-xs leading-tight">
            Type cue
          </p>
        )}
      </div>

      <p className="mt-2 text-pretty text-slate-muted text-xs leading-relaxed">
        {signal.description}
      </p>

      {filledSegments ? (
        <div className="mt-3">
          <meter
            className="sr-only"
            min={0}
            max={100}
            value={roundedValue}
            aria-label={`${signal.label} ${roundedValue} percent`}
          />
          <div className="grid grid-cols-5 gap-1.5" aria-hidden="true">
            {PERSONALITY_SEGMENTS.map((segment) => (
              <span
                key={segment}
                className={cn(
                  "h-1.5 min-w-0 rounded-full",
                  segment <= filledSegments
                    ? "bg-forge-teal"
                    : "bg-slate-muted/15",
                )}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
