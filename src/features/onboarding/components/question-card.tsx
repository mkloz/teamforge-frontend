import { CheckCircle2 } from "lucide-react";
import { LikertScale } from "./likert-scale";
import type { IpipQuestion } from "../data/ipip-questions";

interface QuestionCardProps {
  question: IpipQuestion;
  index: number; // 1-based global index for display
  value: 1 | 2 | 3 | 4 | 5 | undefined;
  onChange: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
}

export function QuestionCard({ question, index, value, onChange }: QuestionCardProps) {
  const answered = value !== undefined;

  return (
    <div
      className="relative w-full rounded-2xl p-5 transition-all duration-200"
      style={{
        background: "#FFFFFF",
        border: answered
          ? "1.5px solid #0D9488"
          : "1.5px solid rgba(107,114,128,0.15)",
        boxShadow: answered
          ? "0 2px 12px rgba(13,148,136,0.08)"
          : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Answered badge */}
      {answered && (
        <span
          className="absolute top-4 right-4 flex items-center gap-1 font-sans text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: "#0D9488" }}
          aria-hidden="true"
        >
          <CheckCircle2 size={13} strokeWidth={2.5} />
          Done
        </span>
      )}

      {/* Question number */}
      <p
        className="font-sans text-[10px] font-semibold uppercase tracking-widest mb-2"
        style={{ color: "rgba(107,114,128,0.7)" }}
      >
        {index}
      </p>

      {/* Statement */}
      <p
        className="font-sans text-sm font-medium leading-relaxed mb-5 pr-14 text-pretty"
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
