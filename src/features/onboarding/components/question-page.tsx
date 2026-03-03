import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { IpipQuestion } from "../data/ipip-questions";
import type { RawAnswers } from "../utils/score-calculator";
import { QuestionCard } from "./question-card";

interface QuestionPageProps {
  /** Questions for this page (3 per page always) */
  pageQuestions: IpipQuestion[];
  /** Global 1-based index of the first question on this page */
  startIndex: number;
  /** Current page number (1-based) */
  pageNumber: number;
  /** Total pages */
  totalPages: number;
  answers: RawAnswers;
  onAnswer: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
  onNext: () => void;
}

const MILESTONE_MESSAGES: Record<number, string> = {
  33: "Good start. Keep going — the best questions are ahead.",
  66: "Almost there. Your profile is taking shape.",
};

export function QuestionPage({
  pageQuestions,
  startIndex,
  pageNumber,
  totalPages,
  answers,
  onAnswer,
  onNext,
}: QuestionPageProps) {
  const [milestoneMsg, setMilestoneMsg] = useState<string | null>(null);

  const progressPct = Math.round((pageNumber / totalPages) * 100);

  // Trigger milestone banners
  useEffect(() => {
    const pct = Math.round(((pageNumber - 1) / totalPages) * 100);
    const keys = Object.keys(MILESTONE_MESSAGES).map(Number);
    for (const k of keys) {
      if (pct === 0 && pageNumber === 1) break;
      if (pct >= k && pct < k + Math.round(100 / totalPages) + 5) {
        // only show once per boundary crossing
        const prev = Math.round(((pageNumber - 2) / totalPages) * 100);
        if (prev < k) {
          setMilestoneMsg(MILESTONE_MESSAGES[k]);
          const t = setTimeout(() => setMilestoneMsg(null), 2500);
          return () => clearTimeout(t);
        }
      }
    }
  }, [pageNumber, totalPages]);

  const allAnswered = pageQuestions.every((q) => answers[q.id] !== undefined);

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto">
      {/* Fixed progress bar (sticky top) */}
      <div className="w-full mb-1" style={{ height: 3, background: "rgba(107,114,128,0.12)", borderRadius: 999 }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progressPct}%`, background: "#0D9488" }}
        />
      </div>

      {/* Page counter */}
      <div className="flex justify-between items-center mb-6 mt-2">
        <span className="font-sans text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#6B7280" }}>
          Personality Assessment
        </span>
        <span className="font-sans text-[10px] font-medium" style={{ color: "#6B7280" }}>
          Page {pageNumber} of {totalPages}
        </span>
      </div>

      {/* Milestone banner */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: milestoneMsg ? 52 : 0, marginBottom: milestoneMsg ? 16 : 0, opacity: milestoneMsg ? 1 : 0 }}
      >
        <div
          className="w-full rounded-xl px-4 py-3 font-sans text-sm font-medium text-center"
          style={{ background: "rgba(13,148,136,0.08)", color: "#0D9488" }}
        >
          {milestoneMsg}
        </div>
      </div>

      {/* Question cards */}
      <div className="flex flex-col gap-4 mb-8">
        {pageQuestions.map((q, i) => (
          <QuestionCard
            key={q.id}
            question={q}
            index={startIndex + i}
            value={answers[q.id] as 1 | 2 | 3 | 4 | 5 | undefined}
            onChange={onAnswer}
          />
        ))}
      </div>

      {/* Next page button */}
      <button
        onClick={onNext}
        disabled={!allAnswered}
        className="w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl transition-all duration-200"
        style={{
          height: 52,
          background: allAnswered ? "#0D9488" : "rgba(107,114,128,0.12)",
          color: allAnswered ? "#FFFFFF" : "rgba(107,114,128,0.5)",
          cursor: allAnswered ? "pointer" : "not-allowed",
        }}
      >
        {pageNumber === totalPages ? "See my results" : "Next page"}
        <ArrowRight size={16} strokeWidth={2.5} style={{ opacity: allAnswered ? 1 : 0.4 }} />
      </button>
    </div>
  );
}
