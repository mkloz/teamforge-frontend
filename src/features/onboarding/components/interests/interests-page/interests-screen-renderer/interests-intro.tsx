import { ArrowLeft, ArrowRight, Lock, RefreshCw, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";

interface InterestsIntroProps {
  backLabel: string;
  onBack: () => void;
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: Users,
    text: "Pick the things you would actually say yes to. The best profile feels honest, not impressive.",
  },
  {
    icon: Lock,
    text: "Your interests are used to shape group ideas. They are not shown as a public checklist.",
  },
  {
    icon: RefreshCw,
    text: "You can update this later as your taste changes.",
  },
];

export function InterestsIntro({
  backLabel,
  onBack,
  onStart,
}: InterestsIntroProps) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center gap-0 pt-10 text-center sm:pt-12">
      <h1 className="mb-4 text-balance font-extrabold font-sans text-2xl text-ink leading-tight sm:text-display-lg">
        What do you love doing?
      </h1>

      <div>
        <p className="mb-3 text-pretty font-medium font-sans text-slate-muted text-sm leading-relaxed">
          This is where your profile starts to feel like your real life: the
          hobbies, places, games, scenes, and small obsessions you would
          genuinely make time for.
        </p>
        <p className="mb-6 text-pretty font-sans text-slate-muted/80 text-sm leading-relaxed">
          Pick at least{" "}
          <span className="border-forge-teal/30 border-b font-bold text-ink">
            15 interests
          </span>
          . There are no wrong answers – only honest ones.
        </p>
      </div>

      <div className="mb-6 h-px w-full bg-slate-muted/10" />

      <div className="mb-8 flex w-full flex-col gap-4 text-left">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3.5">
            <IconTile
              icon={Icon}
              size="md"
              tone="teal"
              className="mt-0.5 bg-forge-teal/5"
            />
            <p className="font-sans text-slate-muted text-sm leading-relaxed">
              {text}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex w-full xs:flex-row flex-col-reverse xs:items-center items-stretch gap-3 pt-6">
        <Button
          size="md"
          variant="outline"
          onClick={onBack}
          className="w-full xs:w-auto min-w-0 xs:shrink-0 px-4"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          <span className="truncate">{backLabel}</span>
        </Button>
        <Button
          size="md"
          onClick={onStart}
          className="flex w-full min-w-0 xs:flex-1 items-center justify-center gap-2"
        >
          <span className="truncate">Let&apos;s pick your interests</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}
