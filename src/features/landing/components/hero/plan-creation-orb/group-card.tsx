import { Avatar } from "@/shared/components/common/avatar";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import {
  GroupConvergenceVisualEyebrow,
  GroupConvergenceVisualPanel,
} from "./plan-creation-orb-panel";

export function GroupCard() {
  const members = [
    { avatar: "/avatars/avatar-3.jpg" },
    { avatar: "/avatars/avatar-5.jpg" },
    { avatar: "/avatars/avatar-8.jpg" },
    { avatar: "/avatars/avatar-12.jpg" },
  ];
  const memberStackOrder = ["z-40", "z-30", "z-20", "z-10"];

  return (
    <GroupConvergenceVisualPanel className="w-45 animate-plan-creation-card-float-b motion-reduce:animate-none">
      <div className="mb-2.5 flex items-center justify-between">
        <GroupConvergenceVisualEyebrow>
          Group proposal
        </GroupConvergenceVisualEyebrow>
        <StatusPill tone="amber" size="xs" className="font-sans text-xs">
          Review
        </StatusPill>
      </div>
      <div className="mb-3 flex">
        {members.map((m, index) => (
          <Avatar
            key={m.avatar}
            src={m.avatar}
            name="Member"
            className={cn(
              "flex size-8 items-center justify-center overflow-hidden rounded-full bg-hero-deep-surface ring-2 ring-hero-bg",
              index > 0 && "-ml-2",
              memberStackOrder[index],
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {["4 people", "Thursday", "You decide"].map((tag) => (
          <span
            key={tag}
            className="rounded bg-white/5 px-1.5 py-0.5 font-medium font-sans text-text-dark-muted text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </GroupConvergenceVisualPanel>
  );
}
