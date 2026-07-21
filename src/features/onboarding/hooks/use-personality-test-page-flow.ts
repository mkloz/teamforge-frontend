import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCompatibilityInputLock } from "@/features/forge-proposals/public/proposal-review";
import { useInvalidateCurrentUser } from "@/shared/api/current-user-query";
import { PersonalityAssessmentApi } from "@/shared/api/personality-assessment-api";
import {
  PERSONALITY_ASSESSMENT_QUERY_KEY,
  personalityAssessmentCapabilitiesQueryOptions,
  personalityAssessmentQueryOptions,
} from "@/shared/api/personality-assessment-query";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import type {
  PersonalityAssessmentFormVersion,
  PersonalityAssessmentState,
  PersonalityDisclosure,
} from "@/shared/schemas/personality-assessment";
import type { PublicPersonalityProfile } from "@/shared/schemas/public-personality-profile";

import { buildQuestionList, type TestLength } from "../data/ipip-questions";
import {
  DYNAMIC_ASSESSMENT_MANIFEST_HASH,
  DYNAMIC_ASSESSMENT_PACKAGE_ID,
} from "../lib/dynamic-personality-engine";
import {
  toOptionalOnboardingSearch,
  useOnboardingFlowState,
} from "../lib/onboarding-flow-state";
import {
  buildBackToLabel,
  getOnboardingReturnDestinationLabel,
} from "../lib/onboarding-navigation-labels";
import { QUESTIONS_PER_PAGE } from "../lib/personality-test-page-constants";
import {
  buildPersonalityNextSearch,
  buildPersonalityPreviousSearch,
  resolvePersonalityExitNavigation,
} from "../lib/personality-test-page-flow";
import { useDynamicPersonalityTestStore } from "../store/dynamic-personality-test-store";
import { usePersonalityTestStore } from "../store/personality-test-store";
import { usePersonalityTest } from "./use-personality-test";

type AssessmentResultAction = "publish" | "discard" | "delete-all" | "retake";

export type PersonalityAssessmentQueryStatus =
  | "error"
  | "loading"
  | "ready"
  | "refreshing";

interface SubmissionPair {
  attemptId: string;
  idempotencyKey: string;
}

const FORM_VERSION_BY_LENGTH: Record<
  TestLength,
  PersonalityAssessmentFormVersion
> = {
  30: "IPIP_30_V1",
  50: "IPIP_50_V1",
  150: "IPIP_150_V1",
};

