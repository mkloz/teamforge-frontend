import { Check } from "lucide-react";
import { LikertScale } from "./likert-scale";
import type { IpipQuestion } from "../data/ipip-questions";

interface QuestionCardProps {
  question: IpipQuestion;
  /** 1-based global index */
  index: number;
  totalQuestions: number;
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
}

export function QuestionCard({
  question,
  index,
  totalQuestions,
  value,
  onChange,
}: QuestionCardProps) {
  const answered = value !== undefined;

  return (
    <div
      className="relative w-full rounded-2xl p-5 transition-all duration-200"
      style={{
        background: "#FFFFFF",
        border: answered
          ? "1.5px solid rgba(13,148,136,0.45)"
          : "1.5px solid rgba(107,114,128,0.14)",
        boxShadow: answered
          ? "0 2px 14px rgba(13,148,136,0.07)"
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Header row: pill + answered badge */}
      <div className="flex items-center justify-between mb-3">
        <span
          className="inline-flex items-center font-sans text-[9px] font-semibold uppercase tracking-widest rounded-full px-2.5 py-1"
          style={{
            background: "rgba(107,114,128,0.07)",
            color: "rgba(107,114,128,0.65)",
          }}
        >
          Q {index} of {totalQuestions}
        </span>

        {answered && (
          <span
            className="inline-flex items-center gap-1 font-sans text-[9px] font-semibold uppercase tracking-wider rounded-full px-2.5 py-1"
            style={{
              background: "rgba(13,148,136,0.08)",
              color: "#0D9488",
            }}
          >
            <Check size={10} strokeWidth={2.8} />
            Done
          </span>
        )}
      </div>

      {/* Statement text */}
      <p
        className="font-sans text-sm font-medium leading-relaxed mb-5 text-pretty"
        style={{ color: "#1C1C1A" }}
      >
        {question.text}
      </p>

      <LikertScale
        value={value}
        onChange={(val) => onChange(question.id, val)}
        questionId={question.id}
      />
    </div>
  );
}
