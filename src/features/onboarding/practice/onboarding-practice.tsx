import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  Check,
  Compass,
  GitFork,
  type LucideIcon,
  RefreshCcw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import {
  ONBOARDING_PRACTICE_TASKS,
  type OnboardingPracticeTaskId,
} from "./practice-model";
import { useOnboardingPracticeProgress } from "./practice-progress";
import { PracticeTaskStage } from "./practice-task-stage";

interface OnboardingPracticeProps {
  onComplete: () => void;
  onExit: () => void;
  onReplay: () => void;
  onTaskCompleted: (taskId: OnboardingPracticeTaskId) => void;
  storageKey: string;
}

const taskIcons: Record<OnboardingPracticeTaskId, LucideIcon> = {
  navigation: Compass,
  "group-and-plan": GitFork,
  "ways-to-join": Users,
  "plan-changes": RefreshCcw,
  "privacy-and-safety": ShieldCheck,
};

export function OnboardingPractice({
  onComplete,
  onExit,
  onReplay,
  onTaskCompleted,
  storageKey,
}: OnboardingPracticeProps) {
  const progress = useOnboardingPracticeProgress(storageKey);
  const taskHeadingRef = useRef<HTMLHeadingElement>(null);
  const reduceMotion = useReducedMotion();
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const activeTask =
    ONBOARDING_PRACTICE_TASKS.find(
      (task) => task.id === progress.activeTaskId,
    ) ?? ONBOARDING_PRACTICE_TASKS[0];
  const activeTaskIndex = ONBOARDING_PRACTICE_TASKS.findIndex(
    (task) => task.id === activeTask.id,
  );
  const nextTask = ONBOARDING_PRACTICE_TASKS[activeTaskIndex + 1] ?? null;
  const activeComplete = progress.completedTaskIds.includes(activeTask.id);

  function selectTask(
    taskId: OnboardingPracticeTaskId,
    { focusHeading = false }: { focusHeading?: boolean } = {},
  ) {
    progress.setActiveTaskId(taskId);
    setSelectedChoiceId(null);
    setShowCorrection(false);
    if (focusHeading) {
      window.requestAnimationFrame(() => taskHeadingRef.current?.focus());
    }
  }

  function checkChoice(choiceId: string) {
    setSelectedChoiceId(choiceId);
    const isCorrect = choiceId === activeTask.correctChoiceId;
    setShowCorrection(!isCorrect);

    if (isCorrect && progress.completeTask(activeTask.id)) {
      onTaskCompleted(activeTask.id);
    }
  }

  function replay() {
    progress.reset();
    setSelectedChoiceId(null);
    setShowCorrection(false);
    onReplay();
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-28 sm:px-6 md:py-10 lg:px-8">
      <header className="flex items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="font-bold text-muted-foreground text-sm">
            Practice mode
          </p>
          <h1 className="mt-2 text-balance font-black text-3xl leading-none tracking-[-0.04em] sm:text-5xl">
            Learn by trying it.
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            Five quick moments. Nothing here changes your account.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Skip
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </header>

      <PracticeJourney
        activeTaskId={activeTask.id}
        completedTaskIds={progress.completedTaskIds}
        onSelect={selectTask}
      />

      <LazyMotion features={domAnimation}>
        <AnimatePresence initial={false} mode="wait">
          <m.section
            key={activeTask.id}
            aria-labelledby="practice-task-title"
            initial={reduceMotion ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
            transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
            className="mt-7 grid min-w-0 items-center gap-6 lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] lg:gap-10"
          >
            <div className="min-w-0 lg:py-4">
              <p className="font-semibold text-muted-foreground text-sm">
                {activeTask.eyebrow}
              </p>
              <h2
                id="practice-task-title"
                ref={taskHeadingRef}
                tabIndex={-1}
                className="mt-2 text-balance font-black text-3xl leading-[1.02] tracking-[-0.04em] outline-none sm:text-4xl"
              >
                {activeTask.title}
              </h2>
              <p className="mt-4 max-w-md text-pretty text-base text-muted-foreground leading-relaxed sm:text-lg">
                {activeTask.prompt}
              </p>

              <div className="mt-5 min-h-12" aria-live="polite">
                {activeComplete ? (
                  <p className="flex items-start gap-2 text-sm leading-relaxed">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-foreground"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                    {activeTask.success}
                  </p>
                ) : showCorrection ? (
                  <p className="text-muted-foreground text-sm">
                    Try another action.
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Tap what you would do.
                  </p>
                )}
              </div>

              <PracticeActions
                activeComplete={activeComplete}
                isComplete={progress.isComplete}
                nextTaskId={nextTask?.id ?? null}
                onComplete={onComplete}
                onReplay={replay}
                onSelectTask={(taskId) =>
                  selectTask(taskId, { focusHeading: true })
                }
              />
            </div>

            <PracticeTaskStage
              task={activeTask}
              selectedChoiceId={selectedChoiceId}
              onChoose={checkChoice}
            />
          </m.section>
        </AnimatePresence>
      </LazyMotion>
    </main>
  );
}

function PracticeJourney({
  activeTaskId,
  completedTaskIds,
  onSelect,
}: {
  activeTaskId: OnboardingPracticeTaskId;
  completedTaskIds: OnboardingPracticeTaskId[];
  onSelect: (taskId: OnboardingPracticeTaskId) => void;
}) {
  return (
    <nav className="mt-7" aria-label="Practice progress">
      <ol className="flex gap-1.5">
        {ONBOARDING_PRACTICE_TASKS.map((task) => {
          const Icon = taskIcons[task.id];
          const active = task.id === activeTaskId;
          const complete = completedTaskIds.includes(task.id);

          return (
            <li
              key={task.id}
              className={cn(
                "min-w-0 transition-[flex-grow] duration-200",
                active ? "flex-[2.4] sm:flex-1" : "flex-1",
              )}
            >
              <button
                type="button"
                aria-current={active ? "step" : undefined}
                aria-label={task.title}
                onClick={() => onSelect(task.id)}
                className={cn(
                  "flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-foreground/5 px-2 text-muted-foreground transition-colors hover:bg-foreground/8 hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground/35",
                  active && "bg-primary-soft text-foreground",
                  complete && !active && "text-foreground",
                )}
              >
                {complete ? (
                  <Check className="size-4 shrink-0" strokeWidth={3} />
                ) : (
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    "hidden min-w-0 truncate font-bold text-xs sm:block",
                    active && "block",
                  )}
                >
                  {task.eyebrow}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function PracticeActions({
  activeComplete,
  isComplete,
  nextTaskId,
  onComplete,
  onReplay,
  onSelectTask,
}: {
  activeComplete: boolean;
  isComplete: boolean;
  nextTaskId: OnboardingPracticeTaskId | null;
  onComplete: () => void;
  onReplay: () => void;
  onSelectTask: (taskId: OnboardingPracticeTaskId) => void;
}) {
  if (isComplete) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={onComplete}>
          Enter Findafew
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onReplay}
          aria-label="Replay practice"
        >
          <RefreshCcw className="size-4" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  if (activeComplete && nextTaskId) {
    return (
      <Button size="sm" onClick={() => onSelectTask(nextTaskId)}>
        Next moment
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    );
  }

  return null;
}
