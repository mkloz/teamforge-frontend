import { domMax, LazyMotion } from "framer-motion";
import { lazy, type ReactNode, Suspense } from "react";
import type { TestLength } from "@/features/onboarding/data/ipip-questions";
import type { usePersonalityTest } from "@/features/onboarding/hooks/use-personality-test";
import type { usePersonalityTestPageFlow } from "@/features/onboarding/hooks/use-personality-test-page-flow";
import { getDynamicPageItems } from "@/features/onboarding/lib/dynamic-personality-engine";
import type { ScreenState } from "@/features/onboarding/store/personality-test-store.types";
import { CompatibilityInputLockState } from "./compatibility-input-lock-state";
import { DynamicQuestionPage } from "./dynamic-question-page";
import { PersonalityIntro } from "./personality-intro";
import { PersonalityRecovery } from "./personality-recovery";
import { usePersonalityScreenNavigation } from "./use-personality-screen-navigation";

const Theory101 = lazy(() =>
  import("./theory-101").then((module) => ({ default: module.Theory101 })),
);
const KeepInMind = lazy(() =>
  import("./keep-in-mind").then((module) => ({ default: module.KeepInMind })),
);
const LengthSelector = lazy(() =>
  import("./length-selector").then((module) => ({
    default: module.LengthSelector,
  })),
);
const QuestionPage = lazy(() =>
  import("./question-page").then((module) => ({
    default: module.QuestionPage,
  })),
);
const IntermissionPage = lazy(() =>
  import("./intermission-page").then((module) => ({
    default: module.IntermissionPage,
  })),
);
const SubmissionScreen = lazy(() =>
  import("./calculating-screen").then((module) => ({
    default: module.SubmissionScreen,
  })),
);
const PersonalityResults = lazy(() =>
  import("./personality-results").then((module) => ({
    default: module.PersonalityResults,
  })),
);

type PersonalityTestState = ReturnType<typeof usePersonalityTest>;
type PersonalityAssessmentFlow = ReturnType<
  typeof usePersonalityTestPageFlow
>["assessment"];
type DynamicAssessmentFlow = ReturnType<
  typeof usePersonalityTestPageFlow
>["dynamic"];
type PersonalityScreenNavigation = ReturnType<
  typeof usePersonalityScreenNavigation
>;
type PersonalityScreenId = ScreenState["id"];

interface PersonalityScreenRenderContext {
  backLabel: string;
  assessment: PersonalityAssessmentFlow;
  canChooseAssessmentLength: boolean;
  continueLabel: string;
  dynamic: DynamicAssessmentFlow;
  isOnline: boolean;
  navigation: PersonalityScreenNavigation;
  onContinue: () => void;
  onExploreAfterStarter: () => void;
  onRecoveryDiscard: () => void;
  onRecoveryResume: () => void;
  onSelectionChange: (length: TestLength) => void;
  onRetrySubmission: () => void;
  submissionError: string | null;
  starter: { error: string | null; isCompleting: boolean };
  state: PersonalityTestState;
}

type PersonalityScreenRendererMap = Record<
  PersonalityScreenId,
  (context: PersonalityScreenRenderContext) => ReactNode
>;

interface PersonalityScreenRendererProps {
  backLabel: string;
  assessment: PersonalityAssessmentFlow;
  canChooseAssessmentLength: boolean;
  continueLabel: string;
  dynamic: DynamicAssessmentFlow;
  isOnline: boolean;
  onBack: () => void;
  onContinue: () => void;
  onExploreAfterStarter: () => void;
  onRecoveryDiscard: () => void;
  onRecoveryResume: () => void;
  onSelectionChange: (length: TestLength) => void;
  onRetrySubmission: () => void;
  questionsPerPage: number;
  state: PersonalityTestState;
  submissionError: string | null;
  starter: { error: string | null; isCompleting: boolean };
}

export function PersonalityScreenRenderer({
  backLabel,
  assessment,
  canChooseAssessmentLength,
  continueLabel,
  dynamic,
  isOnline,
  onBack,
  onContinue,
  onExploreAfterStarter,
  onSelectionChange,
  onRetrySubmission,
  onRecoveryDiscard,
  onRecoveryResume,
  questionsPerPage,
  state,
  submissionError,
  starter,
}: PersonalityScreenRendererProps) {
  const navigation = usePersonalityScreenNavigation({
    canChooseAssessmentLength,
    onBack,
    onRecoveryDiscard,
    onRecoveryResume,
    questionsPerPage,
    state,
  });
  const showCompatibilityInputLock =
    assessment.inputLock.isBlocked && state.screen.id !== "results";
  const renderedScreen = renderPersonalityScreen({
    backLabel,
    assessment,
    canChooseAssessmentLength,
    continueLabel,
    dynamic,
    isOnline,
    navigation,
    onContinue,
    onExploreAfterStarter,
    onRecoveryDiscard,
    onRecoveryResume,
    onSelectionChange,
    onRetrySubmission,
    state,
    submissionError,
    starter,
  });

  return (
    <LazyMotion features={domMax}>
      <Suspense fallback={null}>
        {showCompatibilityInputLock ? (
          <CompatibilityInputLockState
            backLabel={backLabel}
            message={assessment.inputLock.message}
            onBack={onBack}
            onRetry={assessment.inputLock.retry}
            status={assessment.inputLock.status}
          />
        ) : (
          renderedScreen
        )}
      </Suspense>
    </LazyMotion>
  );
}

