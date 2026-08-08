import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";

import { ONBOARDING_COACHMARKS_SESSION_KEY } from "@/shared/api/account-session-storage";
import { authSession } from "@/shared/api/auth-session";
import { useOnboardingProductStateQuery } from "@/shared/api/onboarding-product-state-query";
import { Button } from "@/shared/components/ui/button";
import {
  getBrowserSessionStorageItem,
  removeBrowserSessionStorageItem,
  setBrowserSessionStorageItem,
} from "@/shared/lib/browser-environment/session-storage";

import {
  buildNavigationTourSteps,
  isNavigationTourPathActive,
  type NavigationTourStep,
} from "./navigation-tour-steps";

const VERSION = "focused-product-tour-v3" as const;
export const ONBOARDING_COACHMARK_REPLAY_EVENT =
  "teamforge:onboarding-coachmarks-replay";

const snapshotSchema = z.object({
  version: z.literal(VERSION),
  subject: z.string(),
  sessionId: z.string(),
  status: z.enum(["ACTIVE", "COMPLETED"]),
  started: z.boolean(),
  currentStepId: z.string().nullable(),
});

type TourProgress = Pick<
  z.infer<typeof snapshotSchema>,
  "currentStepId" | "started" | "status"
>;

interface TargetGeometry {
  bottom: number;
  element: HTMLElement;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

const INITIAL_PROGRESS: TourProgress = {
  currentStepId: null,
  started: false,
  status: "ACTIVE",
};

export function OnboardingCoachmarks({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const { data: productState } = useOnboardingProductStateQuery();
  const steps = useMemo(
    () => buildNavigationTourSteps(productState),
    [productState],
  );
  const [progress, setProgress] = useState<TourProgress>(readProgress);
  const [replayRequest, setReplayRequest] = useState(0);
  const currentStepIndex = getCurrentStepIndex(steps, progress.currentStepId);
  const currentStep = steps[currentStepIndex] ?? null;
  const mayStartAutomatically = productState?.stage === "INTRODUCTORY";
  const hasPracticeAccess =
    productState?.capabilities.USE_ONBOARDING_PRACTICE.allowed === true;
  const isExpectedPage = currentStep
    ? isNavigationTourPathActive(pathname, currentStep.pathname)
    : false;
  const shouldLocateTarget =
    currentStep !== null &&
    hasPracticeAccess &&
    progress.status === "ACTIVE" &&
    (progress.started || mayStartAutomatically) &&
    isExpectedPage;
  const target = useTourTarget(
    currentStep?.targetSelector ?? null,
    shouldLocateTarget,
  );
  const dialogRef = useRef<HTMLElement>(null);

  const updateProgress = useCallback((next: TourProgress) => {
    setProgress(next);
    writeProgress(next);
  }, []);

  const exitTutorial = useCallback(() => {
    updateProgress({
      currentStepId: progress.currentStepId,
      started: true,
      status: "COMPLETED",
    });
    target?.element.focus({ preventScroll: true });
  }, [progress.currentStepId, target?.element, updateProgress]);

  useEffect(() => {
    const replay = () => setReplayRequest((request) => request + 1);
    window.addEventListener(ONBOARDING_COACHMARK_REPLAY_EVENT, replay);
    return () =>
      window.removeEventListener(ONBOARDING_COACHMARK_REPLAY_EVENT, replay);
  }, []);

  useEffect(() => {
    const firstStep = steps[0];
    if (replayRequest === 0 || !firstStep) return;

    removeBrowserSessionStorageItem(ONBOARDING_COACHMARKS_SESSION_KEY);
    updateProgress({
      currentStepId: firstStep.id,
      started: true,
      status: "ACTIVE",
    });
    setReplayRequest(0);
    void navigate({ to: firstStep.pathname });
  }, [navigate, replayRequest, steps, updateProgress]);

  useEffect(() => {
    if (!target || progress.started || !currentStep) return;
    updateProgress({
      currentStepId: currentStep.id,
      started: true,
      status: "ACTIVE",
    });
  }, [currentStep, progress.started, target, updateProgress]);

  useEffect(() => {
    if (!target || !currentStep) return;
    dialogRef.current?.focus({ preventScroll: true });
  }, [currentStep, target]);

  useEffect(() => {
    if (!target || progress.status !== "ACTIVE") return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      exitTutorial();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [exitTutorial, progress.status, target]);

  if (!currentStep || !target || !hasPracticeAccess) {
    return null;
  }

  const nextStep = steps[currentStepIndex + 1] ?? null;
  const previousStep = steps[currentStepIndex - 1] ?? null;
  function goToStep(step: NavigationTourStep) {
    updateProgress({
      currentStepId: step.id,
      started: true,
      status: "ACTIVE",
    });
    if (!isNavigationTourPathActive(pathname, step.pathname)) {
      void navigate({ to: step.pathname });
    }
  }

  function advance() {
    if (!nextStep) {
      exitTutorial();
      return;
    }
    goToStep(nextStep);
  }

  function goBack() {
    if (previousStep) goToStep(previousStep);
  }

  return (
    <>
      <div
        aria-hidden="true"
        data-onboarding-tour-spotlight
        className="pointer-events-none fixed z-110 rounded-xl bg-transparent shadow-[0_0_0_9999px_rgb(0_0_0/0.56)] transition-[top,left,width,height] duration-200 motion-reduce:transition-none"
        style={getSpotlightStyle(target)}
      />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="onboarding-tour-title"
        aria-describedby="onboarding-tour-description"
        className="fixed z-120 max-h-[calc(100dvh-1.5rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-border/80 bg-popover p-4 text-popover-foreground shadow-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
        style={getDialogStyle(target)}
        tabIndex={-1}
      >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p
              className="font-bold text-muted-foreground text-xs"
              aria-live="polite"
            >
              {currentStepIndex + 1} of {steps.length}
            </p>
            <h2
              id="onboarding-tour-title"
              className="mt-1 text-balance font-black text-lg leading-tight sm:text-xl"
            >
              {currentStep.title}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Exit tutorial"
            onClick={exitTutorial}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <p
          id="onboarding-tour-description"
          className="mt-2 text-pretty text-muted-foreground text-sm leading-6"
        >
          {currentStep.body}
        </p>

        <p className="mt-3 border-foreground/35 border-l-2 pl-3 font-semibold text-sm leading-5">
          {currentStep.action}
        </p>

        <div
          className="mt-4 flex items-center gap-1.5"
          role="progressbar"
          aria-label="Tutorial progress"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={currentStepIndex + 1}
        >
          {steps.map((step, index) => (
            <span
              key={step.id}
              aria-hidden="true"
              className={`h-1 flex-1 rounded-full ${
                index <= currentStepIndex ? "bg-forge-teal" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {previousStep ? (
            <Button type="button" variant="ghost" size="sm" onClick={goBack}>
              Back
            </Button>
          ) : (
            <span />
          )}
          <Button type="button" size="sm" onClick={advance}>
            {getAdvanceLabel(nextStep)}
          </Button>
        </div>
      </section>
    </>
  );
}

function useTourTarget(selector: string | null, active: boolean) {
  const [target, setTarget] = useState<TargetGeometry | null>(null);

  useEffect(() => {
    if (!selector || !active) {
      setTarget(null);
      return undefined;
    }

    const update = () => {
      const element = findVisibleTarget(selector);
      if (!element) {
        setTarget(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const next: TargetGeometry = {
        bottom: rect.bottom,
        element,
        height: rect.height,
        left: rect.left,
        right: rect.right,
        top: rect.top,
        width: rect.width,
      };
      setTarget((previous) =>
        hasSameGeometry(previous, next) ? previous : next,
      );
    };

    update();
    const mutationObserver = new MutationObserver(update);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
    const retryTimer = window.setInterval(update, 250);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      mutationObserver.disconnect();
      window.clearInterval(retryTimer);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, selector]);

  return target;
}

function findVisibleTarget(selector: string) {
  return [...document.querySelectorAll<HTMLElement>(selector)].find(
    (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    },
  );
}

function hasSameGeometry(
  previous: TargetGeometry | null,
  next: TargetGeometry,
) {
  return Boolean(
    previous &&
      previous.element === next.element &&
      previous.top === next.top &&
      previous.left === next.left &&
      previous.width === next.width &&
      previous.height === next.height,
  );
}

function getSpotlightStyle(target: TargetGeometry): CSSProperties {
  const padding = 6;
  const top = Math.max(4, target.top - padding);
  const left = Math.max(4, target.left - padding);
  return {
    top,
    left,
    width: Math.min(window.innerWidth - left - 4, target.width + padding * 2),
    height: Math.min(window.innerHeight - top - 4, target.height + padding * 2),
  };
}

function getDialogStyle(target: TargetGeometry): CSSProperties {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const outerGap = 12;
  const targetGap = 14;
  const width = Math.min(352, viewportWidth - outerGap * 2);
  const estimatedHeight = Math.min(284, viewportHeight - outerGap * 2);
  const canFitRight =
    target.right + targetGap + width <= viewportWidth - outerGap;
  const isLeftRailTarget = target.left < 80 && target.width < 96;
  const isTallLeftPanel =
    target.left < viewportWidth / 2 && target.height > estimatedHeight * 1.25;

  let left = clamp(
    target.left + target.width / 2 - width / 2,
    outerGap,
    viewportWidth - width - outerGap,
  );
  let top: number;

  if ((isLeftRailTarget || isTallLeftPanel) && canFitRight) {
    left = target.right + targetGap;
    top = clamp(
      target.top + target.height / 2 - estimatedHeight / 2,
      outerGap,
      viewportHeight - estimatedHeight - outerGap,
    );
  } else if (target.bottom + targetGap + estimatedHeight <= viewportHeight) {
    top = target.bottom + targetGap;
  } else if (target.top - targetGap - estimatedHeight >= outerGap) {
    top = target.top - targetGap - estimatedHeight;
  } else {
    top = clamp(
      target.top + target.height / 2 - estimatedHeight / 2,
      outerGap,
      viewportHeight - estimatedHeight - outerGap,
    );
  }

  return { left, top };
}

function getAdvanceLabel(nextStep: NavigationTourStep | null) {
  if (!nextStep) return "Finish tutorial";
  return `Next: ${nextStep.pageLabel}`;
}

function getCurrentStepIndex(
  steps: NavigationTourStep[],
  currentStepId: string | null,
) {
  const savedIndex = currentStepId
    ? steps.findIndex((step) => step.id === currentStepId)
    : -1;
  return savedIndex >= 0 ? savedIndex : 0;
}

function readProgress(): TourProgress {
  const binding = authSession.getSessionBinding();
  const serialized = getBrowserSessionStorageItem(
    ONBOARDING_COACHMARKS_SESSION_KEY,
  );
  if (!binding || !serialized) return INITIAL_PROGRESS;

  try {
    const parsed = snapshotSchema.safeParse(JSON.parse(serialized));
    return parsed.success &&
      parsed.data.subject === binding.subject &&
      parsed.data.sessionId === binding.sessionId
      ? {
          currentStepId: parsed.data.currentStepId,
          started: parsed.data.started,
          status: parsed.data.status,
        }
      : INITIAL_PROGRESS;
  } catch {
    return INITIAL_PROGRESS;
  }
}

function writeProgress(progress: TourProgress) {
  const binding = authSession.getSessionBinding();
  if (!binding) return;
  setBrowserSessionStorageItem(
    ONBOARDING_COACHMARKS_SESSION_KEY,
    JSON.stringify({ version: VERSION, ...binding, ...progress }),
  );
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}
