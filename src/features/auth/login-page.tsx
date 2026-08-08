import { AuthPageShell } from "@/features/auth/auth-page-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { useAuthPageNavigation } from "@/features/auth/hooks/use-auth-page-navigation";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { buildAuthRouteNavigation } from "@/shared/lib/auth-route";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import type { VoronoiFormationTarget } from "@/shared/lib/voronoi/voronoi-contract";

const LOGIN_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Sign In",
  description:
    "Sign in to your TeamForge account to access your groups, activities, and plans.",
});

const LOGIN_FORMATION = {
  kind: "text",
  value: "READY",
} as const satisfies VoronoiFormationTarget;

export function LoginPage() {
  usePageMetadata(LOGIN_PAGE_METADATA);

  const { navigate, navigateAfterAuth, progress, returnTo, setProgress } =
    useAuthPageNavigation();

  return (
    <AuthPageShell
      formation={LOGIN_FORMATION}
      progress={progress}
      scrollDeps={["login"]}
    >
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
