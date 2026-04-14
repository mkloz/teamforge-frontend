import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";

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
        "rounded-2xl px-4 py-3.5 w-45",
        "bg-[#0a1212]/80 backdrop-blur-xl border border-forge-teal/20",
        "shadow-[0_12px_40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.04)]",
      )}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-forge-teal text-nano font-semibold font-sans uppercase tracking-[0.15em] opacity-90">
          Your Group
        </p>
        <span className="text-spark-amber text-nano font-bold font-sans bg-spark-amber/10 px-2 py-0.5 rounded-full border border-spark-amber/20">
          94% match
        </span>
      </div>
      <div className="flex -space-x-2 mb-3">
        {members.map((m, i) => (
          <div
            key={i}
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center ring-2 ring-hero-bg bg-[#111]"
            style={{ zIndex: members.length - i }}
          >
            <img
              src={m.avatar}
              alt="Member"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5">
        {["Hiking", "Tech", "Coffee"].map((tag) => (
          <span
            key={tag}
            className="text-nano font-medium font-sans text-text-dark-muted bg-white/5 px-1.5 py-0.5 rounded"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
