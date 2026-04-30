import { motion } from "framer-motion";
import { memo } from "react";

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

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "TF";
}

export const ProposalVoters = memo(function ProposalVoters({
  progress,
  score,
  voters,
}: ProposalVotersProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5 pt-0.5">
          {voters.map((voter) =>
            voter.avatar ? (
              <img
                key={voter.id}
                src={voter.avatar}
                className={cn(
                  "h-5 w-5 rounded-full object-cover ring-2 transition-transform hover:z-10 hover:scale-110",
                  voter.vote === "APPROVE"
                    ? "ring-forge-teal"
                    : "ring-destructive",
                )}
                title={`${voter.name} (${voter.vote.toLowerCase()})`}
                alt={voter.name}
              />
            ) : (
              <div
                key={voter.id}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[9px] font-bold ring-2 transition-transform hover:z-10 hover:scale-110",
                  voter.vote === "APPROVE"
                    ? "ring-forge-teal text-forge-teal"
                    : "ring-destructive text-destructive",
                )}
                title={`${voter.name} (${voter.vote.toLowerCase()})`}
              >
                {getInitials(voter.name)}
              </div>
            ),
          )}
        </div>
        <span className="text-micro font-black uppercase tracking-widest text-muted-foreground">
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
