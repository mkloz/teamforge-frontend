import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import { ForgeOrbEyebrow, ForgeOrbPanel } from "./forge-orb-panel";

export function GroupCard() {
  const members = [
    { avatar: "/avatars/avatar-3.jpg" },
    { avatar: "/avatars/avatar-5.jpg" },
    { avatar: "/avatars/avatar-8.jpg" },
    { avatar: "/avatars/avatar-12.jpg" },
  ];
  const memberStackOrder = ["z-40", "z-30", "z-20", "z-10"];

  return (
    <ForgeOrbPanel
      initial={{ y: 0, rotate: 0 }}
      animate={{ y: [-8, 0], rotate: [1, 0] }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      className="w-45"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <ForgeOrbEyebrow>Your Group</ForgeOrbEyebrow>
        <span className="rounded-full border border-spark-amber/20 bg-spark-amber/10 px-2 py-0.5 font-bold font-sans text-nano text-spark-amber">
          94% match
        </span>
      </div>
      <div className="mb-3 flex">
        {members.map((m, index) => (
          <Avatar
            key={m.avatar}
            src={m.avatar}
            name="Member"
            className={cn(
              "flex size-8 items-center justify-center overflow-hidden rounded-full bg-forge-deep-surface ring-2 ring-hero-bg",
              index > 0 && "-ml-2",
              memberStackOrder[index],
            )}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {["Hiking", "Tech", "Coffee"].map((tag) => (
          <span
            key={tag}
            className="rounded bg-white/5 px-1.5 py-0.5 font-medium font-sans text-nano text-text-dark-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </ForgeOrbPanel>
  );
}
