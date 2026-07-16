import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useBlocker, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useInvalidateCurrentUser } from "@/shared/api/current-user-query";
import { PersonalityAssessmentApi } from "@/shared/api/personality-assessment-api";
import {
  PERSONALITY_ASSESSMENT_QUERY_KEY,
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
import { usePersonalityTestStore } from "../store/personality-test-store";
import { usePersonalityTest } from "./use-personality-test";

type AssessmentResultAction =
  | "publish"
  | "keep-private"
  | "discard"
  | "delete-all"
  | "retake";

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
  const queryClient = useQueryClient();
  const invalidateCurrentUser = useInvalidateCurrentUser();
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const assessmentQuery = useQuery(personalityAssessmentQueryOptions());
  const testState = usePersonalityTest({
    questionsPerPage: QUESTIONS_PER_PAGE,
  });

  const hasUnsentAnswers = Object.keys(testState.answers).length > 0;
  const shouldBlockNavigation = useCallback(() => {
    return !window.confirm(
      "Your answers have not been submitted. Leave and lose them?",
    );
  }, []);

  useBlocker({
    disabled: !hasUnsentAnswers,
    enableBeforeUnload: hasUnsentAnswers,
    shouldBlockFn: shouldBlockNavigation,
  });

  const submitCurrentAssessment = useCallback(async () => {
    if (submissionInFlightRef.current) {
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
      let submissionPair = submissionPairRef.current;

      if (!submissionPair) {
        const ownerState = await queryClient.ensureQueryData(
          personalityAssessmentQueryOptions(),
        );
        const attempt = await PersonalityAssessmentApi.createAttempt({
          formVersion: FORM_VERSION_BY_LENGTH[snapshot.testLength],
          source: ownerState?.current ? "RETAKE" : "ONBOARDING",
        });

        submissionPair = {
          attemptId: attempt.attemptId,
          idempotencyKey: crypto.randomUUID(),
        };
        submissionPairRef.current = submissionPair;
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
      snapshot.setScreen({ id: "results" });
      void queryClient.invalidateQueries({
        queryKey: PERSONALITY_ASSESSMENT_QUERY_KEY,
      });
    } catch (error) {
      if (shouldReplaceSubmissionPair(error)) {
        submissionPairRef.current = null;
      }
      setSubmissionError(getSubmissionErrorMessage(error));
    } finally {
      submissionInFlightRef.current = false;
    }
  }, [guardOfflineAction, queryClient]);

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

  async function keepResultPrivate() {
    await runResultAction("keep-private", () =>
      PersonalityAssessmentApi.keepPrivate(),
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
    setActiveResultAction("retake");
    setResultActionError(null);

    try {
      if (assessmentQuery.data?.draft) {
        const nextState = await PersonalityAssessmentApi.discardDraft();
        queryClient.setQueryData(PERSONALITY_ASSESSMENT_QUERY_KEY, nextState);
      }

      setSubmittedPreview(null);
      setSubmittedDisclosure(null);
      submissionPairRef.current = null;
      testState.actions.reset();
      testState.actions.setScreen({ id: "length" });
    } catch (error) {
      setResultActionError(getResultActionErrorMessage(error));
    } finally {
      setActiveResultAction(null);
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
      setResultActionError(
        "Publish the result or keep it private before continuing.",
      );
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
      isLoading: assessmentQuery.isLoading,
      isPublished:
        assessmentQuery.data?.publication.decision === "GRANTED" &&
        assessmentQuery.data.publicProfile?.assessmentId ===
          displayedProfile?.assessmentId,
      isResultPrivate:
        assessmentQuery.data?.publication.decision === "REVOKED" &&
        assessmentQuery.data.current?.assessmentId ===
          displayedProfile?.assessmentId,
      isLegacyResult:
        assessmentQuery.data?.current?.assessmentId ===
          displayedProfile?.assessmentId &&
        assessmentQuery.data?.current?.quality === "LEGACY_UNVERIFIED",
      onDiscard: discardDraft,
      onDeleteAll: deleteAllPersonalityData,
      onKeepPrivate: keepResultPrivate,
      onPublish: publishResult,
      onRetake: retakeAssessment,
      preview: displayedProfile,
    },
    backLabel: buildBackToLabel(backDestination),
    continueLabel: isEditMode ? "Back to settings" : "Continue",
    continueToInterests,
    displayProgress,
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

  return "We couldn't submit your answers. They are still on this device, and retrying will use the same submission.";
}

function shouldReplaceSubmissionPair(error: unknown) {
  const code = getApiErrorCode(error);

  return (
    code === "ASSESSMENT_ATTEMPT_EXPIRED" || code === "ASSESSMENT_ATTEMPT_STALE"
  );
}

function getResultActionErrorMessage(error: unknown) {
  return error instanceof Error && error.message
    ? error.message
    : "We couldn't update your personality settings. Try again.";
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