export function usePersonalityTestPageFlow() {
  const [pendingLength, setPendingLength] = useState<TestLength | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [resultActionError, setResultActionError] = useState<string | null>(
    null,
  );
  const [activeResultAction, setActiveResultAction] =
    useState<AssessmentResultAction | null>(null);
  const [submittedPreview, setSubmittedPreview] =
    useState<PublicPersonalityProfile | null>(null);
  const [submittedDisclosure, setSubmittedDisclosure] =
    useState<PersonalityDisclosure | null>(null);
  const submissionPairRef = useRef<SubmissionPair | null>(null);
  const submissionInFlightRef = useRef(false);
  const autoSubmissionStartedRef = useRef(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isEditMode, returnTo, returnSearch, returnSection } =
    useOnboardingFlowState();
  const compatibilityInputLock = useCompatibilityInputLock({
    enabled: isEditMode,
  });
  const queryClient = useQueryClient();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const assessmentQuery = useQuery(personalityAssessmentQueryOptions());
  const capabilitiesQuery = useQuery(
    personalityAssessmentCapabilitiesQueryOptions(),
  );
  const testState = usePersonalityTest({
    questionsPerPage: QUESTIONS_PER_PAGE,
  });
  const dynamicTestState = useDynamicPersonalityTestStore();

  const hasUnsentAnswers =
    Object.keys(testState.answers).length > 0 ||
    Boolean(dynamicTestState.engineState);
  const clearAssessmentRequestMemory = useCallback(() => {
    submissionPairRef.current = null;
    const snapshot = usePersonalityTestStore.getState();

    if (Object.keys(snapshot.answers).length > 0) {
      snapshot.reset();
    }
    useDynamicPersonalityTestStore.getState().reset();
  }, []);
  const shouldBlockNavigation = useCallback(() => {
    const shouldLeave = window.confirm(
      "Your answers have not been submitted. Leave and lose them?",
    );

    if (shouldLeave) {
      clearAssessmentRequestMemory();
    }

    return !shouldLeave;
  }, [clearAssessmentRequestMemory]);

  useBlocker({
    disabled: !hasUnsentAnswers,
    enableBeforeUnload: hasUnsentAnswers,
    shouldBlockFn: shouldBlockNavigation,
  });

  useEffect(
    () => () => {
      clearAssessmentRequestMemory();
    },
    [clearAssessmentRequestMemory],
  );

  const completeSubmission = useCallback(
    (
      response: Awaited<
        ReturnType<typeof PersonalityAssessmentApi.submitAnswers>
      >,
      snapshot: ReturnType<typeof usePersonalityTestStore.getState>,
      dynamicSnapshot: ReturnType<
        typeof useDynamicPersonalityTestStore.getState
      >,
    ) => {
      setSubmittedPreview(response.publicProjectionPreview);
      setSubmittedDisclosure(response.disclosure);
      queryClient.setQueryData<PersonalityAssessmentState | undefined>(
        PERSONALITY_ASSESSMENT_QUERY_KEY,
        (current) =>
          current
            ? {
                ...current,
                draft:
                  response.assessment.lifecycle === "DRAFT_RESULT"
                    ? response.assessment
                    : current.draft,
                current:
                  response.assessment.lifecycle === "CURRENT"
                    ? response.assessment
                    : current.current,
                disclosure: response.disclosure,
              }
            : current,
      );
      submissionPairRef.current = null;
      snapshot.clearSubmittedAnswers();
      dynamicSnapshot.clearSubmittedAnswers();
      snapshot.setScreen({ id: "results" });
      void queryClient.invalidateQueries({
        queryKey: PERSONALITY_ASSESSMENT_QUERY_KEY,
      });
    },
    [queryClient],
  );

  const submitCurrentAssessment = useCallback(async () => {
    if (submissionInFlightRef.current) {
      return;
    }

    if (isEditMode && compatibilityInputLock.isBlocked) {
      setSubmissionError(
        compatibilityInputLock.message ??
          "This assessment cannot be changed right now.",
      );
      return;
    }

    if (
      guardOfflineAction({
        id: "onboarding-personality-submit-offline",
        description: "Reconnect before submitting your answers.",
      })
    ) {
      setSubmissionError(
        "You are offline. Reconnect, then submit the same answers again.",
      );
      return;
    }

    submissionInFlightRef.current = true;
    setSubmissionError(null);

    try {
      const snapshot = usePersonalityTestStore.getState();
      const dynamicSnapshot = useDynamicPersonalityTestStore.getState();
      const isDynamic =
        dynamicSnapshot.engineState?.status === "READY_TO_SUBMIT";
      let submissionPair = submissionPairRef.current;

      if (!submissionPair) {
        const ownerState = await queryClient.ensureQueryData(
          personalityAssessmentQueryOptions(),
        );
        const attempt = await PersonalityAssessmentApi.createAttempt({
          formVersion: isDynamic
            ? "TF_OCEAN_DYNAMIC_V1"
            : FORM_VERSION_BY_LENGTH[snapshot.testLength],
          source: ownerState?.current ? "RETAKE" : "ONBOARDING",
          ...(isDynamic
            ? {
                baseAssessmentGeneration: ownerState.assessmentGeneration,
                packageId: DYNAMIC_ASSESSMENT_PACKAGE_ID,
                manifestHash: DYNAMIC_ASSESSMENT_MANIFEST_HASH,
                selectionSeed: dynamicSnapshot.engineState?.seed,
              }
            : {}),
        });

        submissionPair = {
          attemptId: attempt.attemptId,
          idempotencyKey: crypto.randomUUID(),
        };
        submissionPairRef.current = submissionPair;
      }

      if (isDynamic && dynamicSnapshot.engineState) {
        const dynamic = dynamicSnapshot.engineState;
        const response = await PersonalityAssessmentApi.submitDynamicAnswers(
          submissionPair.attemptId,
          submissionPair.idempotencyKey,
          {
            packageId: DYNAMIC_ASSESSMENT_PACKAGE_ID,
            manifestHash: DYNAMIC_ASSESSMENT_MANIFEST_HASH,
            selectionSeed: dynamic.seed,
            pages: dynamic.pages,
            answers: Object.entries(dynamic.answers).map(
              ([itemVersionId, value]) => ({ itemVersionId, value }),
            ),
          },
        );

        completeSubmission(response, snapshot, dynamicSnapshot);
        return;
      }

      const answers: Array<{
        questionId: number;
        value: 1 | 2 | 3 | 4 | 5;
      }> = [];

      for (const questionId of snapshot.questionIds) {
        const value = snapshot.answers[questionId];

        if (value === undefined) {
          throw new Error("Answer every question before submitting.");
        }

        answers.push({ questionId, value });
      }

      const response = await PersonalityAssessmentApi.submitAnswers(
        submissionPair.attemptId,
        submissionPair.idempotencyKey,
        answers,
      );
      completeSubmission(response, snapshot, dynamicSnapshot);
    } catch (error) {
      if (shouldReplaceSubmissionPair(error)) {
        submissionPairRef.current = null;
      }
      setSubmissionError(getSubmissionErrorMessage(error));
    } finally {
      submissionInFlightRef.current = false;
    }
  }, [
    compatibilityInputLock.isBlocked,
    compatibilityInputLock.message,
    completeSubmission,
    guardOfflineAction,
    isEditMode,
    queryClient,
  ]);

  useEffect(() => {
    if (
      testState.screen.id === "submitting" &&
      !autoSubmissionStartedRef.current
    ) {
      autoSubmissionStartedRef.current = true;
      void submitCurrentAssessment();
    }

    if (testState.screen.id !== "submitting") {
      autoSubmissionStartedRef.current = false;
    }
  }, [submitCurrentAssessment, testState.screen.id]);

  useEffect(() => {
    if (
      testState.screen.id !== "intro" ||
      hasUnsentAnswers ||
      submittedPreview ||
      !assessmentQuery.data
    ) {
      return;
    }

    const existingAssessment =
      assessmentQuery.data.draft ?? assessmentQuery.data.current;

    if (existingAssessment) {
      setSubmittedPreview(toPublicProfile(existingAssessment));
      setSubmittedDisclosure(assessmentQuery.data.disclosure);
      testState.actions.setScreen({ id: "results" });
    }
  }, [
    assessmentQuery.data,
    hasUnsentAnswers,
    submittedPreview,
    testState.actions,
    testState.screen.id,
  ]);

  async function publishResult() {
    if (isEditMode && compatibilityInputLock.isBlocked) {
      setResultActionError(
        compatibilityInputLock.message ??
          "This assessment cannot be changed right now.",
      );
      return;
    }

    const disclosure =
      submittedDisclosure ?? assessmentQuery.data?.disclosure ?? null;

    if (!disclosure) {
      setResultActionError(
        "We couldn't load the publication details. Refresh and try again.",
      );
      return;
    }

    await runResultAction("publish", () =>
      PersonalityAssessmentApi.publish(disclosure.policyVersion),
    );
  }

  async function discardDraft() {
    const nextState = await runResultAction("discard", () =>
      PersonalityAssessmentApi.discardDraft(),
    );

    if (nextState) {
      setSubmittedPreview(null);
      setSubmittedDisclosure(nextState.disclosure);
      testState.actions.reset();
    }
  }

  async function deleteAllPersonalityData() {
    const nextState = await runResultAction("delete-all", () =>
      PersonalityAssessmentApi.deleteAll(),
    );

    if (nextState) {
      setSubmittedPreview(null);
      setSubmittedDisclosure(nextState.disclosure);
      submissionPairRef.current = null;
      testState.actions.reset();
    }
  }

  async function retakeAssessment() {
    setResultActionError(null);

    if (isEditMode && compatibilityInputLock.isBlocked) {
      setResultActionError(
        compatibilityInputLock.message ??
          "This assessment cannot be changed right now.",
      );
      return;
    }

    if (assessmentQuery.data?.draft) {
      setResultActionError(
        "Discard this draft before starting another assessment.",
      );
      return;
    }

    setSubmittedPreview(null);
    setSubmittedDisclosure(null);
    submissionPairRef.current = null;
    testState.actions.reset();
    dynamicTestState.reset();
    testState.actions.setScreen({ id: "length" });
  }

  function beginDynamicAssessment() {
    const capability = capabilitiesQuery.data?.dynamic;

    if (
      !capability ||
      !["PUBLIC_BETA", "AVAILABLE"].includes(capability.startPolicy) ||
      capability.packageId !== DYNAMIC_ASSESSMENT_PACKAGE_ID ||
      capability.manifestHash !== DYNAMIC_ASSESSMENT_MANIFEST_HASH
    ) {
      setSubmissionError(
        "Dynamic is temporarily unavailable. Quick and Standard are still available.",
      );
      return;
    }

    submissionPairRef.current = null;
    setSubmissionError(null);
    useDynamicPersonalityTestStore.getState().begin(crypto.randomUUID());
    testState.actions.setScreen({ id: "dynamic-questions" });
  }

  function continueDynamicAssessment() {
    try {
      const nextState = useDynamicPersonalityTestStore
        .getState()
        .commitCurrentPage();

      if (nextState.status === "READY_TO_SUBMIT") {
        testState.actions.setScreen({ id: "submitting" });
      }
    } catch {
      setSubmissionError("Answer all five statements before continuing.");
    }
  }

  async function runResultAction(
    action: Exclude<AssessmentResultAction, "retake">,
    request: () => Promise<PersonalityAssessmentState>,
  ) {
    if (
      guardOfflineAction({
        id: `onboarding-personality-${action}-offline`,
        description: "Reconnect before changing your personality settings.",
      })
    ) {
      setResultActionError(
        "You are offline. Reconnect before changing this setting.",
      );
      return null;
    }

    setActiveResultAction(action);
    setResultActionError(null);

    try {
      const nextState = await request();
      queryClient.setQueryData(PERSONALITY_ASSESSMENT_QUERY_KEY, nextState);
      setSubmittedDisclosure(nextState.disclosure);
      await invalidateCurrentUser();
      return nextState;
    } catch (error) {
      setResultActionError(getResultActionErrorMessage(error));
      return null;
    } finally {
      setActiveResultAction(null);
    }
  }

  async function continueToInterests() {
    if (assessmentQuery.data?.draft || !assessmentQuery.data?.current) {
      setResultActionError("Save this result before continuing.");
      return;
    }

    if (isEditMode) {
      await exitPersonalityEditMode();
      return;
    }

    await navigateToInterests();
  }

  async function goBack() {
    if (isEditMode) {
      await exitPersonalityEditMode();
      return;
    }

    const previousSearch = buildPersonalityPreviousSearch({
      returnTo,
      returnSearch,
      returnSection,
    });

    await navigate({
      to: "/onboarding/profile",
      search: toOptionalOnboardingSearch(previousSearch),
    });
  }

  async function exitPersonalityEditMode() {
    testState.actions.reset();
    await navigate(
      resolvePersonalityExitNavigation({
        returnTo,
        returnSearch,
        returnSection,
      }),
    );
  }

  async function navigateToInterests() {
    const nextSearch = buildPersonalityNextSearch({
      mbti: null,
      returnTo,
      returnSearch,
      returnSection,
    });

    await navigate({
      to: "/onboarding/interests",
      search: toOptionalOnboardingSearch(nextSearch),
    });
  }

  const displayProgress = (() => {
    if (
      testState.screen.id === "dynamic-questions" &&
      dynamicTestState.engineState
    ) {
      return (
        Object.keys(dynamicTestState.engineState.answers).length /
        (capabilitiesQuery.data?.dynamic.maximumQuestions ?? 50)
      );
    }

    if (testState.screen.id !== "length" || !pendingLength) {
      return testState.progress;
    }

    const pool = buildQuestionList(pendingLength);
    const answeredInPool = pool.filter(
      (question) => testState.answers[question.id] !== undefined,
    ).length;

    return pool.length === 0 ? 0 : answeredInPool / pool.length;
  })();

  useScrollToTop(
    [
      testState.screen.id,
      "currentPage" in testState.screen
        ? testState.screen.currentPage
        : undefined,
      "type" in testState.screen ? testState.screen.type : undefined,
      dynamicTestState.engineState?.currentPage.pageNumber,
    ],
    scrollContainerRef,
  );

  const backDestination = isEditMode
    ? getOnboardingReturnDestinationLabel(returnTo, null, "settings")
    : "profile";
  const displayedProfile =
    submittedPreview ??
    toPublicProfile(
      assessmentQuery.data?.draft ?? assessmentQuery.data?.current ?? null,
    );
  const draftAssessment = assessmentQuery.data?.draft ?? null;
  const currentAssessment = assessmentQuery.data?.current ?? null;
  const displayedAssessment =
    draftAssessment?.assessmentId === displayedProfile?.assessmentId
      ? draftAssessment
      : currentAssessment?.assessmentId === displayedProfile?.assessmentId
        ? currentAssessment
        : null;
  const assessmentStateStatus = getAssessmentQueryStatus({
    hasData: Boolean(assessmentQuery.data),
    isError: assessmentQuery.isError,
    isFetching: assessmentQuery.isFetching,
    isPending: assessmentQuery.isPending,
  });

  return {
    assessment: {
      activeResultAction,
      canContinue:
        assessmentQuery.data?.draft === null &&
        assessmentQuery.data.current !== null,
      disclosure:
        submittedDisclosure ?? assessmentQuery.data?.disclosure ?? null,
      error: resultActionError,
      hasDraft: assessmentQuery.data?.draft != null,
      inputLock: compatibilityInputLock,
      onRetryState: () => void assessmentQuery.refetch(),
      isSaved:
        assessmentQuery.data?.publication.decision === "GRANTED" &&
        assessmentQuery.data.publicProfile?.assessmentId ===
          displayedProfile?.assessmentId,
      isLegacyResult:
        assessmentQuery.data?.current?.assessmentId ===
          displayedProfile?.assessmentId &&
        assessmentQuery.data?.current?.quality === "LEGACY_UNVERIFIED",
      isCompatibilityEligible:
        displayedAssessment?.compatibilityEligible ?? false,
      onDiscard: discardDraft,
      onDeleteAll: deleteAllPersonalityData,
      onSave: publishResult,
      onRetake: retakeAssessment,
      preview: displayedProfile,
      measurement: displayedAssessment?.measurement ?? null,
      stateStatus: assessmentStateStatus,
    },
    backLabel: buildBackToLabel(backDestination),
    continueLabel: isEditMode ? "Back to settings" : "Continue",
    continueToInterests,
    displayProgress,
    dynamic: {
      capability: capabilitiesQuery.data?.dynamic ?? null,
      continue: continueDynamicAssessment,
      start: beginDynamicAssessment,
      state: dynamicTestState,
    },
    goBack,
    isEditMode,
    isOnline,
    scrollContainerRef,
    setPendingLength,
    submissionError,
    submitCurrentAssessment,
    testState,
  };
}

