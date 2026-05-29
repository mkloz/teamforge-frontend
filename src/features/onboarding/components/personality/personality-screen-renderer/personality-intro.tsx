import { ArrowLeft, ArrowRight, Brain, Lock, RefreshCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { PersonalityScreenShell } from "./personality-screen-layout";

interface PersonalityIntroProps {
  backLabel: string;
  onBack: () => void;
  onStart: () => void;
}

const BENEFITS = [
  {
    icon: Brain,
    text: "Based on the IPIP – one of the most widely validated personality frameworks in academic psychology.",
  },
  {
    icon: Lock,
    text: "Your results are only used to find compatible people. They are never sold or shared.",
  },
  {
    icon: RefreshCcw,
    text: "You can retake or update your assessment at any time from your profile.",
  },
];

export function PersonalityIntro({
  backLabel,
  onBack,
  onStart,
}: PersonalityIntroProps) {
  return (
    <PersonalityScreenShell className="max-w-md pt-10 sm:pt-12">
      <p className="mb-3 text-center font-bold font-sans text-forge-teal text-xs uppercase tracking-widest">
        Personality Assessment
      </p>

      <h1 className="mb-4 text-balance text-center font-extrabold font-sans text-2xl text-ink leading-tight sm:text-display-lg">
        What makes you, you?
      </h1>

      <div className="text-left">
        <p className="mb-3 text-pretty font-medium font-sans text-muted-foreground text-sm leading-relaxed sm:text-base">
          Before we build your group, we want to understand how your mind works
          – the core of your personality.
        </p>
        <p className="mb-6 text-pretty font-sans text-muted-foreground text-xs leading-relaxed">
          This is the{" "}
          <span className="font-semibold text-ink">IPIP Assessment</span> – a
          scientifically validated framework. The result shapes your group
          matches and gives you a framework for understanding yourself.
        </p>
      </div>

      <div className="mb-6 h-px w-full bg-muted dark:bg-white/10" />

      <div className="mb-8 flex w-full flex-col gap-4 text-left">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-start gap-3.5">
            <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-forge-teal/10">
              <Icon size={14} strokeWidth={2.5} className="text-forge-teal" />
            </div>
            <p className="font-sans text-muted-foreground text-xs leading-relaxed">
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
          <span className="truncate">Let's find out</span>
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </div>
    </PersonalityScreenShell>
  );
}