function renderPersonalityScreen(context: PersonalityScreenRenderContext) {
  const renderer = getPersonalityScreenRenderer(context.state.screen.id);

  return renderer ? renderer(context) : null;
}

const PERSONALITY_SCREEN_RENDERERS: PersonalityScreenRendererMap = {
  "dynamic-questions": renderDynamicQuestionsScreen,
  guidelines: renderGuidelinesScreen,
  intermission: renderIntermissionScreen,
  intro: renderIntroScreen,
  length: renderLengthScreen,
  questions: renderQuestionsScreen,
  recovery: renderRecoveryScreen,
  results: renderResultsScreen,
  submitting: renderSubmittingScreen,
  theory: renderTheoryScreen,
};

function getPersonalityScreenRenderer(screenId: string) {
  return isPersonalityScreenId(screenId)
    ? PERSONALITY_SCREEN_RENDERERS[screenId]
    : null;
}

function isPersonalityScreenId(
  screenId: string,
): screenId is PersonalityScreenId {
  return screenId in PERSONALITY_SCREEN_RENDERERS;
}

function renderIntroScreen({
  assessment,
  backLabel,
  navigation,
}: PersonalityScreenRenderContext) {
  return (
    <PersonalityIntro
      {...navigation.intro}
      backLabel={backLabel}
      onRetryState={assessment.onRetryState}
      stateStatus={assessment.stateStatus}
    />
  );
}

function renderTheoryScreen({ navigation }: PersonalityScreenRenderContext) {
  return <Theory101 {...navigation.theory} />;
}

function renderGuidelinesScreen({
  navigation,
}: PersonalityScreenRenderContext) {
  return <KeepInMind {...navigation.guidelines} />;
}

function renderLengthScreen({
  dynamic,
  navigation,
  onSelectionChange,
  state,
}: PersonalityScreenRenderContext) {
  return (
    <LengthSelector
      {...navigation.length}
      dynamicCapability={dynamic.capability}
      onBeginDynamic={dynamic.start}
      initialLength={state.testLength}
      answers={state.answers}
      onSelectionChange={onSelectionChange}
    />
  );
}

function renderDynamicQuestionsScreen({
  dynamic,
}: PersonalityScreenRenderContext) {
  const engineState = dynamic.state.engineState;
  const capability = dynamic.capability;

  if (!engineState || !capability) {
    return null;
  }

  return (
    <DynamicQuestionPage
      answers={dynamic.state.pageAnswers}
      maximumPages={capability.maximumPages}
      maximumQuestions={capability.maximumQuestions}
      onAnswer={dynamic.state.setAnswer}
      onNext={dynamic.continue}
      pageItems={getDynamicPageItems(engineState.currentPage)}
      pageNumber={engineState.currentPage.pageNumber}
    />
  );
}

function renderQuestionsScreen({
  navigation,
  state,
}: PersonalityScreenRenderContext) {
  const {
    questions,
    answers,
    totalPages,
    currentPage,
    pageStart,
    pageQuestions,
  } = state;
  const isStarterWindow = state.starterCheckpointEnabled && currentPage <= 2;

  return (
    <QuestionPage
      finalActionLabel={isStarterWindow ? "See your starting point" : undefined}
      pageQuestions={pageQuestions}
      startIndex={pageStart + 1}
      pageNumber={currentPage}
      totalPages={isStarterWindow ? 2 : totalPages}
      totalQuestions={isStarterWindow ? 10 : questions.length}
      answers={answers}
      {...navigation.questions}
    />
  );
}

function renderRecoveryScreen({
  backLabel,
  navigation,
  state,
}: PersonalityScreenRenderContext) {
  return (
    <PersonalityRecovery
      answeredCount={state.answeredInPoolCount}
      backLabel={backLabel}
      onBack={navigation.recovery.onBack}
      onDiscard={navigation.recovery.onDiscard}
      onResume={navigation.recovery.onResume}
      totalQuestions={state.questions.length}
    />
  );
}

function renderIntermissionScreen({
  canChooseAssessmentLength,
  navigation,
  onExploreAfterStarter,
  starter,
  state,
}: PersonalityScreenRenderContext) {
  const milestoneIndex = getIntermissionMilestoneIndex(state.screen);

  if (milestoneIndex === null) {
    return null;
  }

  return (
    <IntermissionPage
      allowLengthChanges={canChooseAssessmentLength}
      milestoneIndex={milestoneIndex}
      answeredCount={milestoneIndex === 0 ? 10 : state.answeredInPoolCount}
      totalQuestions={milestoneIndex === 0 ? 10 : state.questions.length}
      isStarterMilestone={milestoneIndex === 0}
      onExploreAfterStarter={onExploreAfterStarter}
      starterError={starter.error}
      isCompletingStarter={starter.isCompleting}
      {...navigation.intermission}
    />
  );
}

function renderSubmittingScreen({
  onRetrySubmission,
  submissionError,
}: PersonalityScreenRenderContext) {
  return (
    <SubmissionScreen error={submissionError} onRetry={onRetrySubmission} />
  );
}

function renderResultsScreen({
  assessment,
  continueLabel,
  isOnline,
  onContinue,
}: PersonalityScreenRenderContext) {
  if (!assessment.preview || !assessment.disclosure) {
    return null;
  }

  return (
    <PersonalityResults
      {...assessment}
      profile={assessment.preview}
      onContinue={onContinue}
      continueLabel={continueLabel}
      isOnline={isOnline}
    />
  );
}

function getIntermissionMilestoneIndex(screen: ScreenState) {
  return screen.id === "intermission" ? screen.type : null;
}
