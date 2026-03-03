import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";
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

  const handleInput = () => {
    setIsTyping(true);
    if (typingTimerRef.current !== null)
      window.clearTimeout(typingTimerRef.current);
    typingTimerRef.current = window.setTimeout(() => {
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden bg-[#FAFAF8] lg:bg-white">
      {/* Top Header Strip with Back Link */}
      <div className="absolute top-0 left-0 right-0 h-24 flex items-center px-6 lg:px-10 z-30 pointer-events-none">
        <a
          href="/"
          className="pointer-events-auto flex items-center gap-2 font-sans text-sm font-medium transition-all group lg:bg-white/5 lg:hover:bg-white/10 lg:backdrop-blur-md lg:border lg:border-white/10 lg:px-4 lg:py-2.5 lg:rounded-full text-slate-500 hover:text-ink lg:text-white/70 lg:hover:text-white lg:shadow-[0_4px_24px_rgba(0,0,0,0.1)]"
        >
          <ArrowLeft
            size={16}
            className="transition-transform group-hover:-translate-x-1"
          />
          <span>Back to teamforge.app</span>
        </a>
      </div>

      {/* Left half screen animation space */}
      <div className="hidden lg:flex flex-1 relative bg-[#090909] border-r border-[#E5E7EB] items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={progress} isTyping={isTyping} />
      </div>

      {/* Right half (Form Space) */}
      <div
        className="flex-1 flex items-center justify-center px-4 py-2 relative bg-[#FAFAF8] h-full overflow-y-auto overflow-x-hidden"
        onInput={handleInput}
      >
        <div className="flex flex-col items-center justify-center w-full min-h-full py-16 lg:py-8">
          {/* Subtle background texture/gradients */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            {/* Noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            <div
              className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-60 mix-blend-multiply blur-3xl lg:opacity-40 lg:blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-60 mix-blend-multiply blur-3xl lg:opacity-40 lg:blur-[100px]"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
              }}
            />
          </div>

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
                  filter: "blur(4px)",
                }}
                animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  x: view === "login" ? 15 : -15,
                  filter: "blur(4px)",
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {view === "login" ? (
                  <LoginForm
                    onSwitchToRegister={() => setView("register")}
                    onProgress={setProgress}
                    onSuccess={() => setProgress(1)}
                  />
                ) : (
                  <RegisterForm
                    onSwitchToLogin={() => setView("login")}
                    onProgress={setProgress}
                    onSuccess={() => setProgress(1)}
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
