import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  Compass,
  MessageCircle,
  Plus,
  Sparkles,
  User,
} from "lucide-react";
import { MOCK_CURRENT_USER } from "../data/mock-home";

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
  { label: "Browse Groups", icon: Compass, href: "/explore" },
  { label: "Start a Chat", icon: MessageCircle, href: "/chat" },
  { label: "View Profile", icon: User, href: "/profile" },
];

/* ─── Animation variants ───────────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
  },
};

/* ─── Forge Orb Scene ──────────────────────────────────────────────── */

/**
 * Avatar seeds → deterministic initials & hue for floating member bubbles.
 * We derive a colour from the seed string so avatars are visually distinct
 * without any external image dependency.
 */
const ORBIT_MEMBERS = [
  { seed: "alex", initials: "AK", angle: 0, radius: 92, delay: 0 },
  { seed: "sam", initials: "SL", angle: 65, radius: 88, delay: 0.15 },
  { seed: "jordan", initials: "JR", angle: 130, radius: 94, delay: 0.3 },
  { seed: "riley", initials: "RM", angle: 195, radius: 90, delay: 0.45 },
  { seed: "casey", initials: "CK", angle: 260, radius: 88, delay: 0.6 },
  { seed: "morgan", initials: "MV", angle: 320, radius: 92, delay: 0.75 },
];

/** Floating particle specs — rendered as small teal/amber dots */
const PARTICLES = [
  { x: "18%", y: "14%", size: 3, opacity: 0.55, delay: 0 },
  { x: "82%", y: "22%", size: 2, opacity: 0.4, delay: 0.4 },
  { x: "72%", y: "72%", size: 3.5, opacity: 0.5, delay: 0.8 },
  { x: "14%", y: "78%", size: 2.5, opacity: 0.45, delay: 0.2 },
  { x: "50%", y: "90%", size: 2, opacity: 0.35, delay: 1.0 },
  { x: "90%", y: "50%", size: 4, opacity: 0.3, delay: 0.6 },
  { x: "8%", y: "48%", size: 2, opacity: 0.4, delay: 1.2 },
  { x: "60%", y: "8%", size: 3, opacity: 0.35, delay: 0.9 },
];

/** Connection line specs between selected orbit members */
const CONNECTIONS = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 0 },
  { from: 0, to: 3 },
  { from: 1, to: 4 },
];

