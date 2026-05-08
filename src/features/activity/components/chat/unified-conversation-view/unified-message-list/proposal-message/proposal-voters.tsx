import { motion } from "framer-motion";
import { memo } from "react";

import { Avatar } from "@/shared/components/common/avatar";
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

export const ProposalVoters = memo(function ProposalVoters({
  progress,
  score,
  voters,
}: ProposalVotersProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex pt-0.5">
          {voters.map((voter, index) => (
            <Avatar
              key={voter.id}
              src={voter.avatar}
              name={voter.name}
              className={cn(
                "size-5 ring-2 transition-transform hover:z-10 hover:scale-110",
                index > 0 && "-ml-1.5",
                voter.vote === "APPROVE"
                  ? "ring-forge-teal"
                  : "ring-destructive",
              )}
              fallbackClassName={cn(
                "text-xs",
                voter.vote === "APPROVE"
                  ? "text-forge-teal"
                  : "text-destructive",
              )}
              title={`${voter.name} (${voter.vote.toLowerCase()})`}
            />
          ))}
        </div>
        <span className="font-black text-micro text-muted-foreground uppercase tracking-widest">
          {score}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full border border-border/10 bg-muted/30">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-spark-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]"
        />
      </div>
    </>
  );
});
