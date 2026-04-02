import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { useScroll, useSpring } from "framer-motion";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  color?: string;
  vx?: number;
  vy?: number;
  lineOpacity?: number;
  lineDistance?: number;
}

interface Circle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace("#", "");
  const hexInt = parseInt(hex, 16);
  const red = (hexInt >> 16) & 255;
  const green = (hexInt >> 8) & 255;
  const blue = hexInt & 255;
  return [red, green, blue];
}

export const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 80,
  color = "#0D9488",
  vx = 0,
  vy = 0,
  lineOpacity = 0.28,
  lineDistance = 220,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;
  const animationFrameId = useRef<number | null>(null);
  const isVisible = useRef<boolean>(true);
  const lastTime = useRef<number>(0);

  // Caching RGBA base string to avoid GC pressure
  const rgbBase = useMemo(() => hexToRgb(color).join(","), [color]);

  // Framer Motion scroll tracking
  const { scrollYProgress } = useScroll();
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 15,
  });
  const scrollOffset = useRef<number>(0);

  useEffect(() => {
    return smoothScroll.on("change", (v) => {
      scrollOffset.current = v;
    });
  }, [smoothScroll]);

  const circleParams = useCallback((): Circle => {
    const x = Math.floor(Math.random() * canvasSize.current.w);
    const y = Math.floor(Math.random() * canvasSize.current.h);
    const size = Math.random() * 2.1 + 1.7;
    const targetAlpha = parseFloat((Math.random() * 0.4 + 0.1).toFixed(1));
    const dx = (Math.random() - 0.5) * 0.12;
    const dy = (Math.random() - 0.5) * 0.12;
    const magnetism = 0.1 + Math.random() * 2.8;
    return {
      x,
      y,
      translateX: 0,
      translateY: 0,
      size,
      alpha: 0,
      targetAlpha,
      dx,
      dy,
      magnetism,
    };
  }, []);

  const resizeCanvas = useCallback(() => {
    if (canvasContainerRef.current && canvasRef.current && context.current) {
      circles.current.length = 0;
      const w = canvasContainerRef.current.clientWidth;
      const h = canvasContainerRef.current.clientHeight;
      if (w === 0 || h === 0) return;

      canvasSize.current.w = w;
      canvasSize.current.h = h;
      canvasRef.current.width = w * dpr;
      canvasRef.current.height = h * dpr;
      canvasRef.current.style.width = `${w}px`;
      canvasRef.current.style.height = `${h}px`;
      context.current.scale(dpr, dpr);

      for (let i = 0; i < quantity; i++) {
        circles.current.push(circleParams());
      }
    }
  }, [quantity, dpr, circleParams]);

  const drawLines = useCallback(() => {
    if (!context.current || circles.current.length === 0) return;
    const ctx = context.current;
    const points = circles.current;
    const distSqLimit = lineDistance * lineDistance;

    for (let i = 0; i < points.length; i++) {
      const pi = points[i];
      // Skip lines for invisible particles
      if (pi.alpha < 0.05) continue;

      const xi = pi.x + pi.translateX;
      const yi = pi.y + pi.translateY;

      for (let j = i + 1; j < points.length; j++) {
        const pj = points[j];
        if (pj.alpha < 0.05) continue;

        const xj = pj.x + pj.translateX;
        const yj = pj.y + pj.translateY;

        const dx = xi - xj;
        const dy = yi - yj;
        const distSq = dx * dx + dy * dy;

        if (distSq < distSqLimit) {
          const distance = Math.sqrt(distSq);
          const alphaValue = (1 - distance / lineDistance) * lineOpacity;

          ctx.beginPath();
          ctx.lineWidth = 1.0;
          ctx.strokeStyle = `rgba(${rgbBase}, ${alphaValue.toFixed(2)})`;
          ctx.moveTo(xi, yi);
          ctx.lineTo(xj, yj);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
  }, [lineDistance, lineOpacity, rgbBase]);

  const updateParticles = useCallback(() => {
    if (!context.current || !isVisible.current) return;
    const ctx = context.current;
    ctx.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

    const scrollVal = scrollOffset.current;

    circles.current.forEach((particle) => {
      particle.x += particle.dx + vx;
      particle.y += particle.dy + vy;

      particle.translateY = scrollVal * 300 * (particle.magnetism / 5);
      particle.translateX =
        Math.sin(scrollVal * 8) * 12 * (particle.magnetism / 5);

      if (particle.alpha < particle.targetAlpha) {
        particle.alpha += 0.02;
      }

      const totalX = particle.x + particle.translateX;
      const totalY = particle.y + particle.translateY;

      if (totalX < -20) particle.x = canvasSize.current.w + 10;
      else if (totalX > canvasSize.current.w + 20) particle.x = -10;

      if (totalY < -30) particle.y = canvasSize.current.h + 20;
      else if (totalY > canvasSize.current.h + 30) particle.y = -20;

      ctx.beginPath();
      ctx.arc(totalX, totalY, particle.size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${rgbBase},${particle.alpha.toFixed(2)})`;
      ctx.fill();
    });

    drawLines();
  }, [vx, vy, rgbBase, drawLines]);

  const animate = useCallback(
    (time: number) => {
      const run = (currentTime: number) => {
        if (!isVisible.current) {
          animationFrameId.current = window.requestAnimationFrame(run);
          return;
        }

        if (currentTime - lastTime.current < 20) {
          animationFrameId.current = window.requestAnimationFrame(run);
          return;
        }

        lastTime.current = currentTime;
        updateParticles();
        animationFrameId.current = window.requestAnimationFrame(run);
      };
      run(time);
    },
    [updateParticles],
  );

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d", {
        alpha: true,
        desynchronized: true,
      });
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
      },
      { threshold: 0.05 },
    );

    if (canvasContainerRef.current) {
      observer.observe(canvasContainerRef.current);
    }

    resizeCanvas();
    animate(performance.now());

    window.addEventListener("resize", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      observer.disconnect();
      if (animationFrameId.current) {
        window.cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [resizeCanvas, animate]);

  return (
    <div
      className={cn(
        "absolute inset-0 h-full w-full pointer-events-none z-0",
        className,
      )}
      ref={canvasContainerRef}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
};
