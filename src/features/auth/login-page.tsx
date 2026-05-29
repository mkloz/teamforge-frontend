import { AuthPageShell } from "@/features/auth/auth-page-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { useAuthPageNavigation } from "@/features/auth/hooks/use-auth-page-navigation";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";

export function LoginPage() {
  const { navigate, navigateAfterAuth, progress, returnTo, setProgress } =
    useAuthPageNavigation();

  return (
    <AuthPageShell progress={progress} scrollDeps={["login"]}>
      <div className="w-full animate-auth-form-enter">
        <LoginForm
          authReturnTo={returnTo}
          onSwitchToRegister={() => {
            void navigate(buildAuthRouteNavigation("/auth/register", returnTo));
          }}
          onProgress={setProgress}
          onSuccess={navigateAfterAuth}
        />
      </div>
    </AuthPageShell>
  );
}
