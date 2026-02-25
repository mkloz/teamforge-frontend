import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulseOffset: number;
  isAmber: boolean;
}

const TEAL = "13, 148, 136";
const AMBER = "245, 158, 11";
const NODE_COUNT = 52;
const CONNECTION_DIST = 175;
const SPEED = 0.18;

export function useNodeCanvas(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const animRef = useRef<number>(0);
  const nodesRef = useRef<Node[]>([]);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initNodes();
    };

    const initNodes = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      nodesRef.current = Array.from({ length: NODE_COUNT }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.22 + 0.06,
        pulseOffset: Math.random() * Math.PI * 2,
        isAmber: i < 4,
      }));
    };

    const draw = (timestamp: number) => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      timeRef.current = timestamp * 0.0005;

      ctx.clearRect(0, 0, w, h);

      const nodes = nodesRef.current;

      // Update positions with slight sinusoidal drift
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx + Math.sin(timeRef.current + node.pulseOffset) * 0.03;
        node.y += node.vy + Math.cos(timeRef.current + node.pulseOffset * 0.7) * 0.03;

        if (node.x < -10) node.x = w + 10;
        else if (node.x > w + 10) node.x = -10;
        if (node.y < -10) node.y = h + 10;
        else if (node.y > h + 10) node.y = -10;
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const t = 1 - dist / CONNECTION_DIST;
            const lineOpacity = t * t * 0.14;
            const color = nodes[i].isAmber || nodes[j].isAmber ? AMBER : TEAL;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${color}, ${lineOpacity})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      // Draw nodes with subtle pulse
      for (const node of nodes) {
        const pulse = Math.sin(timeRef.current * 1.5 + node.pulseOffset) * 0.5 + 0.5;
        const dynamicOpacity = node.opacity * (0.7 + pulse * 0.3);
        const color = node.isAmber ? AMBER : TEAL;

        // Soft glow halo for amber nodes
        if (node.isAmber) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${AMBER}, ${dynamicOpacity * 0.12})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${dynamicOpacity})`;
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
