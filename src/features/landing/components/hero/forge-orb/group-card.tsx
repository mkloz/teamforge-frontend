import { motion } from "framer-motion";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";

export function GroupCard() {
  const members = [
    { avatar: "/avatars/avatar-3.jpg" },
    { avatar: "/avatars/avatar-5.jpg" },
    { avatar: "/avatars/avatar-8.jpg" },
    { avatar: "/avatars/avatar-12.jpg" },
  ];

  return (
    <motion.div
      initial={{ y: 0, rotate: 0 }}
      animate={{ y: [-8, 0], rotate: [1, 0] }}
      transition={{
        duration: 3.5,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      }}
      className={cn(
        "w-45 rounded-xl px-4 py-3.5",
        "border border-forge-teal/20 bg-forge-deep-panel/80 backdrop-blur-xl",
        "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
      aria-hidden="true"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <p className="font-sans text-nano font-semibold tracking-[0.15em] text-forge-teal uppercase opacity-90">
          Your Group
        </p>
        <span className="rounded-full border border-spark-amber/20 bg-spark-amber/10 px-2 py-0.5 font-sans text-nano font-bold text-spark-amber">
          94% match
        </span>
      </div>
      <div className="mb-3 flex -space-x-2">
        {members.map((m) => (
          <Avatar
            key={m.avatar}
            src={m.avatar}
            name="Member"
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-forge-deep-surface ring-2 ring-hero-bg"
            style={{ zIndex: members.length - members.indexOf(m) }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {["Hiking", "Tech", "Coffee"].map((tag) => (
          <span
            key={tag}
            className="rounded bg-white/5 px-1.5 py-0.5 font-sans text-nano font-medium text-text-dark-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
