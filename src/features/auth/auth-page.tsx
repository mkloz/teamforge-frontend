import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";

import { ensureCurrentUser } from "@/shared/api/current-user-query";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import { Button } from "@/shared/components/ui/button";
import {
  buildAuthRouteNavigation,
  buildPostAuthRedirectNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { VoronoiCatalyst } from "@/shared/components/visuals/voronoi-catalyst";
import type { VoronoiCatalystHandle } from "@/shared/lib/voronoi/voronoi-contract";

type AuthView = "login" | "register";

interface AuthPageProps {
  defaultView?: AuthView;
}

export function AuthPage({ defaultView = "login" }: AuthPageProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const catalystRef = useRef<VoronoiCatalystHandle>(null);
  const [authStep, setAuthStep] = useState<number>(1);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { returnTo } = useAuthReturnState();
  const view: AuthView = defaultView;

  useScrollToTop([view, authStep], scrollContainerRef);

  const handleInput = () => {
    catalystRef.current?.pulseTyping();
  };

  const navigateAfterAuth = async () => {
    setProgress(1);
    const user = await ensureCurrentUser();
    await navigate(buildPostAuthRedirectNavigation(user, returnTo));
  };

  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-30 flex h-16 items-center px-4 lg:h-24 lg:px-10">
        <Button
          variant="inverseGhost"
          asChild
          size="sm"
          className="pointer-events-auto h-9 rounded-full px-4"
        >
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft
              size={16}
              className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
            />
            <span className="text-xs font-medium">Back home</span>
          </Link>
        </Button>
      </div>

      <div className="relative hidden h-full flex-1 items-center justify-center overflow-hidden border-r border-border bg-hero-bg lg:flex">
        <VoronoiCatalyst ref={catalystRef} progress={progress} />
      </div>

      <div className="relative flex h-full flex-1 flex-col overflow-hidden">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="relative z-10 flex-1 overflow-x-hidden overflow-y-auto scroll-smooth px-4 pb-4"
          onInput={handleInput}
        >
          <TopProgressBar
            progress={progress}
            className="sticky top-0 z-50 -mx-4 -mt-2 w-[calc(100%+32px)]"
          />

          <div className="flex min-h-full w-full flex-col items-center justify-start pt-20 pb-10 lg:justify-center lg:py-8">
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
                      authReturnTo={returnTo}
                      onSwitchToRegister={() => {
                        setAuthStep(1);
                        void navigate(
                          buildAuthRouteNavigation("/auth/register", returnTo),
                        );
                      }}
                      onProgress={setProgress}
                      onSuccess={navigateAfterAuth}
                    />
                  ) : (
                    <RegisterForm
                      onSwitchToLogin={() => {
                        void navigate(
                          buildAuthRouteNavigation("/auth/login", returnTo),
                        );
                      }}
                      onProgress={setProgress}
                      onStepChange={setAuthStep}
                      onSuccess={navigateAfterAuth}
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
