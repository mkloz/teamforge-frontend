import { useCallback, useState } from "react";
import { buildQuestionList, type TestLength } from "./data/ipip-questions";
import { calculateVector, type RawAnswers } from "./utils/score-calculator";
import { vectorToType, type PersonalityResult } from "./utils/type-translation";
import type { OceanVectorWithMeta } from "./utils/score-calculator";

import { PersonalityIntro } from "./components/personality-intro";
import { LengthSelector } from "./components/length-selector";
import { QuestionPage } from "./components/question-page";
import { CalculatingScreen } from "./components/calculating-screen";
import { PersonalityResults } from "./components/personality-results";

type Screen =
  | { id: "intro" }
  | { id: "length" }
  | { id: "questions"; currentPage: number }
  | { id: "calculating" }
  | { id: "results" };

const QUESTIONS_PER_PAGE = 3;

export function PersonalityTestPage() {
  const [screen, setScreen] = useState<Screen>({ id: "intro" });
  const [testLength, setTestLength] = useState<TestLength>(50);
  const [questions, setQuestions] = useState(() => buildQuestionList(50));
  const [answers, setAnswers] = useState<RawAnswers>({});
  const [result, setResult] = useState<PersonalityResult | null>(null);
  const [vector, setVector] = useState<OceanVectorWithMeta | null>(null);

  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

  const handleAnswer = useCallback(
    (questionId: number, val: 1 | 2 | 3 | 4 | 5) => {
      setAnswers((prev) => ({ ...prev, [questionId]: val }));
    },
    []
  );

  function handleBegin(length: TestLength) {
    setTestLength(length);
    const qs = buildQuestionList(length);
    setQuestions(qs);
    setAnswers({});
    setScreen({ id: "questions", currentPage: 1 });
  }

  function handleNextPage() {
    if (screen.id !== "questions") return;
    if (screen.currentPage < totalPages) {
      setScreen({ id: "questions", currentPage: screen.currentPage + 1 });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Compute vector eagerly so CalculatingScreen can display real bar widths
      const vec = calculateVector(questions, answers);
      const res = vectorToType(vec);
      setVector(vec);
      setResult(res);
      setScreen({ id: "calculating" });
    }
  }

  const handleCalculationDone = useCallback(() => {
    setScreen({ id: "results" });
  }, []);

  function handleRetake() {
    setAnswers({});
    setResult(null);
    setVector(null);
    setScreen({ id: "length" });
  }

  function handleContinue() {
    // Navigate to next onboarding step
    window.location.href = "/onboarding/interests";
  }

  // Derived values for the questions screen
  const currentPage = screen.id === "questions" ? screen.currentPage : 1;
  const pageStart = (currentPage - 1) * QUESTIONS_PER_PAGE;
  const pageQuestions = questions.slice(pageStart, pageStart + QUESTIONS_PER_PAGE);

  if (screen.id === "calculating") {
    return <CalculatingScreen vector={vector!} onDone={handleCalculationDone} />;
  }

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 relative"
      style={{ background: "#FAFAF8" }}
    >
      {/* Top teal accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: "#0D9488" }}
        aria-hidden="true"
      />

      {/* Subtle ambient blobs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(13,148,136,0.05) 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)" }}
        />
      </div>

      {/* Main content */}
      <div className="relative w-full max-w-lg">
        {screen.id === "intro" && (
          <PersonalityIntro onStart={() => setScreen({ id: "length" })} />
        )}

        {screen.id === "length" && (
          <LengthSelector
            onBack={() => setScreen({ id: "intro" })}
            onBegin={handleBegin}
          />
        )}

        {screen.id === "questions" && (
          <QuestionPage
            pageQuestions={pageQuestions}
            startIndex={pageStart + 1}
            pageNumber={currentPage}
            totalPages={totalPages}
            totalQuestions={questions.length}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={handleNextPage}
          />
        )}

        {screen.id === "results" && result && vector && (
          <PersonalityResults
            result={result}
            vector={vector}
            onContinue={handleContinue}
            onRetake={handleRetake}
          />
        )}
      </div>

      {/* Back to landing */}
      {(screen.id === "intro" || screen.id === "length") && (
        <a
          href="/"
          className="absolute bottom-6 left-0 right-0 flex justify-center font-sans text-xs transition-colors"
          style={{ color: "#6B7280" }}
        >
          Back to teamforge.app
        </a>
      )}
    </div>
  );
}
