import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { memo } from "react";

interface ProposalVotersProps {
  voters: { id: string; fullName: string; avatar: string; type: string }[];
  score: string;
  progress: number;
}

export const ProposalVoters = memo(
  ({ voters, score, progress }: ProposalVotersProps) => (
    <>
      <div className="flex items-center justify-between">
        <div className="flex -space-x-1.5 pt-0.5">
          {voters.map((voter) => (
            <img
              key={voter.id}
              src={voter.avatar}
              className={cn(
                "w-5 h-5 rounded-full ring-2 object-cover transition-transform hover:scale-110 hover:z-10",
                voter.type === "approve"
                  ? "ring-forge-teal"
                  : "ring-destructive",
              )}
              title={`${voter.fullName} (${voter.type})`}
              alt={voter.fullName}
            />
          ))}
        </div>
        <span className="text-micro font-black tracking-widest text-slate-muted uppercase">
          {score} Votes
        </span>
      </div>
      <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-border/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-spark-amber shadow-[0_0_10px_rgba(245,158,11,0.5)]"
        />
      </div>
    </>
  ),
);
