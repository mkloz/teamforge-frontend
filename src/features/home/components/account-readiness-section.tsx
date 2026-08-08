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
      <div className="relative overflow-hidden rounded-2xl bg-card px-4 pt-5 pb-4 sm:px-5">
        <SetupProgress
          completed={viewer.setupCompletedCount}
          total={viewer.setupTotalCount}
        />
        <div className="grid gap-4 md:grid-cols-[minmax(11rem,0.7fr)_minmax(0,1.3fr)] md:items-center md:gap-6">
          <header className="min-w-0">
            <h2
              id="account-readiness-heading"
              className="font-bold text-foreground text-lg leading-tight tracking-tight sm:text-xl"
            >
              Finish your profile
            </h2>
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-5 sm:text-sm">
              <span className="font-bold text-accent">
                {viewer.setupSteps.length}{" "}
                {viewer.setupSteps.length === 1 ? "step" : "steps"} left
              </span>{" "}
              for better matches.
            </p>
          </header>

          <ul
            aria-label="Account setup tasks"
            className={`grid list-none gap-2 p-0 ${
              viewer.setupSteps.length > 1 ? "lg:grid-cols-2" : ""
            }`}
          >
            {viewer.setupSteps.map((step) => (
              <SetupTask key={step.id} step={step} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function SetupTask({ step }: { step: HomeSetupStep }) {
  const Icon = SETUP_TASK_ICONS[step.id] ?? SETUP_STEP_ICONS[step.kind];

  return (
    <li className="min-w-0">
      <Link
        {...getHomeSetupNavigation(step)}
        aria-label={step.label}
        className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 rounded-xl bg-foreground/4.5 px-3 py-2.5 transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-foreground/7.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 motion-reduce:transform-none motion-reduce:transition-none"
      >
        <IconTile
          icon={Icon}
          shape="square"
          size="lg"
          tone="amber"
          className="transition-colors group-hover:bg-accent/15"
        />
        <span className="min-w-0">
          <span className="block font-bold text-foreground text-sm leading-5">
            {step.title}
          </span>
          <span className="mt-0.5 block font-medium text-muted-foreground text-xs leading-4">
            {step.body}
          </span>
        </span>
        <span className="hidden shrink-0 items-center gap-1 rounded-full border border-border/80 px-2.5 py-1.5 font-bold text-foreground text-xs transition-colors group-hover:border-accent/40 group-hover:text-accent sm:inline-flex">
          {step.label}
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform group-hover:translate-x-0.5"
          />
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent sm:hidden"
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
    <div className="absolute inset-x-0 top-0">
      <Progress
        aria-label={`${completed} of ${total} account setup tasks complete`}
        className="h-1 rounded-none bg-accent/10"
        indicatorClassName="bg-accent"
        value={percentage}
      />
    </div>
  );
}
