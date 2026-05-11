import { Sparkles, UserRoundCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { GroupPlanDetail } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { Avatar } from "@/shared/components/common/avatar";

interface MemberLineupSectionProps {
  detail: GroupPlanDetail;
}

export function MemberLineupSection({ detail }: MemberLineupSectionProps) {
  return (
    <section
      aria-labelledby="member-lineup-heading"
      className="border-border/70 border-b pb-8"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-black text-forge-teal text-xs uppercase tracking-widest">
            The people
          </p>
          <h2
            id="member-lineup-heading"
            className="mt-2 font-black text-2xl text-foreground tracking-tight"
          >
            Who is already in
          </h2>
        </div>
        <p className="font-bold text-muted-foreground text-sm">
          {detail.group.activeMembersCount}/{detail.group.maxMembers} places
        </p>
      </div>

      <div className="mt-6 grid gap-x-10 gap-y-5 md:grid-cols-2">
        {detail.members.map((member) => {
          const memberContext = getMemberContext(member);

          return (
            <article
              key={member.userId}
              className="avatar-body-grid-sm group grid min-w-0 gap-3"
            >
              <Avatar
                src={member.avatar}
                name={member.name}
                className="size-12 border border-border bg-card"
              />
              <div className="min-w-0">
                <div className="min-w-0">
                  <h3 className="truncate font-black text-foreground text-sm">
                    {member.name}
                  </h3>
                  <p className="mt-1 font-bold text-muted-foreground text-xs uppercase tracking-widest">
                    {member.role.toLowerCase()}
                  </p>
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {member.personalityType ? (
                    <SignalBadge
                      icon={
                        <Sparkles className="size-3.5" aria-hidden="true" />
                      }
                      text={member.personalityType}
                    />
                  ) : null}
                  {member.knownConnection ? (
                    <SignalBadge
                      icon={
                        <UserRoundCheck
                          className="size-3.5"
                          aria-hidden="true"
                        />
                      }
                      text={member.knownConnection}
                    />
                  ) : null}
                </div>
                {memberContext ? (
                  <p className="mt-2 font-medium text-muted-foreground text-xs leading-relaxed">
                    {memberContext}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getMemberContext(member: GroupPlanDetail["members"][number]) {
  if (member.knownConnection) {
    return "Already connected through your wider circle.";
  }

  if (member.role === "ADMIN") {
    return "Organising the group.";
  }

  if (member.trustScore >= 0.8) {
    return "Has shown up reliably for recent plans.";
  }

  return null;
}

function SignalBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1 rounded-full border border-border bg-card px-2 py-1 font-bold text-muted-foreground">
      {icon}
      <span className="truncate">{text}</span>
    </span>
  );
}
