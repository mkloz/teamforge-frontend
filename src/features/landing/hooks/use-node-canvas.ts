import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseOpacity: number;
  pulseOffset: number;
  isAccent: boolean;
}

const TEAL = "13, 148, 136";
const AMBER = "245, 158, 11";
const NODE_COUNT = 64;
const CONNECTION_DIST = 160;
const SPEED = 0.15;

export function useNodeCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initNodes();
    };

    const initNodes = () => {
      nodesRef.current = Array.from({ length: NODE_COUNT }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        radius: Math.random() * 1.6 + 0.8,
        baseOpacity: Math.random() * 0.25 + 0.05,
        pulseOffset: Math.random() * Math.PI * 2,
        isAccent: i < 5,
      }));
    };

    const draw = (timestamp: number) => {
      timeRef.current = timestamp * 0.0004;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;

      // Update positions
      for (const node of nodes) {
        node.x += node.vx + Math.sin(t + node.pulseOffset) * 0.04;
        node.y += node.vy + Math.cos(t * 0.8 + node.pulseOffset) * 0.04;

        if (node.x < -20) node.x = w + 20;
        else if (node.x > w + 20) node.x = -20;
        if (node.y < -20) node.y = h + 20;
        else if (node.y > h + 20) node.y = -20;
      }

      // Draw connections with variable width
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;
          const maxDistSq = CONNECTION_DIST * CONNECTION_DIST;

          if (distSq < maxDistSq) {
            const proximity = 1 - Math.sqrt(distSq) / CONNECTION_DIST;
            const pulse =
              Math.sin(t * 1.2 + (nodes[i].pulseOffset + nodes[j].pulseOffset) * 0.5) *
                0.3 +
              0.7;
            const lineAlpha = proximity * proximity * 0.18 * pulse;
            const isAccentLine = nodes[i].isAccent || nodes[j].isAccent;
            const color = isAccentLine ? AMBER : TEAL;

            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${color}, ${lineAlpha})`;
            ctx.lineWidth = proximity * 1.2 + 0.3;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        const pulse = Math.sin(t * 1.6 + node.pulseOffset) * 0.4 + 0.6;
        const opacity = node.baseOpacity * pulse;
        const color = node.isAccent ? AMBER : TEAL;

        // Glow halo for accent nodes
        if (node.isAccent) {
          const grad = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, node.radius + 8,
          );
          grad.addColorStop(0, `rgba(${AMBER}, ${opacity * 0.25})`);
          grad.addColorStop(1, `rgba(${AMBER}, 0)`);
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${opacity})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [canvasRef]);
}
