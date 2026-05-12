import { MessageSquareText } from "lucide-react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Button } from "@/shared/components/ui/button";

export function IcebreakerPrompt({ detail }: { detail: GroupPlanDetail }) {
  const isMember =
    detail.viewer.canVoteOnPlanChange || detail.viewer.canSuggestPlanChange;
  if (!isMember) return null;

  const signals = detail.fit?.signals ?? [];
  const sharedInterest = signals.find((s) => s.key === "SHARED_INTERESTS");

  return (
    <article className="relative overflow-hidden rounded-2xl bg-forge-teal/5 p-6 md:p-8">
      <div className="absolute -top-4 -right-4 text-forge-teal opacity-5">
        <MessageSquareText className="size-32" />
      </div>
      <div className="relative z-10">
        <p className="type-signature-label font-bold text-forge-teal uppercase tracking-widest">
          Break the ice
        </p>
        <p className="mt-2 text-pretty font-semibold text-base text-foreground leading-relaxed md:text-lg">
          {sharedInterest
            ? `You all share an interest in ${sharedInterest.detail.toLowerCase()}. Has anyone tried the new place downtown?`
            : "Say hello and kickstart the plan. The group is waiting for someone to make the first move."}
        </p>
        <Button variant="primary" className="mt-6">
          <MessageSquareText className="mr-2 size-4" />
          Send a message
        </Button>
      </div>
    </article>
  );
}
