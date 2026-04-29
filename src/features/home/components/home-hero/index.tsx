import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Bell, Compass, MessageCircle, Plus, User } from "lucide-react";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useUiStore } from "@/shared/store/ui.store";
import { useHomeViewer } from "../../hooks/use-home-viewer";
import { ForgeOrbScene } from "./forge-orb-scene";

/* ─── Greeting helper ──────────────────────────────────────────────── */
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
  { label: "Browse Groups", icon: Compass, to: "/explore" },
  { label: "Start a Chat", icon: MessageCircle, to: "/activity" },
  { label: "View Profile", icon: User, to: "/profile" },
] as const;

/* ─── Animation variants ───────────────────────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};

/**
 * HomeHero section with personalized greeting, CTA, and animated Forge Orb.
 */
export function HomeHero() {
  const { firstName } = useHomeViewer();
  const { count: unreadNotifications } = useNotifications();
  const { greeting, sub } = getGreeting(firstName);
  const reduced = useReducedMotion() ?? false;
  const setNotificationsOpen = useUiStore(
    (state) => state.setNotificationsOpen,
  );

  return (
    <section aria-labelledby="home-hero-heading" className="w-full">
      <motion.div
        className="flex flex-col gap-8 md:gap-10 max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Top section: Full-width greeting ─────────────────────── */}
        <motion.div
          variants={itemVariants}
          className="flex items-start justify-between gap-3 w-full"
        >
          <div className="flex flex-col gap-0.5 flex-1 min-w-0">
            <h1
              id="home-hero-heading"
              className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter text-foreground leading-tight"
            >
              {greeting}
            </h1>
            <p className="text-sm md:text-base text-slate-muted font-medium leading-relaxed">
              {sub}
            </p>
          </div>

          {/* Notification bell */}
          <button
            type="button"
            onClick={() => setNotificationsOpen(true)}
            aria-label={
              unreadNotifications > 0
                ? `View notifications (${unreadNotifications} unread)`
                : "View notifications"
            }
            className={cn(
              "relative shrink-0 flex items-center justify-center size-10 rounded-2xl",
              "border border-border bg-card",
              "text-slate-muted hover:text-foreground hover:border-forge-teal/30 hover:bg-secondary",
              "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "mt-0.5",
            )}
          >
            <Bell className="size-[18px]" aria-hidden="true" />
            {unreadNotifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 20,
                  delay: 0.4,
                }}
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-accent border-2 border-background text-[10px] font-bold text-accent-foreground shadow-sm"
                aria-hidden="true"
              >
                {unreadNotifications}
              </motion.span>
            )}
          </button>
        </motion.div>

        {/* ── Bottom section: CTA + Orb split ──────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
          {/* Left: CTA + Actions */}
          <div className="flex flex-col gap-6 flex-1 min-w-0">
            <motion.div
              variants={itemVariants}
              className="relative overflow-hidden rounded-2xl bg-card border border-border/60 p-5 md:p-6 lg:p-8 group/cta max-w-md shadow-sm"
            >
              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <h2 className="text-xl md:text-2xl font-black tracking-tighter leading-tight text-foreground text-balance">
                    Ready to meet your{" "}
                    <span className="text-forge-teal">perfect group?</span>
                  </h2>
                  <p className="text-xs text-slate-muted font-medium leading-relaxed">
                    Take the lead. We'll introduce you to compatible people who
                    share your interests and energy.
                  </p>
                </div>

                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/forge" className="w-full">
                    <Button
                      variant="primary"
                      className="w-full h-11 group/btn"
                      aria-label="Forge a new group with the TeamForge algorithm"
                    >
                      <Plus
                        className="size-4 transition-transform duration-200 group-hover/btn:rotate-90"
                        aria-hidden="true"
                      />
                      Forge My Group
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Quick action pills */}
            <motion.nav
              variants={itemVariants}
              aria-label="Quick actions"
              className="flex flex-wrap gap-2"
            >
              {QUICK_ACTIONS.map(({ label, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full",
                    "text-xs font-semibold text-slate-muted",
                    "border border-border bg-card",
                    "hover:border-forge-teal/40 hover:text-forge-teal hover:bg-secondary",
                    "transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-2xs",
                  )}
                >
                  <Icon className="size-3.5" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </motion.nav>
          </div>

          {/* Right: Orb Scene */}
          <motion.div
            variants={itemVariants}
            className="hidden md:flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <ForgeOrbScene firstName={firstName} reduced={reduced} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
