import { m } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  fadeUpItem,
  staggerContainer,
} from "@/features/onboarding/constants/motion";
import type {
  DynamicPersonalityItem,
  DynamicResponseValue,
} from "@/features/onboarding/lib/dynamic-personality-engine";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import { LikertScale } from "./question-page/likert-scale";

interface DynamicQuestionPageProps {
  answers: Record<string, DynamicResponseValue>;
  maximumPages: number;
  maximumQuestions: number;
  onAnswer: (itemVersionId: string, value: DynamicResponseValue) => void;
  onNext: () => void;
  pageItems: DynamicPersonalityItem[];
  pageNumber: number;
}

export function DynamicQuestionPage({
  answers,
  maximumPages,
  maximumQuestions,
  onAnswer,
  onNext,
  pageItems,
  pageNumber,
}: DynamicQuestionPageProps) {
  const allAnswered = pageItems.every(
    (item) => answers[item.itemVersionId] !== undefined,
  );
  const pageStart = (pageNumber - 1) * pageItems.length;
  const pageHeadingRef = useRef<HTMLHeadingElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: pageNumber is the explicit focus trigger for each new question page.
  useEffect(() => {
    pageHeadingRef.current?.focus();
  }, [pageNumber]);

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col px-0">
      <div className="mb-6 pr-12 sm:pr-14">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h1
              ref={pageHeadingRef}
              tabIndex={-1}
              aria-label={`Personality assessment, page ${pageNumber} of up to ${maximumPages}`}
              className="rounded font-bold font-sans text-muted-foreground text-xs outline-none focus-visible:ring-2 focus-visible:ring-forge-teal focus-visible:ring-offset-2"
            >
              Page {pageNumber} of up to {maximumPages}
            </h1>
            <StatusPill tone="teal" size="xs" surface="soft">
              Flexible length
            </StatusPill>
          </div>
          <Progress
            className="h-1.5 bg-muted"
            indicatorClassName="bg-forge-teal"
            aria-label={`Page ${pageNumber} of up to ${maximumPages}`}
            aria-valuemin={1}
            aria-valuemax={maximumPages}
            aria-valuenow={pageNumber}
            value={(pageNumber / maximumPages) * 100}
          />
        </div>
      </div>

      <p className="mb-4 text-muted-foreground text-sm">
        Answer all five statements. Your answers shape the next page, and
        nothing is sent until the assessment finishes.
      </p>

      <m.div
        key={pageNumber}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="mb-7 flex flex-col gap-3"
      >
        {pageItems.map((item, index) => {
          const value = answers[item.itemVersionId];
          const labelId = `dynamic-personality-question-${item.itemVersionId}`;

          return (
            <m.div key={item.itemVersionId} variants={fadeUpItem}>
              <div
                className={cn(
                  "relative w-full rounded-xl border border-border bg-card p-4 shadow-xs transition-all duration-300",
                  value === undefined
                    ? "hover:shadow-sm active:bg-muted/50 hover:sm:shadow-md"
                    : "border-forge-teal/30 bg-forge-teal/6 shadow-sm",
                )}
              >
                <div className="mb-2.5 flex min-h-5 items-center justify-between sm:mb-3">
                  <StatusPill tone="muted" size="xs" surface="soft">
                    Q {pageStart + index + 1} of up to {maximumQuestions}
                  </StatusPill>
                  {value !== undefined ? (
                    <StatusPill
                      icon={Check}
                      tone="teal"
                      size="xs"
                      surface="soft"
                    >
                      Done
                    </StatusPill>
                  ) : null}
                </div>
                <h2
                  id={labelId}
                  className="mb-3 text-pretty font-sans font-semibold text-ink text-sm leading-snug sm:mb-5 sm:text-base"
                >
                  {item.text}
                </h2>
                <LikertScale
                  labelledBy={labelId}
                  value={value}
                  onChange={(nextValue) =>
                    onAnswer(item.itemVersionId, nextValue)
                  }
                />
              </div>
            </m.div>
          );
        })}
      </m.div>

      <div className="mt-auto pt-6">
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!allAnswered}
          className="w-full"
        >
          <span>Continue</span>
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}