/** Convert polar coords to Cartesian for SVG lines */
function polar(cx: number, cy: number, angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function ForgeOrbScene({ reduced }: { reduced: boolean }) {
  const CX = 130;
  const CY = 130;
  const SIZE = 260;

  return (
    <div
      className="relative select-none"
      style={{ width: SIZE, height: SIZE }}
      aria-hidden="true"
    >
      {/* SVG layer: rings + connection lines */}
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="absolute inset-0"
        style={{ overflow: "visible" }}
      >
        {/* Outer ambient ring */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={118}
          fill="none"
          stroke="rgba(13,148,136,0.08)"
          strokeWidth={1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        {/* Mid ring */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={92}
          fill="none"
          stroke="rgba(13,148,136,0.12)"
          strokeWidth={1}
          strokeDasharray="4 6"
          initial={{ opacity: 0, rotate: 0 }}
          animate={
            reduced
              ? { opacity: 1 }
              : {
                  opacity: 1,
                  rotate: 360,
                  transition: {
                    rotate: {
                      duration: 40,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    opacity: { duration: 0.6 },
                  },
                }
          }
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
        {/* Inner ring */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={52}
          fill="none"
          stroke="rgba(13,148,136,0.18)"
          strokeWidth={1.5}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />

        {/* Connection lines between orbit members */}
        {CONNECTIONS.map(({ from, to }, i) => {
          const a = polar(
            CX,
            CY,
            ORBIT_MEMBERS[from].angle,
            ORBIT_MEMBERS[from].radius,
          );
          const b = polar(
            CX,
            CY,
            ORBIT_MEMBERS[to].angle,
            ORBIT_MEMBERS[to].radius,
          );
          return (
            <motion.line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="rgba(13,148,136,0.18)"
              strokeWidth={0.75}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.9,
                delay: 0.5 + i * 0.07,
                ease: "easeOut",
              }}
            />
          );
        })}
      </svg>

      {/* Ambient soft glow behind the core */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 100,
          height: 100,
          top: CY - 50,
          left: CX - 50,
          background:
            "radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 70%)",
          filter: "blur(12px)",
        }}
      />

      {/* ── Core orb ─────────────────────────────────────────────── */}
      <motion.div
        className="absolute flex items-center justify-center rounded-full bg-ink border border-forge-teal/30"
        style={{
          width: 64,
          height: 64,
          top: CY - 32,
          left: CX - 32,
          boxShadow:
            "0 0 0 1px rgba(13,148,136,0.15), 0 0 28px rgba(13,148,136,0.3)",
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
      >
        {/* Inner pulsing ring */}
        {!reduced && (
          <motion.div
            className="absolute inset-0 rounded-full border border-forge-teal/40"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <Sparkles className="size-7 text-forge-teal relative z-10" />
      </motion.div>

      {/* ── Orbiting member avatars ──────────────────────────────── */}
      {ORBIT_MEMBERS.map((member, i) => {
        const pos = polar(CX, CY, member.angle, member.radius);
        const hues = [168, 195, 150, 180, 160, 140];
        const hue = hues[i % hues.length];
        const isAmber = i === 0 || i === 3;

        return (
          <motion.div
            key={member.seed}
            className="absolute flex items-center justify-center rounded-full border-2 text-[10px] font-black leading-none"
            style={{
              width: 30,
              height: 30,
              top: pos.y - 15,
              left: pos.x - 15,
              background: isAmber
                ? "rgba(245,158,11,0.15)"
                : `hsla(${hue},60%,45%,0.15)`,
              borderColor: isAmber
                ? "rgba(245,158,11,0.5)"
                : `hsla(${hue},60%,55%,0.45)`,
              color: isAmber
                ? "rgba(245,158,11,0.9)"
                : `hsla(${hue},60%,65%,0.9)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={
              reduced
                ? { scale: 1, opacity: 1 }
                : {
                    scale: 1,
                    opacity: 1,
                    y: [0, i % 2 === 0 ? -4 : 4, 0],
                    transition: {
                      scale: {
                        duration: 0.5,
                        delay: member.delay + 0.4,
                        ease: [0.34, 1.56, 0.64, 1],
                      },
                      opacity: {
                        duration: 0.4,
                        delay: member.delay + 0.4,
                      },
                      y: {
                        duration: 3.5 + i * 0.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: member.delay,
                      },
                    },
                  }
            }
          >
            {member.initials}
          </motion.div>
        );
      })}

      {/* ── Floating particles ───────────────────────────────────── */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            top: p.y,
            left: p.x,
            background:
              i % 3 === 0
                ? `rgba(245,158,11,${p.opacity})`
                : `rgba(13,148,136,${p.opacity})`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={
            reduced
              ? { opacity: p.opacity, scale: 1 }
              : {
                  opacity: [0, p.opacity, p.opacity * 0.4, p.opacity],
                  scale: [0, 1, 0.7, 1],
                  y: [0, -6, 0],
                  transition: {
                    opacity: {
                      duration: 2.5,
                      repeat: Infinity,
                      delay: p.delay,
                      ease: "easeInOut",
                    },
                    scale: {
                      duration: 2.5,
                      repeat: Infinity,
                      delay: p.delay,
                      ease: "easeInOut",
                    },
                    y: {
                      duration: 4 + i * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: p.delay,
                    },
                  },
                }
          }
        />
      ))}

      {/* ── "Matching…" status chip at bottom ───────────────────── */}
      <motion.div
        className="absolute flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-forge-teal/25 bg-card/80 backdrop-blur-sm"
        style={{ bottom: -6, left: "50%", transform: "translateX(-50%)" }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        {/* Pulsing dot */}
        {!reduced && (
          <motion.div
            className="size-1.5 rounded-full bg-forge-teal"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        {reduced && <div className="size-1.5 rounded-full bg-forge-teal" />}
        <span className="text-[10px] font-bold text-forge-teal tracking-wide whitespace-nowrap">
          {ORBIT_MEMBERS.length} members matched
        </span>
      </motion.div>
    </div>
  );
}

/* ─── HomeHero ─────────────────────────────────────────────────────── */
export function HomeHero() {
  const { greeting, sub } = getGreeting(MOCK_CURRENT_USER.firstName);
  const reduced = useReducedMotion() ?? false;

  return (
    <section aria-labelledby="home-hero-heading" className="w-full">
      <motion.div
        className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Left column: greeting + CTA ─────────────────────────── */}
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
              <Bell className="size-[18px]" aria-hidden="true" />
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
            {/* Teal glow */}
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

        {/* ── Right column: Forge Orb Scene (desktop only) ────────── */}
        <motion.div
          variants={itemVariants}
          className="hidden md:flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <ForgeOrbScene reduced={reduced} />
        </motion.div>
      </motion.div>
    </section>
  );
}
