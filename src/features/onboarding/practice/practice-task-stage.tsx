import {
  CalendarCheck2,
  Check,
  Compass,
  Eye,
  Hammer,
  LockKeyhole,
  type LucideIcon,
  MapPin,
  MessageCircle,
  RefreshCcw,
  Search,
  ShieldCheck,
  TicketCheck,
  UserPlus,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { cn } from "@/shared/lib/utils";
import type {
  OnboardingPracticeChoice,
  OnboardingPracticeTask,
  OnboardingPracticeTaskId,
} from "./practice-model";

interface PracticeTaskStageProps {
  onChoose: (choiceId: string) => void;
  selectedChoiceId: string | null;
  task: OnboardingPracticeTask;
}

const choiceIcons: Record<
  OnboardingPracticeTaskId,
  Record<string, LucideIcon>
> = {
  navigation: {
    activity: MessageCircle,
    explore: Compass,
    profile: UserRound,
  },
  "group-and-plan": {
    group: UsersRound,
    plan: CalendarCheck2,
  },
  "ways-to-join": {
    invite: UserPlus,
    "open-plan": TicketCheck,
    forge: Hammer,
  },
  "plan-changes": {
    "keep-going": Check,
    reconfirm: RefreshCcw,
  },
  "privacy-and-safety": {
    everything: Eye,
    limited: ShieldCheck,
  },
};

export function PracticeTaskStage({
  onChoose,
  selectedChoiceId,
  task,
}: PracticeTaskStageProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-3xl bg-card">
      <div className="min-h-64 p-4 sm:min-h-72 sm:p-6">
        <TaskVisual taskId={task.id} />
      </div>
      <div
        className={cn(
          "grouped-surface grid",
          task.choices.length === 3 ? "grid-cols-3" : "grid-cols-2",
        )}
      >
        {task.choices.map((choice) => (
          <PracticeChoice
            key={choice.id}
            choice={choice}
            correctChoiceId={task.correctChoiceId}
            icon={choiceIcons[task.id][choice.id] ?? Compass}
            selectedChoiceId={selectedChoiceId}
            onChoose={onChoose}
          />
        ))}
      </div>
    </div>
  );
}

function PracticeChoice({
  choice,
  correctChoiceId,
  icon: Icon,
  onChoose,
  selectedChoiceId,
}: {
  choice: OnboardingPracticeChoice;
  correctChoiceId: string;
  icon: LucideIcon;
  onChoose: (choiceId: string) => void;
  selectedChoiceId: string | null;
}) {
  const selected = choice.id === selectedChoiceId;
  const correct = choice.id === correctChoiceId;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onChoose(choice.id)}
      className={cn(
        "group flex min-h-20 min-w-0 flex-col items-center justify-center gap-2 bg-background px-2 py-3 text-center text-muted-foreground transition-[box-shadow,color,transform] duration-150 hover:-translate-y-0.5 hover:text-foreground hover:shadow-soft-sm focus-visible:z-10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-inset active:scale-[0.98] motion-reduce:transition-none sm:min-h-24 sm:px-4",
        selected && correct && "bg-forge-teal/12 text-foreground",
        selected && !correct && "bg-destructive/8 text-foreground",
      )}
    >
      <span className="relative grid size-6 place-items-center">
        <Icon className="size-5" aria-hidden="true" />
        {selected ? (
          correct ? (
            <Check
              className="absolute -right-2 -bottom-1 size-3.5 text-foreground"
              strokeWidth={3}
              aria-hidden="true"
            />
          ) : (
            <X
              className="absolute -right-2 -bottom-1 size-3.5 text-destructive"
              strokeWidth={3}
              aria-hidden="true"
            />
          )
        ) : null}
      </span>
      <span className="line-clamp-2 font-bold text-xs leading-tight sm:text-sm">
        {choice.label}
      </span>
    </button>
  );
}

function TaskVisual({ taskId }: { taskId: OnboardingPracticeTaskId }) {
  switch (taskId) {
    case "navigation":
      return <NavigationVisual />;
    case "group-and-plan":
      return <GroupAndPlanVisual />;
    case "ways-to-join":
      return <WaysToJoinVisual />;
    case "plan-changes":
      return <PlanChangesVisual />;
    case "privacy-and-safety":
      return <PrivacyVisual />;
    default:
      return null;
  }
}

