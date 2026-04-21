import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import {
  Bell,
  Compass,
  MessageCircle,
  Plus,
  Sparkles,
  User,
} from "lucide-react";
import { MOCK_CURRENT_USER } from "../data/mock-home";

function getGreeting(firstName: string): { greeting: string; sub: string } {
  const hour = new Date().getHours();
  if (hour < 12)
    return {
      greeting: `Good morning, ${firstName}`,
      sub: "Here's what's happening in your world today.",
    };
  if (hour < 17)
    return {
      greeting: `Good afternoon, ${firstName}`,
      sub: "Ready to connect with your groups?",
    };
  return {
    greeting: `Good evening, ${firstName}`,
    sub: "See what your groups are up to tonight.",
  };
}

const QUICK_ACTIONS = [
  { label: "Browse Groups", icon: Compass, href: "/explore" },
  { label: "Start a Chat", icon: MessageCircle, href: "/chat" },
  { label: "View Profile", icon: User, href: "/profile" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};

export function HomeHero() {
  const { greeting, sub } = getGreeting(MOCK_CURRENT_USER.firstName);

  return (
    <section aria-labelledby="home-hero-heading" className="w-full">
      <motion.div
        className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left column: greeting + CTA */}
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          {/* Greeting row with notification bell */}
          <motion.div
            variants={itemVariants}
            className="flex items-start justify-between gap-3"
          >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <h1
                id="home-hero-heading"
                className="text-2xl md:text-3xl font-black tracking-tighter text-foreground leading-none"
              >
                {greeting}
              </h1>
              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                {sub}
              </p>
            </div>

            {/* Notification bell */}
            <button
              type="button"
              aria-label="View notifications (3 unread)"
              className={cn(
                "relative shrink-0 flex items-center justify-center size-10 rounded-2xl",
                "border border-border bg-card",
                "text-muted-foreground hover:text-foreground hover:border-forge-teal/30 hover:bg-secondary",
                "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "mt-0.5",
              )}
            >
              <Bell className="size-4.5" aria-hidden="true" />
              {/* Unread badge */}
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 20,
                  delay: 0.4,
                }}
                className="absolute -top-1 -right-1 flex items-center justify-center size-4 rounded-full bg-spark-amber border-2 border-background text-[9px] font-black text-white leading-none"
                aria-hidden="true"
              >
                3
              </motion.span>
            </button>
          </motion.div>

          {/* Primary CTA card */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden rounded-3xl bg-ink border-2 border-white/5 p-5 md:p-6 group/cta"
          >
            {/* Decorative teal glow */}
            <div
              className="absolute -top-16 -right-16 size-40 bg-forge-teal/25 blur-hero rounded-full pointer-events-none transition-opacity duration-500 opacity-60 group-hover/cta:opacity-90"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Sparkles
                    className="size-4 text-forge-teal shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-forge-teal">
                    TeamForge Algorithm
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black tracking-tighter leading-tight text-white text-balance">
                  Ready to meet your{" "}
                  <span className="text-forge-teal italic">perfect group?</span>
                </h2>
                <p className="text-xs text-white/60 font-medium leading-relaxed">
                  Take the lead. The algorithm matches compatible people based
                  on your personality vectors and shared interests.
                </p>
              </div>

              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="primary"
                  className="w-full max-w-xs h-11 group/btn"
                  aria-label="Forge a new group with the TeamForge algorithm"
                >
                  <Plus
                    className="size-4 transition-transform duration-200 group-hover/btn:rotate-90"
                    aria-hidden="true"
                  />
                  Forge My Group
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick action pills */}
          <motion.nav
            variants={itemVariants}
            aria-label="Quick actions"
            className="flex flex-wrap gap-2"
          >
            {QUICK_ACTIONS.map(({ label, icon: Icon, href }) => (
              <a
                key={label}
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full",
                  "text-xs font-semibold text-muted-foreground",
                  "border border-border bg-card",
                  "hover:border-forge-teal/40 hover:text-forge-teal hover:bg-secondary",
                  "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
              </a>
            ))}
          </motion.nav>
        </div>

        {/* Right column: decorative visual (desktop only) */}
        <motion.div
          variants={itemVariants}
          className="hidden md:flex items-center justify-center shrink-0 w-2/5 max-w-[260px]"
          aria-hidden="true"
        >
          {/* Concentric rings decoration */}
          <div className="relative flex items-center justify-center size-52">
            {/* Outermost ring */}
            <div className="absolute inset-0 rounded-full border border-forge-teal/10 animate-pulse" />
            {/* Middle ring */}
            <div className="absolute inset-6 rounded-full border border-forge-teal/20" />
            {/* Inner ring */}
            <div className="absolute inset-12 rounded-full border border-forge-teal/30" />
            {/* Core */}
            <div className="relative z-10 size-16 rounded-full bg-ink border-2 border-forge-teal/40 flex items-center justify-center shadow-teal-glow">
              <Sparkles className="size-7 text-forge-teal" />
            </div>
            {/* Orbiting dots */}
            {[0, 72, 144, 216, 288].map((deg, i) => (
              <div
                key={i}
                className="absolute size-2.5 rounded-full bg-forge-teal/60 border border-forge-teal"
                style={{
                  transform: `rotate(${deg}deg) translateX(80px)`,
                  transformOrigin: "center",
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
