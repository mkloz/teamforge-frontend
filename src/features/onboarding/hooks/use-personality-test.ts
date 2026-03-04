import { useCallback, useMemo, useState } from "react";
import { buildQuestionList, type TestLength } from "../data/ipip-questions";
import {
  calculateVector,
  type OceanVectorWithMeta,
  type RawAnswers,
} from "../utils/score-calculator";
import {
  vectorToType,
  type PersonalityResult,
} from "../utils/type-translation";

export type ScreenState =
  | { id: "intro" }
  | { id: "theory" }
  | { id: "guidelines" }
  | { id: "length" }
  | { id: "questions"; currentPage: number }
  | {
      id: "intermission";
      type: number;
      nextPageIndex: number;
    }
  | { id: "calculating" }
  | { id: "results" };

interface UsePersonalityTestProps {
  questionsPerPage: number;
  onContinue?: () => void;
}

const getIntermissionInterval = (length: TestLength): number => {
  return length === 50 ? 6 : 5;
};

const shouldTriggerIntermission = (
  currentPage: number,
  length: TestLength,
  totalPages: number,
): boolean => {
  const interval = getIntermissionInterval(length);
  return currentPage % interval === 0 && currentPage < totalPages;
};

const calculateProgress = (
  screenId: ScreenState["id"],
  answersCount: number,
  totalQuestions: number,
): number => {
  if (screenId === "questions" || screenId === "intermission") {
    return answersCount / totalQuestions;
  }
  if (screenId === "calculating" || screenId === "results") {
    return 1;
  }
  return 0;
};

export function usePersonalityTest({
  questionsPerPage,
  onContinue,
}: UsePersonalityTestProps) {
  const [screen, setScreen] = useState<ScreenState>({ id: "intro" });
  const [testLength, setTestLength] = useState<TestLength>(50);
  const [questions, setQuestions] = useState(() => buildQuestionList(50));
  const [answers, setAnswers] = useState<RawAnswers>({});
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [vector, setVector] = useState<OceanVectorWithMeta | null>(null);

  const totalPages = Math.ceil(questions.length / questionsPerPage);

  const handleAnswer = useCallback(
    (questionId: number, val: 1 | 2 | 3 | 4 | 5) => {
      setAnswers((prev) => ({ ...prev, [questionId]: val }));
    },
    [],
  );

  const handleBegin = useCallback((length: TestLength) => {
    setTestLength(length);
    const qs = buildQuestionList(length);
    setQuestions(qs);
    setAnswers({});
    setScreen({ id: "questions", currentPage: 1 });
  }, []);

  const handleNextPage = useCallback(() => {
    if (screen.id !== "questions") return;

    if (shouldTriggerIntermission(screen.currentPage, testLength, totalPages)) {
      const milestoneIndex =
        screen.currentPage / getIntermissionInterval(testLength);
      setScreen({
        id: "intermission",
        type: milestoneIndex,
        nextPageIndex: screen.currentPage + 1,
      });
      return;
    }

    if (screen.currentPage < totalPages) {
      setScreen({ id: "questions", currentPage: screen.currentPage + 1 });
    } else {
      const vec = calculateVector(questions, answers);
      const res = vectorToType(vec);
      setVector(vec);
      setResult(res);
      setScreen({ id: "calculating" });
    }
  }, [screen, testLength, totalPages, questions, answers]);

  const handleContinueFromIntermission = useCallback(() => {
    if (screen.id !== "intermission") return;
    setScreen({ id: "questions", currentPage: screen.nextPageIndex });
  }, [screen]);

  const handleCalculationDone = useCallback(() => {
    setScreen({ id: "results" });
  }, []);

  const handleRetake = useCallback(() => {
    setAnswers({});
    setResult(null);
    setVector(null);
    setScreen({ id: "length" });
  }, []);

  const handleContinue = useCallback(() => {
    onContinue?.();
  }, [onContinue]);

  // Derived state
  const currentPage = screen.id === "questions" ? screen.currentPage : 1;
  const pageStart = (currentPage - 1) * questionsPerPage;
  const pageQuestions = useMemo(
    () => questions.slice(pageStart, pageStart + questionsPerPage),
    [questions, pageStart, questionsPerPage],
  );

  const progress = useMemo(
    () =>
      calculateProgress(
        screen.id,
        Object.keys(answers).length,
        questions.length,
      ),
    [screen.id, answers, questions.length],
  );

  return {
    screen,
    testLength,
    questions,
    answers,
    result,
    vector,
    totalPages,
    currentPage,
    pageStart,
    pageQuestions,
    progress,
    actions: {
      setScreen,
      handleAnswer,
      handleBegin,
      handleNextPage,
      handleContinueFromIntermission,
      handleCalculationDone,
      handleRetake,
      handleContinue,
    },
  };
}
