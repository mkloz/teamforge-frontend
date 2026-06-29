import { m } from "framer-motion";

import { fadeUpItem } from "@/features/onboarding/constants/motion";

interface LengthSelectorHeaderProps {
  description: string;
  eyebrow: string;
  title: string;
}

export function LengthSelectorHeader({
  description,
  eyebrow,
  title,
}: LengthSelectorHeaderProps) {
  return (
    <>
      <m.p
        variants={fadeUpItem}
        className="mb-3 text-center font-bold font-sans text-forge-teal text-xs"
      >
        {eyebrow}
      </m.p>

      <m.h2
        variants={fadeUpItem}
        className="mb-3 text-center font-extrabold font-sans text-2xl text-ink leading-tight sm:text-3xl"
      >
        {title}
      </m.h2>

      <m.p
        variants={fadeUpItem}
        className="mx-auto mb-8 max-w-sm text-center font-medium font-sans text-muted-foreground text-sm leading-relaxed sm:text-chat-input"
      >
        {description}
      </m.p>
    </>
  );
}
