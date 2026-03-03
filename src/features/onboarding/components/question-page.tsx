import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
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

const MILESTONE_MESSAGES: Record<number, string> = {
  33: "Good start. Keep going — the best questions are ahead.",
  66: "Almost there. Your profile is taking shape.",
};

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
  const [milestoneMsg, setMilestoneMsg] = useState<string | null>(null);

  const progressPct = Math.round((pageNumber / totalPages) * 100);
  const pagesLeft = totalPages - pageNumber;

  useEffect(() => {
    const pct = Math.round(((pageNumber - 1) / totalPages) * 100);
    const keys = Object.keys(MILESTONE_MESSAGES).map(Number);
    for (const k of keys) {
      if (pageNumber === 1) break;
      const prev = Math.round(((pageNumber - 2) / totalPages) * 100);
      if (prev < k && pct >= k) {
        setMilestoneMsg(MILESTONE_MESSAGES[k]);
        const t = setTimeout(() => setMilestoneMsg(null), 2800);
        return () => clearTimeout(t);
      }
    }
  }, [pageNumber, totalPages]);

  const answeredOnPage = pageQuestions.filter((q) => answers[q.id] !== undefined).length;
  const allAnswered = answeredOnPage === pageQuestions.length;

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto">
      {/* Global progress bar */}
      <div
        className="w-full mb-2"
        style={{ height: 3, background: "rgba(107,114,128,0.1)", borderRadius: 999 }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%`, background: "#0D9488" }}
        />
      </div>

      {/* Page counter + time estimate */}
      <div className="flex justify-between items-center mb-5">
        <span
          className="font-sans text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "#6B7280" }}
        >
          Page {pageNumber} of {totalPages}
        </span>
        {pagesLeft > 0 && (
          <span
            className="font-sans text-[10px] font-medium"
            style={{ color: "rgba(107,114,128,0.55)" }}
          >
            {formatTimeLeft(pagesLeft, pageQuestions.length)}
          </span>
        )}
      </div>

      {/* Per-page micro-progress dots */}
      <div className="flex items-center gap-1.5 mb-5">
        {pageQuestions.map((q, i) => {
          const done = answers[q.id] !== undefined;
          return (
            <div
              key={q.id}
              className="flex-1 rounded-full transition-all duration-300"
              style={{
                height: 3,
                background: done ? "#0D9488" : "rgba(107,114,128,0.15)",
              }}
            />
          );
        })}
        <span
          className="font-sans text-[9px] font-medium ml-1 flex-shrink-0"
          style={{ color: "rgba(107,114,128,0.45)" }}
        >
          {answeredOnPage}/{pageQuestions.length}
        </span>
      </div>

      {/* Milestone banner */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: milestoneMsg ? 52 : 0,
          marginBottom: milestoneMsg ? 14 : 0,
          opacity: milestoneMsg ? 1 : 0,
        }}
      >
        <div
          className="w-full rounded-xl px-4 py-3 font-sans text-sm font-medium text-center"
          style={{ background: "rgba(13,148,136,0.07)", color: "#0D9488" }}
        >
          {milestoneMsg}
        </div>
      </div>

      {/* Question cards */}
      <div className="flex flex-col gap-4 mb-7">
        {pageQuestions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={startIndex + i}
            totalQuestions={totalQuestions}
            value={answers[q.id] as 1 | 2 | 3 | 4 | 5 | undefined}
            onChange={onAnswer}
          />
        ))}
      </div>

      {/* Next / Submit button */}
      <button
        onClick={onNext}
        disabled={!allAnswered}
        className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl transition-all duration-200"
        style={{
          height: 52,
          background: allAnswered ? "#0D9488" : "rgba(107,114,128,0.1)",
          color: allAnswered ? "#FFFFFF" : "rgba(107,114,128,0.4)",
          cursor: allAnswered ? "pointer" : "not-allowed",
        }}
      >
        {pageNumber === totalPages ? "See my results" : "Next page"}
        <ArrowRight
          size={16}
          strokeWidth={2.5}
          style={{ opacity: allAnswered ? 1 : 0.35 }}
        />
      </button>
    </div>
  );
}
