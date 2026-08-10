import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface BriefEntry {
  label: string;
  value: string;
}

interface Brief {
  rows: BriefEntry[];
}

const BRIEFS: Brief[] = [
  {
    rows: [
      { label: "Activity", value: "Beginner bouldering" },
      { label: "When", value: "Thursday, 6:30 PM" },
      { label: "Where", value: "Depot Climbing or nearby" },
      { label: "Group", value: "4 people, relaxed pace" },
    ],
  },
  {
    rows: [
      { label: "Activity", value: "Sunday cycle route" },
      { label: "When", value: "Sunday, 9 AM" },
      { label: "Where", value: "Start at the park gate" },
      { label: "Group", value: "3–5 people, any pace" },
    ],
  },
  {
    rows: [
      { label: "Activity", value: "Exam revision block" },
      { label: "When", value: "Saturday, 2 PM" },
      { label: "Where", value: "Quiet café or library" },
      { label: "Group", value: "2–4 people, same subject" },
    ],
  },
];

const CYCLE_INTERVAL_MS = 3600;

export function AnimatedBriefCycler() {
  const shouldReduceMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return undefined;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BRIEFS.length);
    }, CYCLE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [shouldReduceMotion]);

  const brief = BRIEFS[currentIndex];

  return (
    <aside
      aria-label="Example activity"
      className="overflow-hidden rounded-2xl bg-transparent p-0.5"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-(--grouped-menu-selected) px-4 py-3">
        <div>
          <p className="font-black text-foreground text-sm">Example</p>
        </div>
        {/* Animated dot indicators */}
        <div className="flex items-center gap-1" aria-hidden="true">
          {BRIEFS.map((briefItem, i) => (
            <span
              key={briefItem.rows[0]?.value}
              className="block size-1.5 rounded-full transition-colors duration-300"
              style={{
                backgroundColor:
                  i === currentIndex
                    ? "var(--color-brand-teal)"
                    : "color-mix(in srgb, var(--color-brand-teal) 25%, transparent)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Rows */}
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait" initial={false}>
          <m.dl
            key={currentIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="mt-0.5 grid gap-0.5"
          >
            {brief.rows.map(({ label, value }, rowIndex) => (
              <div
                key={label}
                className="flex items-baseline gap-4 bg-(--grouped-menu-selected) px-4 py-3"
              >
                <dt className="w-16 shrink-0 font-semibold text-muted-foreground text-xs">
                  {label}
                </dt>
                <dd className="min-w-0 font-semibold text-foreground text-sm leading-relaxed">
                  {shouldReduceMotion ? (
                    value
                  ) : (
                    <AnimatedText
                      text={value}
                      briefIndex={currentIndex}
                      delay={rowIndex * 0.06}
                    />
                  )}
                </dd>
              </div>
            ))}
          </m.dl>
        </AnimatePresence>
      </LazyMotion>
    </aside>
  );
}

interface AnimatedTextProps {
  text: string;
  briefIndex: number;
  delay: number;
}

function AnimatedText({ text, briefIndex, delay }: AnimatedTextProps) {
  return (
    <m.span
      key={`${briefIndex}-${text}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      {text}
    </m.span>
  );
}
