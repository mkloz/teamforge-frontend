import { AnimatePresence, motion } from "framer-motion";
import { usePersonalityTest } from "./hooks/use-personality-test";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { VoronoiCatalyst } from "../auth/components/voronoi-catalyst";
import { CalculatingScreen } from "./components/calculating-screen";
import { IntermissionPage } from "./components/intermission-page";
import { KeepInMind } from "./components/keep-in-mind";
import { LengthSelector } from "./components/length-selector";
import { PersonalityIntro } from "./components/personality-intro";
import { PersonalityResults } from "./components/personality-results";
import { QuestionPage } from "./components/question-page";
import { Theory101 } from "./components/theory-101";

const QUESTIONS_PER_PAGE = 3;

function ScreenRenderer({
  state,
}: {
  state: ReturnType<typeof usePersonalityTest>;
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
    case "length":
      return (
        <LengthSelector
          onBack={() => actions.setScreen({ id: "guidelines" })}
          onBegin={actions.handleBegin}
        />
      );
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
        />
      );
    case "intermission":
      return (
        <IntermissionPage
          milestoneIndex={screen.type}
          answeredCount={Object.keys(answers).length}
          totalQuestions={questions.length}
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
  const testState = usePersonalityTest({
    questionsPerPage: QUESTIONS_PER_PAGE,
    // TODO: Replace with router navigation once /onboarding/interests route is registered
    onContinue: () => {
      window.location.href = "/onboarding/interests";
    },
  });

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden bg-canvas lg:bg-white">
      {/* Left half (Form Space) */}
      <div className="flex-1 relative h-full overflow-y-auto overflow-x-hidden px-4">
        <div className="flex flex-col items-center justify-center w-full min-h-full py-16 lg:py-4">
          <BackgroundTexture />

          <div
            className="absolute top-0 left-0 right-0 h-1 lg:hidden bg-linear-to-r from-forge-teal to-amber-400 opacity-80"
            aria-hidden="true"
          />
          <div
            className="hidden lg:block absolute top-0 left-0 right-0 h-1 bg-forge-teal"
            aria-hidden="true"
          />

          {/* Form container */}
          <div className="relative w-full max-w-lg bg-white lg:bg-transparent lg:shadow-none shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5 lg:ring-0 rounded-[2rem] p-8 sm:p-10 lg:p-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={testState.screen.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-full flex-1"
              >
                <ScreenRenderer state={testState} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right half screen animation space */}
      <div className="hidden lg:flex flex-1 relative bg-hero-bg border-l border-slate-200 items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={testState.progress} isTyping={false} />
      </div>
    </div>
  );
}
