import { GoogleOAuthProvider } from "@react-oauth/google";
import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { config } from "@/config/config";
import { AuthPageContent } from "@/features/auth/auth-page-content";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { ensureCurrentUser } from "@/shared/api/current-user-query";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";
import {
  buildAuthRouteNavigation,
  buildPostAuthRedirectNavigation,
  useAuthReturnState,
} from "@/shared/lib/auth-route";
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

  const content = (
    <AuthPageContent
      catalystRef={catalystRef}
      onInput={handleInput}
      progress={progress}
      scrollContainerRef={scrollContainerRef}
    >
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
    </AuthPageContent>
  );

  if (!config.googleClientId) {
    return content;
  }

  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      {content}
    </GoogleOAuthProvider>
  );
}