function toPublicProfile(
  assessment: PersonalityAssessmentState["current"],
): PublicPersonalityProfile | null {
  if (!assessment) {
    return null;
  }

  return {
    assessmentId: assessment.assessmentId,
    instrumentVersion: assessment.instrumentVersion,
    scoringVersion: assessment.scoringVersion,
    displayVersion: assessment.displayVersion,
    personalityType: assessment.personalityType,
    ocean: assessment.ocean,
  };
}

function getSubmissionErrorMessage(error: unknown) {
  const code = getApiErrorCode(error);

  if (code === "ASSESSMENT_ATTEMPT_EXPIRED") {
    return "This submission window expired. Your answers are still here; start a new submission to send them.";
  }

  if (code === "ASSESSMENT_ATTEMPT_STALE") {
    return "A newer assessment changed this submission. Your answers are still here; start a new submission to send them.";
  }

  if (code === "ASSESSMENT_DRAFT_EXISTS") {
    return "You already have a saved draft. Review or discard it before submitting another assessment.";
  }

  if (code === "ASSESSMENT_SUBMISSION_CONFLICT") {
    return "These answers do not belong to the open submission. Your answers are still here; start a new submission to try again.";
  }

  if (
    error instanceof Error &&
    error.message === "Answer every question before submitting."
  ) {
    return error.message;
  }

  return "We couldn't submit your answers. They are still in this tab, and retrying will use the same submission.";
}

function shouldReplaceSubmissionPair(error: unknown) {
  const code = getApiErrorCode(error);

  return (
    code === "ASSESSMENT_ATTEMPT_EXPIRED" || code === "ASSESSMENT_ATTEMPT_STALE"
  );
}

function getResultActionErrorMessage(_error: unknown) {
  return "We couldn't update your personality settings. Refresh and try again.";
}

function getAssessmentQueryStatus({
  hasData,
  isError,
  isFetching,
  isPending,
}: {
  hasData: boolean;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
}): PersonalityAssessmentQueryStatus {
  if (isPending && !hasData) return "loading";
  if (isError) return "error";
  if (isFetching) return "refreshing";
  return "ready";
}

function getApiErrorCode(error: unknown) {
  if (!(error instanceof Error) || typeof error.cause !== "object") {
    return null;
  }

  const cause = error.cause;

  if (!cause || !("code" in cause) || typeof cause.code !== "string") {
    return null;
  }

  return cause.code;
}
