import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeUpItem, staggerContainer } from "../constants/motion";
import type { IpipQuestion } from "../data/ipip-questions";
import type { RawAnswers } from "../utils/score-calculator";
import { QuestionCard } from "./question-card";

interface QuestionPageProps {
  pageQuestions: IpipQuestion[];
  startIndex: number;
  pageNumber: number;
  totalPages: number;
  totalQuestions: number;
  answers: RawAnswers;
  onAnswer: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
  onNext: () => void;
}

// Estimate ~5 seconds per question
function formatTimeLeft(pagesLeft: number, perPage: number): string {
  const qs = pagesLeft * perPage;
  const secs = qs * 5;
  if (secs < 60) return `~${secs}s left`;
  const mins = Math.ceil(secs / 60);
  return `~${mins} min left`;
}

export function QuestionPage({
  pageQuestions,
  startIndex,
  pageNumber,
  totalPages,
  totalQuestions,
  answers,
  onAnswer,
  onNext,
}: QuestionPageProps) {
  const progressPct = Math.round((pageNumber / totalPages) * 100);
  const pagesLeft = totalPages - pageNumber;

  const answeredOnPage = pageQuestions.filter(
    (q) => answers[q.id] !== undefined,
  ).length;
  const allAnswered = answeredOnPage === pageQuestions.length;

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto">
      {/* Global progress bar */}
      <Progress value={progressPct} className="h-0.5 bg-slate-500/10 mb-1" />

      {/* Page counter + time estimate */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-sans text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Page {pageNumber} of {totalPages}
        </span>
        {pagesLeft > 0 && (
          <span className="font-sans text-[10px] font-medium text-slate-500/55">
            {formatTimeLeft(pagesLeft, pageQuestions.length)}
          </span>
        )}
      </div>

      {/* Per-page micro-progress dots */}
      <div className="flex items-center gap-1.5 mb-6">
        {pageQuestions.map((q) => {
          const done = answers[q.id] !== undefined;
          return (
            <div
              key={q.id}
              className={cn(
                "flex-1 h-0.75 rounded-full transition-colors duration-300",
                done ? "bg-forge-teal" : "bg-slate-500/15",
              )}
            />
          );
        })}
        <span className="font-sans text-[9px] font-medium ml-1 shrink-0 text-slate-500/45">
          {answeredOnPage}/{pageQuestions.length}
        </span>
      </div>

      {/* Question cards */}
      <motion.div
        key={pageNumber}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="flex flex-col gap-3 mb-7"
      >
        {pageQuestions.map((q, i) => (
          <motion.div key={q.id} variants={fadeUpItem}>
            <QuestionCard
              question={q}
              index={startIndex + i}
              totalQuestions={totalQuestions}
              value={answers[q.id] as 1 | 2 | 3 | 4 | 5 | undefined}
              onChange={onAnswer}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Next / Submit button */}
      <Button
        size="lg"
        onClick={onNext}
        disabled={!allAnswered}
        className={cn(
          "w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl h-12 transition duration-200",
          allAnswered
            ? "bg-forge-teal text-primary-foreground hover:bg-forge-teal-light"
            : "bg-slate-500/10 text-slate-500/40",
        )}
      >
        {pageNumber === totalPages ? "See my results" : "Next page"}
        <ArrowRight size={16} strokeWidth={2.5} />
      </Button>
    </div>
  );
}
