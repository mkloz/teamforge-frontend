import { motion } from "framer-motion";

/**
 * Avatar seeds → deterministic initials & hue for floating member bubbles.
 */
const ORBIT_MEMBERS = [
  { seed: "alex", initials: "AK", angle: 0, radius: 92, delay: 0 },
  { seed: "sam", initials: "SL", angle: 65, radius: 88, delay: 0.15 },
  { seed: "jordan", initials: "JR", angle: 130, radius: 94, delay: 0.3 },
  { seed: "riley", initials: "RM", angle: 195, radius: 90, delay: 0.45 },
  { seed: "casey", initials: "CK", angle: 260, radius: 88, delay: 0.6 },
  { seed: "morgan", initials: "MV", angle: 320, radius: 92, delay: 0.75 },
];

/** Floating particle specs */
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

interface ForgeOrbSceneProps {
  firstName: string;
  reduced: boolean;
}

/**
 * Animated SVG scene representing the "Forge" algorithm.
 * Features orbiting member avatars and connection lines.
 */
export function ForgeOrbScene({ firstName, reduced }: ForgeOrbSceneProps) {
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

      {/* ── Core orb (User Avatar) ───────────────────────────────── */}
      <motion.div
        className="absolute flex items-center justify-center rounded-full bg-card overflow-hidden z-20 ring-2 ring-forge-teal ring-offset-2 ring-offset-background shadow-sm"
        style={{
          width: 64,
          height: 64,
          top: CY - 32,
          left: CX - 32,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1], delay: 0.15 }}
      >
        <img
          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${firstName}`}
          alt="Your avatar"
          className="size-full object-cover"
        />
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
            className="absolute flex items-center justify-center rounded-full border-2 text-xs font-black leading-none"
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
                  opacity: [0, p.opacity, 0],
                  scale: [0, 1, 0],
                  y: [0, -8, 0],
                  transition: {
                    opacity: {
                      duration: 3 + (i % 3) * 0.5,
                      repeat: Infinity,
                      delay: p.delay,
                      ease: "easeInOut",
                    },
                    scale: {
                      duration: 3 + (i % 3) * 0.5,
                      repeat: Infinity,
                      delay: p.delay,
                      ease: "easeInOut",
                    },
                    y: {
                      duration: 4 + (i % 2),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: p.delay,
                    },
                  },
                }
          }
        />
      ))}
    </div>
  );
}
