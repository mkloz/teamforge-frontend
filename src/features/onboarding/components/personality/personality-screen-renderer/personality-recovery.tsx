import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  getPersonalityDraftStorageStatus,
  subscribePersonalityDraftStorageStatus,
} from "@/features/onboarding/store/personality-draft-storage";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { PersonalityScreenShell } from "./personality-screen-layout";

interface PersonalityRecoveryProps {
  answeredCount: number;
  backLabel: string;
  onBack: () => void;
  onDiscard: () => void;
  onResume: () => void;
  totalQuestions: number;
}

export function PersonalityRecovery({
  answeredCount,
  backLabel,
  onBack,
  onDiscard,
  onResume,
  totalQuestions,
}: PersonalityRecoveryProps) {
  const storageStatus = useSyncExternalStore(
    subscribePersonalityDraftStorageStatus,
    getPersonalityDraftStorageStatus,
    () => "idle",
  );
  const requiresTakeover = storageStatus === "takeover";
  const progress =
    totalQuestions === 0 ? 0 : (answeredCount / totalQuestions) * 100;

  return (
    <PersonalityScreenShell className="max-w-md pt-10 sm:pt-12">
      <p className="mb-2 font-semibold text-sm text-teal">
        {requiresTakeover ? "Found in another tab" : "Saved in this tab"}
      </p>
      <h1 className="text-balance font-extrabold text-2xl text-ink leading-tight sm:text-display-lg">
        Continue where you stopped?
      </h1>
      <p className="mt-3 text-pretty text-muted-foreground text-sm leading-relaxed sm:text-base">
        {requiresTakeover
          ? "This copied tab contains unfinished answers from the same signed-in session. Continuing here takes over this draft without merging changes."
          : "These unfinished answers belong to your current signed-in session. They have not been sent to TeamForge."}
      </p>

      <div className="mt-8 rounded-2xl bg-card p-5">
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-semibold text-ink text-sm">Assessment</span>
          <span className="text-muted-foreground text-sm">
            {answeredCount} of {totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="mt-4" />
      </div>

      <div className="mt-auto grid xs:grid-cols-[auto_1fr] gap-3 pt-8">
        <Button variant="outline" size="md" onClick={onBack}>
          <ArrowLeft className="size-4" />
          {backLabel}
        </Button>
        <Button size="md" onClick={onResume}>
          <RotateCcw className="size-4" />
          {requiresTakeover ? "Continue in this tab" : "Continue assessment"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="xs:col-span-2 justify-self-center text-muted-foreground"
          onClick={onDiscard}
        >
          <Trash2 className="size-4" />
          Discard unfinished answers
        </Button>
      </div>
    </PersonalityScreenShell>
  );
}
