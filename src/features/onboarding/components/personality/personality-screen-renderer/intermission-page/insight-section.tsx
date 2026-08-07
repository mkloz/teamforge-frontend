import { m } from "framer-motion";
import { fadeUpItem } from "@/features/onboarding/constants/motion";

interface InsightSectionProps {
  title: string;
  description: string;
  factTitle: string;
  fact: string;
}

export function InsightSection({
  title,
  description,
  factTitle,
  fact,
}: InsightSectionProps) {
  return (
    <>
      <m.h2
        variants={fadeUpItem}
        className="mb-4 font-black font-sans text-2xl text-ink leading-tight tracking-tight sm:text-4xl"
      >
        {title}
      </m.h2>

      <m.p
        variants={fadeUpItem}
        className="mx-auto mb-7 max-w-xl font-medium font-sans text-muted-foreground text-sm leading-relaxed sm:mb-8 sm:text-chat-input"
      >
        {description}
      </m.p>

      <m.div
        variants={fadeUpItem}
        className="mx-auto w-full max-w-xl border-border border-l-2 py-1 pl-4 text-left sm:pl-6"
      >
        <span className="mb-2 block font-bold font-sans text-muted-foreground text-xs">
          {factTitle}
        </span>
        <p className="font-sans text-muted-foreground text-sm leading-relaxed">
          {fact}
        </p>
      </m.div>
    </>
  );
}
