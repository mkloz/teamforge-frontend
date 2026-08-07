import { m } from "framer-motion";
import { Eye, Globe2, ShieldCheck, UserCircle } from "lucide-react";
import { fadeUpItem } from "@/features/onboarding/constants/motion";
import { IconTile } from "@/shared/components/ui/icon-tile";
import {
  PersonalityScreenShell,
  StepNavigation,
} from "./personality-screen-layout";

interface KeepInMindProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
}

const GUIDELINES = [
  {
    icon: ShieldCheck,
    title: "Use ordinary life",
    text: "Answer for how you usually act, not how you feel expected to act at work or around other people.",
  },
  {
    icon: Eye,
    title: "Nobody is watching",
    text: "Notice which answer you'd pick if no one was here to judge you.",
  },
  {
    icon: Globe2,
    title: "Think broadly",
    text: "Think about your usual behavior across different parts of life, including calm and stressful situations.",
  },
  {
    icon: UserCircle,
    title: "Compare to the average",
    text: "Compare yourself with most people rather than with an expert in one skill.",
  },
];

export function KeepInMind({
  onBack,
  onNext,
  nextLabel = "Choose test length",
}: KeepInMindProps) {
  return (
    <PersonalityScreenShell className="max-w-md">
      <m.p
        variants={fadeUpItem}
        className="mb-3 text-center font-bold font-sans text-muted-foreground text-xs"
      >
        Before you begin
      </m.p>

      <m.h1
        variants={fadeUpItem}
        className="mb-5 text-balance text-center font-extrabold font-sans text-display-xs text-ink leading-tight sm:text-display-sm"
      >
        Answer as yourself
      </m.h1>

      <m.p
        variants={fadeUpItem}
        className="mb-7 text-center font-medium font-sans text-muted-foreground text-sm leading-relaxed sm:text-base"
      >
        A quick reminder before the questions: answer from ordinary life, not
        from the version of yourself you think you should be.
      </m.p>

      <m.div
        variants={fadeUpItem}
        className="mb-8 flex w-full flex-col gap-4 pl-1 sm:pl-3"
      >
        {GUIDELINES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3.5">
            <IconTile
              icon={Icon}
              shape="circle"
              size="sm"
              tone="teal"
              className="mt-0.5"
            />
            <div className="flex flex-col gap-0.5 text-left">
              <span className="font-bold font-sans text-ink text-sm leading-tight">
                {title}
              </span>
              <p className="max-w-sm font-medium font-sans text-muted-foreground text-sm leading-relaxed">
                {text}
              </p>
            </div>
          </div>
        ))}
      </m.div>

      <StepNavigation
        backLabel="Back to theory"
        onBack={onBack}
        onNext={onNext}
        nextLabel={nextLabel}
        backClassName="w-auto shrink-0 px-4"
      />
    </PersonalityScreenShell>
  );
}
