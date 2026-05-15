import { useRouterState } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { type ReactNode, useEffect, useRef } from "react";
import {
  appShellEase,
  appShellMotionDelay,
  appShellMotionTiming,
} from "@/features/app-shell/lib/app-shell-motion";

interface AppRouteTransitionProps {
  children: ReactNode;
}

export function AppRouteTransition({ children }: AppRouteTransitionProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const shouldReduceMotion = useReducedMotion();
  const hasMountedRef = useRef(false);
  const isInitialContent = !hasMountedRef.current;
  const hasViewportFixedContent = pathname.startsWith("/activity");

  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  return (
    <motion.div
      key={pathname}
      initial={getInitialState({
        hasViewportFixedContent,
        isInitialContent,
        shouldReduceMotion,
      })}
      animate={getAnimateState({
        hasViewportFixedContent,
        isInitialContent,
        shouldReduceMotion,
      })}
      className="min-h-screen"
    >
      {children}
    </motion.div>
  );
}

function getInitialState({
  hasViewportFixedContent,
  isInitialContent,
  shouldReduceMotion,
}: {
  hasViewportFixedContent: boolean;
  isInitialContent: boolean;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion || hasViewportFixedContent) {
    return { opacity: 0 };
  }

  return {
    opacity: 0,
    x: isInitialContent ? 10 : 8,
  };
}

function getAnimateState({
  hasViewportFixedContent,
  isInitialContent,
  shouldReduceMotion,
}: {
  hasViewportFixedContent: boolean;
  isInitialContent: boolean;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return {
      opacity: 1,
      transition: { duration: appShellMotionTiming.reducedMotion },
    };
  }

  const transition = {
    delay: isInitialContent
      ? appShellMotionDelay.initialContentEnter
      : appShellMotionDelay.routeContentEnter,
    duration: isInitialContent
      ? appShellMotionTiming.initialContentEnter
      : appShellMotionTiming.routeContentEnter,
    ease: appShellEase.enter,
  };

  if (hasViewportFixedContent) {
    return {
      opacity: 1,
      transition,
    };
  }

  return {
    opacity: 1,
    x: 0,
    transition,
  };
}
