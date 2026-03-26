import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import { VoronoiCatalyst } from "./components/voronoi-catalyst";

type AuthView = "login" | "register";

interface AuthPageProps {
  defaultView?: AuthView;
}

export function AuthPage({ defaultView = "login" }: AuthPageProps) {
  const [view, setView] = useState<AuthView>(defaultView);
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const typingTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const handleInput = () => {
    setIsTyping(true);
    if (typingTimerRef.current !== null)
      window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden bg-canvas lg:bg-white">
      {/* Top Header Strip with Back Link */}
      <div className="absolute top-0 left-0 right-0 h-24 flex items-center px-6 lg:px-10 z-30 pointer-events-none">
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-2 font-sans text-sm font-medium transition-colors group lg:bg-white/5 lg:hover:bg-white/10 lg:backdrop-blur-md lg:border lg:border-white/10 lg:px-4 lg:py-2.5 lg:rounded-full text-slate-muted hover:text-ink lg:text-white/70 lg:hover:text-white lg:shadow-[0_4px_24px_rgba(0,0,0,0.1)]"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span>Back to teamforge.app</span>
        </Link>
      </div>

      {/* Left half screen animation space */}
      <div className="hidden lg:flex flex-1 relative bg-hero-bg border-r border-border items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={progress} isTyping={isTyping} />
      </div>

      {/* Right half (Form Space) */}
      <div
        className="flex-1 flex items-center justify-center px-4 py-2 relative bg-canvas h-full overflow-y-auto overflow-x-hidden"
        onInput={handleInput}
      >
        <div className="flex flex-col items-center justify-center w-full min-h-full py-16 lg:py-8">
          <BackgroundTexture />

          {/* Top accent line visible only on right side/mobile */}
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-forge-teal to-amber-400 opacity-80"
            aria-hidden="true"
          />

          {/* Form card container */}
          <div className="relative w-full max-w-105 bg-white lg:bg-transparent lg:shadow-none shadow-[0_8px_32px_rgba(0,0,0,0.04)] ring-1 ring-slate-900/5 lg:ring-0 rounded-[2rem] p-8 sm:p-10 lg:p-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{
                  opacity: 0,
                  x: view === "login" ? -15 : 15,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: view === "login" ? 15 : -15,
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {view === "login" ? (
                  <LoginForm
                    onSwitchToRegister={() => setView("register")}
                    onProgress={setProgress}
                    onSuccess={() => {
                      setProgress(1);
                      navigate({ to: "/onboarding/personality" });
                    }}
                  />
                ) : (
                  <RegisterForm
                    onSwitchToLogin={() => setView("login")}
                    onProgress={setProgress}
                    onSuccess={() => {
                      setProgress(1);
                      navigate({ to: "/onboarding/personality" });
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
