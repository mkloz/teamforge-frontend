import { useState } from "react";
import { AuthPageShell } from "@/features/auth/auth-page-shell";
import { RegisterForm } from "@/features/auth/components/register-form";
import { useAuthPageNavigation } from "@/features/auth/hooks/use-auth-page-navigation";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";

export function RegisterPage() {
  const [authStep, setAuthStep] = useState(1);
  const { navigate, navigateAfterAuth, progress, returnTo, setProgress } =
    useAuthPageNavigation();

  return (
    <AuthPageShell progress={progress} scrollDeps={["register", authStep]}>
      <div className="w-full animate-auth-form-enter">
        <RegisterForm
          onSwitchToLogin={() => {
            void navigate(buildAuthRouteNavigation("/auth/login", returnTo));
          }}
          onProgress={setProgress}
          onStepChange={setAuthStep}
          onSuccess={navigateAfterAuth}
        />
      </div>
    </AuthPageShell>
  );
}
