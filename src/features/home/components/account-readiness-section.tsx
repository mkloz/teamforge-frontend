import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  ImageIcon,
  type LucideIcon,
  MailCheck,
  MessageSquareText,
  Tags,
  UserRound,
} from "lucide-react";
import { useHomeViewer } from "@/features/home/hooks/use-home-viewer";
import type {
  HomeSetupStep,
  HomeSetupStepId,
  HomeSetupStepKind,
} from "@/features/home/lib/home-contract";
import { getHomeSetupNavigation } from "@/features/home/lib/home-setup-navigation";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Progress } from "@/shared/components/ui/progress";

const SETUP_STEP_ICONS: Record<HomeSetupStepKind, LucideIcon> = {
  security: MailCheck,
  account: UserRound,
  personality: BrainCircuit,
  interests: Tags,
};

const SETUP_TASK_ICONS: Partial<Record<HomeSetupStepId, LucideIcon>> = {
  avatar: ImageIcon,
  bio: MessageSquareText,
};

export function AccountReadinessSection() {
  const viewer = useHomeViewer();

  if (viewer.setupSteps.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="account-readiness-heading"
      className="mt-8 scroll-mt-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <header className="min-w-0">
          <h2
            id="account-readiness-heading"
            className="font-bold text-foreground text-lg leading-tight tracking-tight sm:text-xl md:text-2xl"
          >
            Finish your profile
          </h2>
          <p className="mt-1.5 font-medium text-muted-foreground text-sm leading-5">
            {viewer.setupSteps.length}{" "}
            {viewer.setupSteps.length === 1 ? "step" : "steps"} left for better
            matches.
          </p>
        </header>

        <SetupProgress
          completed={viewer.setupCompletedCount}
          total={viewer.setupTotalCount}
        />
      </div>

      <ul
        aria-label="Account setup tasks"
        className="mt-4 grid list-none gap-3 p-0 lg:grid-cols-2"
      >
        {viewer.setupSteps.map((step) => (
          <SetupTask key={step.id} step={step} />
        ))}
      </ul>
    </section>
  );
}

function SetupTask({ step }: { step: HomeSetupStep }) {
  const Icon = SETUP_TASK_ICONS[step.id] ?? SETUP_STEP_ICONS[step.kind];

  return (
    <li className="overflow-hidden rounded-2xl bg-card">
      <Link
        {...getHomeSetupNavigation(step)}
        aria-label={step.label}
        className="group flex min-h-24 items-center gap-3 rounded-2xl px-4 py-4 transition-colors duration-150 hover:bg-foreground/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-inset"
      >
        <IconTile
          icon={Icon}
          shape="square"
          size="lg"
          tone="neutral"
          className="transition-colors group-hover:bg-primary/10 group-hover:text-primary"
        />
        <span className="flex min-w-0 flex-1 items-center gap-3">
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-foreground text-sm leading-5 transition-colors group-hover:text-primary">
              {step.title}
            </span>
            <span className="mt-1 block font-medium text-muted-foreground text-xs leading-5">
              {step.body}
            </span>
          </span>
          <span className="hidden shrink-0 items-center gap-1 font-bold text-primary text-xs sm:inline-flex">
            {step.label}
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 sm:hidden"
        />
      </Link>
    </li>
  );
}

function SetupProgress({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div
      className="w-full shrink-0 sm:w-48"
      role="progressbar"
      aria-label={`${completed} of ${total} account setup tasks complete`}
      aria-valuemax={total}
      aria-valuemin={0}
      aria-valuenow={completed}
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="font-bold text-foreground text-sm">
          {completed} of {total}
        </span>
        <span className="font-medium text-muted-foreground text-xs">
          complete
        </span>
      </div>
      <Progress
        aria-hidden="true"
        className="h-1.5 bg-muted"
        value={percentage}
      />
    </div>
  );
}
