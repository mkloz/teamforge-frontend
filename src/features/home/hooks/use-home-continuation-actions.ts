import { useMutation } from "@tanstack/react-query";
import { type RefObject, useRef, useState } from "react";
import { HomeCache } from "@/features/home/api/home-cache";
import { HomeCommands } from "@/features/home/api/home-commands";
import { useOfflineActionGuard } from "@/shared/hooks/use-offline-action-guard";
import { getHttpErrorStatus } from "@/shared/lib/api-error-message";

export type HomeContinuationResponse = "CONTINUED" | "NOT_CONTINUED";

export type HomeContinuationFeedback =
  | "ANSWERED"
  | "CLOSED"
  | "FAILED"
  | "NO_LONGER_ELIGIBLE"
  | "OFFLINE";

export interface HomeContinuationAnswer {
  checkInId: string;
  response: HomeContinuationResponse;
}

interface PendingContinuationAnswer extends HomeContinuationAnswer {
  idempotencyKey: string;
}

const CLOSED_ERROR_CODE = "CONTINUATION_WINDOW_CLOSED";
const NO_LONGER_ELIGIBLE_ERROR_CODE = "CONTINUATION_MEMBER_NO_LONGER_ELIGIBLE";
const RESPONSE_CONFLICT_ERROR_CODE = "CONTINUATION_RESPONSE_CONFLICT";

export function useHomeContinuationActions() {
  const [feedbackByCheckInId, setFeedbackByCheckInId] = useState<
    Record<string, HomeContinuationFeedback>
  >({});
  const operationRef = useRef(new Map<string, string>());
  const [pendingAnswers, setPendingAnswers] = useState<
    Record<string, PendingContinuationAnswer>
  >({});
  const { guardOfflineAction, isOnline } = useOfflineActionGuard();
  const mutation = useMutation({
    meta: {
      errorToast: false,
    },
    mutationKey: ["home", "continuation", "record"],
    mutationFn: (answer: PendingContinuationAnswer) =>
      HomeCommands.recordContinuationResponse(
        answer.checkInId,
        answer.response,
        answer.idempotencyKey,
      ),
  });

  async function answerContinuation(answer: HomeContinuationAnswer) {
    if (
      guardOfflineAction({
        id: "home-continuation-offline",
        description: "Reconnect before answering this check-in.",
      })
    ) {
      setFeedback(answer.checkInId, "OFFLINE");
      return null;
    }

    clearFeedback(answer.checkInId);
    const pendingAnswer = {
      ...answer,
      idempotencyKey: getIdempotencyKey(answer, operationRef),
    };
    setPendingAnswers((current) => ({
      ...current,
      [answer.checkInId]: pendingAnswer,
    }));

    try {
      const result = await mutation.mutateAsync(pendingAnswer);

      operationRef.current.delete(getOperationFingerprint(answer));
      const feedback = getFeedbackForServerState(result.state) ?? "FAILED";
      setFeedback(answer.checkInId, feedback);

      if (isTerminalFeedback(feedback)) {
        void HomeCache.markGroupsStale();
      }
      return result;
    } catch (error) {
      const feedback = await getContinuationFailureFeedback(
        error,
        answer.checkInId,
      );

      setFeedback(answer.checkInId, feedback);

      if (isTerminalFeedback(feedback)) {
        void HomeCache.markGroupsStale();
      }
      return null;
    } finally {
      setPendingAnswers((current) => {
        if (
          current[answer.checkInId]?.idempotencyKey !==
          pendingAnswer.idempotencyKey
        ) {
          return current;
        }

        const next = { ...current };
        delete next[answer.checkInId];
        return next;
      });
    }
  }

  function setFeedback(checkInId: string, feedback: HomeContinuationFeedback) {
    setFeedbackByCheckInId((current) => ({
      ...current,
      [checkInId]: feedback,
    }));
  }

  function clearFeedback(checkInId: string) {
    setFeedbackByCheckInId((current) => {
      if (!(checkInId in current)) {
        return current;
      }

      const next = { ...current };
      delete next[checkInId];
      return next;
    });
  }

  return {
    answerContinuation,
    feedbackByCheckInId,
    isOnline,
    pendingAnswers,
  };
}

function getFeedbackForServerState(
  state: "ANSWERED" | "CLOSED" | "DUE" | "NO_LONGER_ELIGIBLE",
): HomeContinuationFeedback | null {
  return state === "DUE" ? null : state;
}

function isTerminalFeedback(
  feedback: HomeContinuationFeedback,
): feedback is "ANSWERED" | "CLOSED" | "NO_LONGER_ELIGIBLE" {
  return (
    feedback === "ANSWERED" ||
    feedback === "CLOSED" ||
    feedback === "NO_LONGER_ELIGIBLE"
  );
}

function getIdempotencyKey(
  answer: HomeContinuationAnswer,
  operationRef: RefObject<Map<string, string>>,
) {
  const fingerprint = getOperationFingerprint(answer);
  const existingKey = operationRef.current.get(fingerprint);

  if (existingKey) {
    return existingKey;
  }

  const idempotencyKey = globalThis.crypto.randomUUID();
  operationRef.current.set(fingerprint, idempotencyKey);
  return idempotencyKey;
}

function getOperationFingerprint(answer: HomeContinuationAnswer) {
  return `${answer.checkInId}:${answer.response}`;
}

async function getContinuationFailureFeedback(
  error: unknown,
  checkInId: string,
): Promise<HomeContinuationFeedback> {
  const errorCode = getApiErrorCode(error);

  if (errorCode === CLOSED_ERROR_CODE) {
    return "CLOSED";
  }

  if (
    errorCode === NO_LONGER_ELIGIBLE_ERROR_CODE ||
    getHttpErrorStatus(error) === 404
  ) {
    return "NO_LONGER_ELIGIBLE";
  }

  if (errorCode === RESPONSE_CONFLICT_ERROR_CODE) {
    try {
      const checkIn = await HomeCommands.getContinuationCheckIn(checkInId);

      if (checkIn?.state === "ANSWERED") {
        return "ANSWERED";
      }

      if (checkIn?.state === "CLOSED") {
        return "CLOSED";
      }

      if (checkIn?.state === "NO_LONGER_ELIGIBLE") {
        return "NO_LONGER_ELIGIBLE";
      }
    } catch {
      return "FAILED";
    }
  }

  return "FAILED";
}

function getApiErrorCode(error: unknown) {
  if (!(error instanceof Error)) {
    return null;
  }

  const cause = error.cause;

  if (!cause || typeof cause !== "object" || !("code" in cause)) {
    return null;
  }

  const code: unknown = Reflect.get(cause, "code");
  return typeof code === "string" ? code : null;
}
