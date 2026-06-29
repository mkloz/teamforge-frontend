import { domAnimation, LazyMotion, m } from "framer-motion";

import { Avatar } from "@/shared/components/common/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface ProposalVoter {
  avatar: string | null;
  id: string;
  name: string;
  vote: "APPROVE" | "REJECT";
}

interface ProposalVotersProps {
  progress: number;
  score: string;
  voters: ProposalVoter[];
}

export function ProposalVoters({
  progress,
  score,
  voters,
}: ProposalVotersProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex pt-0.5">
          {voters.map((voter, index) => {
            const voteLabel =
              voter.vote === "APPROVE" ? "approved" : "rejected";

            return (
              <Tooltip key={voter.id}>
                <TooltipTrigger asChild>
                  <Avatar
                    src={voter.avatar}
                    name={voter.name}
                    tabIndex={0}
                    aria-label={`${voter.name} ${voteLabel}`}
                    className={cn(
                      "size-5 ring-2 transition-transform hover:z-10 hover:scale-110 focus-visible:z-10 focus-visible:outline-none focus-visible:ring-primary",
                      index > 0 && "-ml-1.5",
                      voter.vote === "APPROVE"
                        ? "ring-primary"
                        : "ring-slate-muted/60",
                    )}
                    fallbackClassName={cn(
                      "text-xs",
                      voter.vote === "APPROVE"
                        ? "text-primary"
                        : "text-slate-muted",
                    )}
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {voter.name} {voteLabel}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <span className="font-bold text-micro text-muted-foreground">
          {score}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full border border-border/10 bg-muted/30">
        <LazyMotion features={domAnimation}>
          <m.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-accent"
          />
        </LazyMotion>
      </div>
    </>
  );
}