function NavigationVisual() {
  return (
    <div className="flex h-full min-h-56 flex-col justify-between">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-black text-xl sm:text-2xl">This weekend</p>
          <p className="mt-1 text-muted-foreground text-sm">
            Plans with open places
          </p>
        </div>
        <Search className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="grid grid-cols-[1.15fr_0.85fr] gap-2 sm:gap-3">
        <div className="flex min-h-32 flex-col justify-end rounded-2xl bg-forge-teal/12 p-4">
          <MapPin className="mb-auto size-5" aria-hidden="true" />
          <p className="font-black text-lg">Photo walk</p>
          <p className="text-muted-foreground text-xs">3 places left</p>
        </div>
        <div className="flex min-h-32 flex-col justify-end rounded-2xl bg-background p-4">
          <UsersRound className="mb-auto size-5" aria-hidden="true" />
          <p className="font-black text-lg">Chess table</p>
          <p className="text-muted-foreground text-xs">Near you</p>
        </div>
      </div>
    </div>
  );
}

function GroupAndPlanVisual() {
  return (
    <div className="flex h-full min-h-56 flex-col justify-between">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2" aria-hidden="true">
          {["Q", "A", "M"].map((initial) => (
            <span
              key={initial}
              className="grid size-10 place-items-center rounded-full bg-background font-black text-xs ring-2 ring-card"
            >
              {initial}
            </span>
          ))}
        </div>
        <div>
          <p className="font-black text-lg">Museum circle</p>
          <p className="text-muted-foreground text-xs">Your regular group</p>
        </div>
      </div>
      <div className="relative ml-5 border-forge-teal/45 border-l-2 pl-6">
        <span className="absolute top-1/2 -left-2 size-3.5 -translate-y-1/2 rounded-full bg-forge-teal ring-4 ring-card" />
        <p className="text-muted-foreground text-xs">Friday · 19:00</p>
        <p className="mt-1 font-black text-2xl">Late-night exhibition</p>
        <p className="mt-2 text-muted-foreground text-sm">
          One plan inside the group
        </p>
      </div>
    </div>
  );
}

function WaysToJoinVisual() {
  return (
    <div className="flex h-full min-h-56 items-center justify-center">
      <div className="relative grid w-full max-w-md grid-cols-3 items-center gap-3">
        <PathNode icon={UserPlus} label="Someone" />
        <div className="relative z-10 grid aspect-square place-items-center rounded-full bg-forge-teal/14 text-center">
          <Hammer className="size-8" aria-hidden="true" />
          <span className="sr-only">Your activity idea</span>
        </div>
        <PathNode icon={TicketCheck} label="Open plan" />
        <span className="pointer-events-none absolute top-1/2 left-[15%] h-px w-[70%] -translate-y-1/2 bg-foreground/15" />
        <p className="col-span-3 mt-3 text-center font-black text-xl sm:text-2xl">
          Your idea becomes a group
        </p>
      </div>
    </div>
  );
}

function PathNode({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2">
      <span className="grid size-12 place-items-center rounded-full bg-background">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}

function PlanChangesVisual() {
  return (
    <div className="flex h-full min-h-56 items-center justify-center gap-3 sm:gap-6">
      <CalendarTile day="18" label="Friday" muted />
      <RefreshCcw
        className="size-5 shrink-0 text-foreground"
        aria-hidden="true"
      />
      <CalendarTile day="19" label="Saturday" />
    </div>
  );
}

function CalendarTile({
  day,
  label,
  muted = false,
}: {
  day: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-28 rounded-2xl bg-background p-4 text-center sm:min-w-36 sm:p-5",
        muted && "opacity-40",
      )}
    >
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="mt-2 font-black text-5xl tracking-[-0.06em]">{day}</p>
      <p className="mt-2 text-sm">19:00</p>
    </div>
  );
}

function PrivacyVisual() {
  return (
    <div className="flex h-full min-h-56 flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs">Invitation preview</p>
          <p className="mt-1 font-black text-2xl">Sunday photo walk</p>
        </div>
        <ShieldCheck className="size-6 text-foreground" aria-hidden="true" />
      </div>
      <div className="grid gap-2">
        <PreviewRow icon={MapPin} label="Shoreditch · 10:00" />
        <PreviewRow icon={LockKeyhole} label="Member list hidden" muted />
        <PreviewRow icon={LockKeyhole} label="Group chat hidden" muted />
      </div>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  label,
  muted = false,
}: {
  icon: LucideIcon;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl bg-background px-4 py-3 text-sm",
        muted && "text-muted-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
