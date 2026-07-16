import { m } from "framer-motion";

import {
  fadeUpItem,
  staggerContainer,
} from "@/features/onboarding/constants/motion";
import type { IpipQuestion } from "@/features/onboarding/data/ipip-questions";
import type { RawAnswers } from "@/features/onboarding/lib/personality-answer";

import { QuestionCard } from "./question-card";

interface QuestionListProps {
  answers: RawAnswers;
  onAnswer: (questionId: number, val: 1 | 2 | 3 | 4 | 5) => void;
  pageNumber: number;
  pageQuestions: IpipQuestion[];
  startIndex: number;
  totalQuestions: number;
}

export function QuestionList({
  answers,
  onAnswer,
  pageNumber,
  pageQuestions,
  startIndex,
  totalQuestions,
}: QuestionListProps) {
  return (
    <m.div
      key={pageNumber}
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="mb-7 flex flex-col gap-3"
    >
      {pageQuestions.map((question, index) => (
        <m.div key={question.id} variants={fadeUpItem}>
          <QuestionCard
            question={question}
            index={startIndex + index}
            totalQuestions={totalQuestions}
            value={answers[question.id]}
            onChange={onAnswer}
          />
        </m.div>
      ))}
    </m.div>
  );
}
