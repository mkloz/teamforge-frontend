import { Link } from "@tanstack/react-router";
import { m } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { TeamForgeLogo } from "@/assets/logo";
import {
  fadeUpItem,
  staggerContainer,
} from "@/features/onboarding/constants/motion";
import type {
  DynamicPersonalityItem,
  DynamicResponseValue,
} from "@/features/onboarding/lib/dynamic-personality-engine";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import { LikertScale } from "./question-page/likert-scale";

interface DynamicQuestionPageProps {
  answers: Record<string, DynamicResponseValue>;
  maximumPages: number;
  maximumQuestions: number;
  minimumPages: number;
  onAnswer: (itemVersionId: string, value: DynamicResponseValue) => void;
  onNext: () => void;
  pageItems: DynamicPersonalityItem[];
  pageNumber: number;
}

export function DynamicQuestionPage({
  answers,
  maximumPages,
  maximumQuestions,
  minimumPages,
  onAnswer,
  onNext,
  pageItems,
  pageNumber,
}: DynamicQuestionPageProps) {
  const allAnswered = pageItems.every(
    (item) => answers[item.itemVersionId] !== undefined,
  );
  const pageStart = (pageNumber - 1) * pageItems.length;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col px-0">
      <div className="mb-6 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="font-bold font-sans text-muted-foreground text-xs">
              Page {pageNumber} · usually {minimumPages}–{maximumPages} pages
            </span>
            <StatusPill tone="teal" size="xs" surface="soft">
              Dynamic beta
            </StatusPill>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            aria-label={`At least ${Math.min(pageNumber, minimumPages)} of ${minimumPages} core pages reached`}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={maximumPages}
            aria-valuenow={pageNumber}
          >
            <div
              className={cn(
                "h-full rounded-full bg-forge-teal transition-[width] duration-300 motion-reduce:transition-none",
                getProgressWidthClass(pageNumber, maximumPages),
              )}
            />
          </div>
        </div>

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-11 shrink-0 rounded-lg p-0 text-white/80 hover:bg-white/5 hover:text-white focus-visible:ring-forge-teal focus-visible:ring-offset-hero-bg [@media(pointer:fine)]:size-10"
        >
          <Link to="/" aria-label="Back to TeamForge home">
            <TeamForgeLogo className="size-10" showBackground={false} />
          </Link>
        </Button>
      </div>

      <h1 className="sr-only">Dynamic personality assessment</h1>
      <p className="mb-4 text-muted-foreground text-sm">
        Answer all five statements. Your next page is calculated in this tab;
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

function getProgressWidthClass(pageNumber: number, maximumPages: number) {
  const percentage = Math.round((pageNumber / maximumPages) * 10) * 10;

  const classes: Record<number, string> = {
    10: "w-[10%]",
    20: "w-1/5",
    30: "w-[30%]",
    40: "w-2/5",
    50: "w-1/2",
    60: "w-3/5",
    70: "w-[70%]",
    80: "w-4/5",
    90: "w-[90%]",
    100: "w-full",
  };

  return classes[percentage] ?? "w-0";
}
