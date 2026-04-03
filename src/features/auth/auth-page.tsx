import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";
import { VoronoiCatalyst } from "./components/voronoi-catalyst";

type AuthView = "login" | "register";

interface AuthPageProps {
  defaultView?: AuthView;
}

export function AuthPage({ defaultView = "login" }: AuthPageProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<AuthView>(defaultView);
  const [authStep, setAuthStep] = useState<number>(1);
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const typingTimerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Auto-scroll on view change or step transition
  useScrollToTop([view, authStep], scrollContainerRef);

  const handleInput = () => {
    setIsTyping(true);
    if (typingTimerRef.current !== null)
      window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden">
      {/* Top Header Strip with Back Link */}
      <div className="absolute top-0 left-0 right-0 h-16 lg:h-24 flex items-center px-4 lg:px-10 z-30 pointer-events-none">
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-1.5 font-sans text-xs sm:text-sm font-medium transition-colors group lg:bg-white/5 lg:hover:bg-white/10 lg:backdrop-blur-md lg:border lg:border-white/10 lg:px-4 lg:py-2.5 lg:rounded-full text-slate-muted hover:text-ink lg:text-white/70 lg:hover:text-white lg:shadow-[0_4px_24px_rgba(0,0,0,0.1)] py-2 px-1"
        >
          <ArrowLeft
            size={14}
            className="transition-transform group-hover:-translate-x-1 sm:w-4 sm:h-4"
          />
          <span>Back to teamforge.app</span>
        </Link>
      </div>

      {/* Left half screen animation space */}
      <div className="hidden lg:flex flex-1 relative bg-hero-bg border-r border-border items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={progress} isTyping={isTyping} />
      </div>

      {/* Right half (Form Space) */}
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 scroll-smooth relative z-10"
          onInput={handleInput}
        >
          <TopProgressBar
            progress={progress}
            className="-mx-4 -mt-2 w-[calc(100%+32px)] sticky top-0 z-50"
          />

          <div className="flex flex-col items-center justify-start lg:justify-center w-full min-h-full pt-20 pb-10 lg:py-8">
            {/* Form container: focused desktop width */}
            <div className="relative w-full max-w-sm px-2 sm:px-10 lg:p-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                >
                  {view === "login" ? (
                    <LoginForm
                      onSwitchToRegister={() => {
                        setAuthStep(1);
                        setView("register");
                      }}
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
                      onStepChange={setAuthStep}
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
    </div>
  );
}
