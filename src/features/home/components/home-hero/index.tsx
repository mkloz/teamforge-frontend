import { homeQuickActions } from "@/features/app-shell/lib/app-navigation";
import { Button } from "@/shared/components/ui/button";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import {
  buildInterestsEditNavigation,
  buildPersonalityEditNavigation,
} from "@/features/onboarding/lib/onboarding-route";
import { buildSettingsNavigation } from "@/features/settings/lib/settings-route";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Bell, Plus } from "lucide-react";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { useNotificationsDrawerState } from "@/features/notifications/hooks/use-notifications-drawer-state";

import { ForgeOrbScene } from "./forge-orb-scene";
import { useHomeViewer } from "@/features/home/hooks/use-home-viewer";

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
  const { firstName, nextStep } = useHomeViewer();
  const { count: unreadNotifications } = useNotifications();
  const { greeting, sub } = getGreeting(firstName);
  const reduced = useReducedMotion() ?? false;
  const { openDrawer } = useNotificationsDrawerState();

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
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void openDrawer()}
            aria-label={
              unreadNotifications > 0
                ? `View notifications (${unreadNotifications} unread)`
                : "View notifications"
            }
            className={cn(
              "relative mt-0.5 size-10 shrink-0 rounded-2xl",
              "border border-border bg-card",
              "text-slate-muted hover:text-foreground hover:border-forge-teal/30 hover:bg-secondary",
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
          </Button>
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
                  <Link {...buildForgeLaunchNavigation()} className="w-full">
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

                {nextStep && (
                  <div className="rounded-2xl border border-border/70 bg-canvas/80 p-4">
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-muted">
                        Next up
                      </p>
                      <h3 className="text-sm font-semibold text-foreground">
                        {nextStep.title}
                      </h3>
                      <p className="text-xs text-slate-muted leading-relaxed">
                        {nextStep.body}
                      </p>
                    </div>

                    <div className="mt-4">
                      {nextStep.kind === "security" && (
                        <Button asChild variant="outline" size="sm">
                          <Link {...buildSettingsNavigation("security")}>
                            {nextStep.label}
                          </Link>
                        </Button>
                      )}

                      {nextStep.kind === "account" && (
                        <Button asChild variant="outline" size="sm">
                          <Link {...buildSettingsNavigation("account")}>
                            {nextStep.label}
                          </Link>
                        </Button>
                      )}

                      {nextStep.kind === "personality" && (
                        <Button asChild variant="outline" size="sm">
                          <Link
                            {...buildPersonalityEditNavigation({
                              returnTo: "/home",
                            })}
                          >
                            {nextStep.label}
                          </Link>
                        </Button>
                      )}

                      {nextStep.kind === "interests" && (
                        <Button asChild variant="outline" size="sm">
                          <Link
                            {...buildInterestsEditNavigation({
                              returnTo: "/home",
                            })}
                          >
                            {nextStep.label}
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick action pills */}
            <motion.nav
              variants={itemVariants}
              aria-label="Quick actions"
              className="flex flex-wrap gap-2"
            >
              {homeQuickActions.map(({ id, label, icon: Icon, navigation }) => (
                <Link
                  key={id}
                  {...navigation}
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
