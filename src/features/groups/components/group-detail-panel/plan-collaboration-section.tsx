import { useState } from "react";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ChevronDown,
  ChevronUp,
  Edit3,
  Clock,
  MapPin,
  FileText,
  Check,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { PlanProposal, PlanComment, MemberRole } from "../../types/groups.types";

interface PlanCollaborationSectionProps {
  proposals: PlanProposal[];
  comments: PlanComment[];
  userRole: MemberRole;
  totalMembers: number;
}

const fieldIcons: Record<string, React.ReactNode> = {
  title: <FileText size={14} />,
  description: <FileText size={14} />,
  dateTime: <Clock size={14} />,
  location: <MapPin size={14} />,
};

const fieldLabels: Record<string, string> = {
  title: "Title",
  description: "Description",
  dateTime: "Date & Time",
  location: "Location",
};

export function PlanCollaborationSection({
  proposals,
  comments,
  userRole,
  totalMembers,
}: PlanCollaborationSectionProps) {
  const [expandedSection, setExpandedSection] = useState<"proposals" | "comments" | null>(
    proposals.length > 0 ? "proposals" : null
  );

  const pendingProposals = proposals.filter((p) => p.status === "PENDING");
  const isAdmin = userRole === "ADMIN";

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Collaboration</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-primary gap-1"
        >
          <Plus size={14} />
          Propose Change
        </Button>
      </div>

      {/* Proposals accordion */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === "proposals" ? null : "proposals")
          }
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5",
            "hover:bg-muted/50 transition-colors",
          )}
        >
          <div className="flex items-center gap-2">
            <Edit3 size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">
              Proposals
              {pendingProposals.length > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-semibold">
                  {pendingProposals.length}
                </span>
              )}
            </span>
          </div>
          {expandedSection === "proposals" ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </button>

        {expandedSection === "proposals" && (
          <div className="border-t border-border">
            {pendingProposals.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                No pending proposals
              </p>
            ) : (
              <div className="divide-y divide-border">
                {pendingProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    totalMembers={totalMembers}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comments accordion */}
      <div className="rounded-xl border border-border overflow-hidden">
        <button
          onClick={() =>
            setExpandedSection(expandedSection === "comments" ? null : "comments")
          }
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5",
            "hover:bg-muted/50 transition-colors",
          )}
        >
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">
              Comments
              {comments.length > 0 && (
                <span className="ml-1.5 text-muted-foreground">
                  ({comments.length})
                </span>
              )}
            </span>
          </div>
          {expandedSection === "comments" ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </button>

        {expandedSection === "comments" && (
          <div className="border-t border-border">
            {comments.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-muted-foreground">No comments yet</p>
                <Button variant="ghost" size="sm" className="mt-2 text-xs">
                  <Plus size={14} className="mr-1" />
                  Add a comment
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {comments.map((comment) => (
                  <CommentCard key={comment.id} comment={comment} />
                ))}
                <div className="p-3">
                  <Button variant="ghost" size="sm" className="w-full text-xs">
                    <Plus size={14} className="mr-1" />
                    Add a comment
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function ProposalCard({
  proposal,
  totalMembers,
  isAdmin,
}: {
  proposal: PlanProposal;
  totalMembers: number;
  isAdmin: boolean;
}) {
  const approveCount = proposal.votes.approve.length;
  const rejectCount = proposal.votes.reject.length;
  const requiredVotes = Math.ceil(totalMembers / 2);
  const progress = (approveCount / requiredVotes) * 100;

  return (
    <div className="p-3 space-y-3">
      {/* Header with proposer */}
      <div className="flex items-center gap-2">
        <img
          src={proposal.proposedBy.avatar}
          alt={proposal.proposedBy.name}
          className="w-6 h-6 rounded-full object-cover"
        />
        <span className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{proposal.proposedBy.name}</span>
          {" proposed changing "}
          <span className="font-medium text-foreground">{fieldLabels[proposal.field]}</span>
        </span>
      </div>

      {/* Change visualization */}
      <div className="rounded-lg bg-muted/50 p-2.5 space-y-2">
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5 text-muted-foreground">
            {fieldIcons[proposal.field]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground line-through truncate">
              {proposal.currentValue}
            </p>
            <p className="text-sm font-medium text-foreground truncate">
              {proposal.proposedValue}
            </p>
          </div>
        </div>
      </div>

      {/* Voting progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {approveCount} of {requiredVotes} votes needed
          </span>
          <span className="text-muted-foreground">
            {rejectCount} opposed
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs gap-1.5 border-green-500/30 text-green-600 hover:bg-green-500/10"
        >
          <ThumbsUp size={14} />
          Approve
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-8 text-xs gap-1.5 border-red-500/30 text-red-600 hover:bg-red-500/10"
        >
          <ThumbsDown size={14} />
          Reject
        </Button>
        {isAdmin && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600"
              title="Admin approve"
            >
              <Check size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600"
              title="Admin reject"
            >
              <X size={16} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function CommentCard({ comment }: { comment: PlanComment }) {
  return (
    <div className="p-3">
      <div className="flex items-start gap-2.5">
        <img
          src={comment.author.avatar}
          alt={comment.author.name}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.author.name}
            </span>
            {comment.field && comment.field !== "general" && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                on {fieldLabels[comment.field]}
              </span>
            )}
            <span className="text-[10px] text-muted-foreground">
              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <p className="text-sm text-foreground mt-1 leading-relaxed">
            {comment.content}
          </p>

          {/* Reactions */}
          {comment.reactions && comment.reactions.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              {comment.reactions.map((reaction, i) => (
                <button
                  key={i}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted hover:bg-muted/80 text-xs"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-muted-foreground">{reaction.userIds.length}</span>
                </button>
              ))}
              <button className="inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-muted text-muted-foreground">
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
