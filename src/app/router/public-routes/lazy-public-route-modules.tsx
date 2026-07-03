import { createLazyRouteLoading } from "@/app/router/lazy-route-loading";
import { createLazyRouteModule } from "@/app/router/lazy-route-module";
import { AuthPageLoading } from "@/features/auth/auth-page.loading";

export const landingPageModule = createLazyRouteModule(() =>
  import("@/features/landing/landing-page").then((m) => ({
    default: m.LandingPage,
  })),
);

export const LandingRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/landing/landing-page.loading").then((m) => ({
      default: m.LandingPageLoading,
    })),
  { mode: "route" },
);

export const downloadPageModule = createLazyRouteModule(() =>
  import("@/features/download/download-page").then((m) => ({
    default: m.DownloadPage,
  })),
);

export const privacyPageModule = createLazyRouteModule(() =>
  import("@/features/legal/legal-page").then((m) => ({
    default: () => <m.LegalPage kind="privacy" />,
  })),
);

export const PrivacyRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/legal/legal-page.loading").then((m) => ({
      default: m.LegalPageLoading,
    })),
  { kind: "privacy", mode: "route" },
);

export const termsPageModule = createLazyRouteModule(() =>
  import("@/features/legal/legal-page").then((m) => ({
    default: () => <m.LegalPage kind="terms" />,
  })),
);

export const TermsRouteLoading = createLazyRouteLoading(
  () =>
    import("@/features/legal/legal-page.loading").then((m) => ({
      default: m.LegalPageLoading,
    })),
  { kind: "terms", mode: "route" },
);

export const loginPageModule = createLazyRouteModule(() =>
  import("@/features/auth/login-page").then((m) => ({
    default: m.LoginPage,
  })),
);

export function LoginRouteLoading() {
  return <AuthPageLoading mode="route" variant="login" />;
}

export const registerPageModule = createLazyRouteModule(() =>
  import("@/features/auth/register-page").then((m) => ({
    default: m.RegisterPage,
  })),
);

export function RegisterRouteLoading() {
  return <AuthPageLoading mode="route" variant="register" />;
}

export const forgotPasswordPageModule = createLazyRouteModule(() =>
  import("@/features/auth/forgot-password-page").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);

export function ForgotPasswordRouteLoading() {
  return <AuthPageLoading mode="route" variant="forgot-password" />;
}

export const resetPasswordPageModule = createLazyRouteModule(() =>
  import("@/features/auth/reset-password-page").then((m) => ({
    default: m.ResetPasswordPage,
  })),
);

export function ResetPasswordRouteLoading() {
  return <AuthPageLoading mode="route" variant="reset-password" />;
}

export const activateAccountPageModule = createLazyRouteModule(() =>
  import("@/features/auth/activate-account-page").then((m) => ({
    default: m.ActivateAccountPage,
  })),
);

export function ActivateAccountRouteLoading() {
  return <AuthPageLoading mode="route" variant="activate" />;
}
