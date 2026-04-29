import { useMutation } from "@tanstack/react-query";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { usePersonalityTest } from "./hooks/use-personality-test";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { VoronoiCatalyst } from "../auth/components/voronoi-catalyst";
import { CalculatingScreen } from "./components/personality/calculating-screen";
import { IntermissionPage } from "./components/personality/intermission-page";
import { KeepInMind } from "./components/personality/keep-in-mind";
import { LengthSelector } from "./components/personality/length-selector";
import { PersonalityIntro } from "./components/personality/personality-intro";
import { PersonalityResults } from "./components/personality/personality-results";
import { QuestionPage } from "./components/personality/question-page";
import { Theory101 } from "./components/personality/theory-101";
import { AuthQueries } from "../auth/api/auth.queries";
import { findFirstUnansweredPage } from "./lib/personality-test-flow";
import { getOceanScoresFromVector } from "./lib/personality-results";
import { OnboardingQueries } from "./api/onboarding.queries";
import { buildQuestionList, type TestLength } from "./data/ipip-questions";

const QUESTIONS_PER_PAGE = 3;

function ScreenRenderer({
  state,
  onSelectionChange,
}: {
  state: ReturnType<typeof usePersonalityTest>;
  onSelectionChange: (length: TestLength) => void;
}) {
  const {
    screen,
    questions,
    answers,
    result,
    vector,
    totalPages,
    currentPage,
    pageStart,
    pageQuestions,
    actions,
  } = state;

  switch (screen.id) {
    case "intro":
      return (
        <PersonalityIntro onStart={() => actions.setScreen({ id: "theory" })} />
      );
    case "theory":
      return (
        <Theory101
          onBack={() => actions.setScreen({ id: "intro" })}
          onNext={() => actions.setScreen({ id: "guidelines" })}
        />
      );
    case "guidelines":
      return (
        <KeepInMind
          onBack={() => actions.setScreen({ id: "theory" })}
          onNext={() => actions.setScreen({ id: "length" })}
        />
      );
    case "length": {
      const isAdjusting = Object.keys(answers).length > 0;

      return (
        <LengthSelector
          onBack={() => {
            if (state.previousScreen?.id === "intermission") {
              actions.setScreen(state.previousScreen);
            } else if (isAdjusting) {
              const resumePage = findFirstUnansweredPage(
                state.testLength,
                answers,
                QUESTIONS_PER_PAGE,
              );
              actions.setScreen({ id: "questions", currentPage: resumePage });
            } else {
              actions.setScreen({ id: "guidelines" });
            }
          }}
          onBegin={(length) => {
            if (isAdjusting) {
              actions.updateTestLength(length);
              const resumePage = findFirstUnansweredPage(
                length,
                answers,
                QUESTIONS_PER_PAGE,
              );
              actions.setScreen({ id: "questions", currentPage: resumePage });
            } else {
              actions.handleBegin(length);
            }
          }}
          mode={isAdjusting ? "adjust" : "begin"}
          initialLength={state.testLength}
          answers={answers}
          onSelectionChange={onSelectionChange}
        />
      );
    }
    case "questions":
      return (
        <QuestionPage
          pageQuestions={pageQuestions}
          startIndex={pageStart + 1}
          pageNumber={currentPage}
          totalPages={totalPages}
          totalQuestions={questions.length}
          answers={answers}
          onAnswer={actions.handleAnswer}
          onNext={actions.handleNextPage}
          onReview={() => {
            actions.setIsReviewMode(true);
            actions.setScreen({ id: "questions", currentPage: 1 });
          }}
        />
      );
    case "intermission":
      return (
        <IntermissionPage
          milestoneIndex={screen.type}
          answeredCount={state.answeredInPoolCount}
          totalQuestions={questions.length}
          onAdjustLength={() => {
            actions.setIsReviewMode(false);
            actions.setScreen({ id: "length" });
          }}
          onExtend={(len) => {
            actions.setIsReviewMode(false);
            actions.updateTestLength(len);
            actions.handleContinueFromIntermission();
          }}
          onContinue={actions.handleContinueFromIntermission}
        />
      );
    case "calculating":
      return (
        <CalculatingScreen
          vector={vector!}
          onDone={actions.handleCalculationDone}
        />
      );
    case "results":
      if (!result || !vector) return null;
      return (
        <PersonalityResults
          result={result}
          vector={vector}
          onContinue={actions.handleContinue}
          onRetake={actions.handleRetake}
        />
      );
    default:
      return null;
  }
}

export function PersonalityTestPage() {
  const [pendingLength, setPendingLength] = useState<TestLength | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const invalidateCurrentUser = AuthQueries.useInvalidateCurrentUser();
  const persistPersonalityMutation = useMutation({
    mutationFn: OnboardingQueries.updatePersonality,
    onSuccess: async () => {
      await invalidateCurrentUser();
    },
  });
  const testState = usePersonalityTest({
    questionsPerPage: QUESTIONS_PER_PAGE,
    onContinue: async () => {
      if (testState.result && testState.vector) {
        const oceanScores = getOceanScoresFromVector(testState.vector);

        await persistPersonalityMutation.mutateAsync({
          personalityType: testState.result.type,
          oceanO: oceanScores.openness,
          oceanC: oceanScores.conscientiousness,
          oceanE: oceanScores.extraversion,
          oceanA: oceanScores.agreeableness,
          oceanN: oceanScores.neuroticism,
        });
      }

      const mbtiType = testState.result?.type ?? "";
      const destination = mbtiType
        ? `/onboarding/interests?mbti=${encodeURIComponent(mbtiType)}`
        : "/onboarding/interests";
      window.location.assign(destination);
    },
  });

  const displayProgress = useMemo(() => {
    if (testState.screen.id === "length" && pendingLength) {
      const pool = buildQuestionList(pendingLength);
      const answeredInPool = pool.filter(
        (q) => testState.answers[q.id] !== undefined,
      ).length;
      return pool.length === 0 ? 0 : answeredInPool / pool.length;
    }
    return testState.progress;
  }, [
    testState.screen.id,
    pendingLength,
    testState.answers,
    testState.progress,
  ]);

  useScrollToTop(
    [
      testState.screen.id,
      "currentPage" in testState.screen
        ? testState.screen.currentPage
        : undefined,
      "type" in testState.screen ? testState.screen.type : undefined,
    ],
    scrollContainerRef,
  );

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden">
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative h-full scroll-smooth"
        >
          <div className="absolute top-0 left-0 right-0 z-50">
            <TopProgressBar progress={displayProgress} />
          </div>

          <div className="flex flex-col items-center justify-start min-h-full py-4 sm:py-4 px-4 sm:px-6 relative">
            <div className="w-full max-w-xl relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={testState.screen.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ScreenRenderer
                    state={testState}
                    onSelectionChange={setPendingLength}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right half screen animation space ── */}
      <div className="hidden lg:flex flex-1 relative bg-hero-bg border-l border-slate-200 items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={testState.progress} />
      </div>
    </div>
  );
}
