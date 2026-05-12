import { AuthPageContent } from "@/features/auth/auth-page-content";
import { AuthSupportShell } from "@/features/auth/components/auth-support-shell";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonCard,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";

type AuthLoadingVariant =
  | "activate"
  | "forgot-password"
  | "login"
  | "register"
  | "reset-password";

interface AuthPageLoadingProps extends PageLoadingProps {
  variant: AuthLoadingVariant;
}

const AUTH_LOADING_NAMES = {
  activate: "auth.activate-page",
  "forgot-password": "auth.forgot-password-page",
  login: "auth.login-page",
  register: "auth.register-page",
  "reset-password": "auth.reset-password-page",
} satisfies Record<AuthLoadingVariant, string>;

export function AuthPageLoading({ variant }: AuthPageLoadingProps) {
  void AUTH_LOADING_NAMES[variant];
  return <AuthPageLoadingFixture variant={variant} />;
}

export function AuthPageLoadingFixture({
  variant,
}: Pick<AuthPageLoadingProps, "variant">) {
  if (variant === "forgot-password") {
    return <SupportLoadingFixture kind="forgot-password" />;
  }

  if (variant === "reset-password") {
    return <SupportLoadingFixture kind="reset-password" />;
  }

  if (variant === "activate") {
    return <SupportLoadingFixture kind="activate" />;
  }

  return (
    <AuthPageContent progress={variant === "register" ? 0.32 : 0.18}>
      <AuthFormSkeleton variant={variant} />
    </AuthPageContent>
  );
}

function AuthFormSkeleton({ variant }: { variant: "login" | "register" }) {
  return (
    <SkeletonCard
      aria-label={`Loading ${variant}`}
      className="p-6 sm:p-8"
      role="status"
    >
      <span className="sr-only">Loading {variant}</span>
      <SkeletonText lines={3} widths={["w-20", "w-44", "w-full"]} />
      <div className="mt-6 flex flex-col gap-4">
        <Skeleton className="h-12 w-full" />
        {variant === "register" ? <Skeleton className="h-12 w-full" /> : null}
        <Skeleton className="h-12 w-full" />
        <SkeletonButton className="h-12 w-full" tone="teal" />
      </div>
      <Skeleton className="mx-auto mt-6 h-4 w-40" />
    </SkeletonCard>
  );
}

function SupportLoadingFixture({
  kind,
}: {
  kind: "activate" | "forgot-password" | "reset-password";
}) {
  const title =
    kind === "activate"
      ? "Activating your account"
      : kind === "forgot-password"
        ? "Reset your password"
        : "Choose a new password";
  const description =
    kind === "activate"
      ? "We're checking your verification link and signing you in securely."
      : kind === "forgot-password"
        ? "Enter your email and we'll send you a secure link to choose a new password."
        : "This password will replace the old one for your TeamForge account.";

  return (
    <AuthSupportShell
      title={title}
      description={description}
      backNavigation={{ to: "/auth/login" }}
      backLabel="Back to login"
    >
      <div
        aria-busy="true"
        aria-label={`Loading ${kind}`}
        className="flex flex-col gap-4"
        role="status"
      >
        <span className="sr-only">Loading {kind}</span>
        {kind === "activate" ? (
          <>
            <Skeleton shape="circle" className="mx-auto size-12" tone="teal" />
            <SkeletonText lines={2} widths={["w-full", "w-3/4"]} />
          </>
        ) : (
          <>
            <Skeleton className="h-12 w-full" />
            {kind === "reset-password" ? (
              <Skeleton className="h-12 w-full" />
            ) : null}
            <SkeletonButton className="h-12 w-full" tone="teal" />
          </>
        )}
      </div>
    </AuthSupportShell>
  );
}
