import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

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
    <AuthLoadingShell>
      <AuthFormSkeleton variant={variant} />
    </AuthLoadingShell>
  );
}

function AuthLoadingShell({
  children,
  layout = "form",
}: {
  children: ReactNode;
  layout?: "form" | "support";
}) {
  const isSupportLayout = layout === "support";
  const backLabel = isSupportLayout ? "Back to login" : "Back home";

  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-30 flex h-16 items-center px-4 lg:h-24 lg:px-10">
        <Link
          to={isSupportLayout ? "/auth/login" : "/"}
          aria-label={backLabel}
          className="pointer-events-auto inline-flex h-9 w-28 items-center rounded-full px-4"
        >
          <Skeleton className="h-3 w-full" />
        </Link>
      </div>

      <div className="relative hidden h-full flex-1 items-center justify-center overflow-hidden border-r bg-hero-bg lg:flex">
        <div className="relative flex size-72 items-center justify-center">
          <Skeleton shape="circle" className="absolute inset-8" tone="teal" />
          <Skeleton shape="circle" className="size-24" tone="teal" />
        </div>
      </div>

      <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-canvas">
        <BackgroundTexture />
        {isSupportLayout ? null : (
          <TopProgressBar
            progress={0}
            className="absolute top-0 right-0 left-0 z-50 w-full"
          />
        )}

        <div
          className={cn(
            "relative z-10 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth pb-4",
            isSupportLayout && "px-4",
          )}
        >
          <div
            className={cn(
              "flex min-h-full w-full flex-col items-center pt-20 pb-10 lg:py-8",
              isSupportLayout
                ? "justify-center"
                : "justify-start px-4 lg:justify-center",
            )}
          >
            <div
              className={cn(
                "w-full max-w-sm px-2",
                isSupportLayout ? "sm:px-0" : "sm:px-10 lg:p-0",
                !isSupportLayout && "relative",
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthFormSkeleton({ variant }: { variant: "login" | "register" }) {
  return (
    <div
      aria-label={`Loading ${variant}`}
      className="flex w-full flex-col"
      role="status"
    >
      <span className="sr-only">Loading {variant}</span>

      <div className="mb-8 flex flex-col items-center text-center">
        <Skeleton className="h-3 w-24" tone="teal" />
        <Skeleton className="mt-3 h-8 w-56 max-w-full" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </div>

      <div className="flex flex-col gap-4">
        <AuthInputSkeleton hasTrailingAction={variant === "login"} />
        {variant === "register" ? <AuthInputSkeleton /> : null}
        <AuthInputSkeleton hasInlineAction={variant === "login"} />
        {variant === "register" ? <AuthInputSkeleton hasInlineAction /> : null}
        <SkeletonButton className="mt-2 h-12 w-full" tone="teal" />
        <div className="flex items-center gap-3 py-1">
          <Skeleton className="h-px flex-1" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-px flex-1" />
        </div>
        <SkeletonButton className="h-12 w-full" />
      </div>

      <Skeleton className="mx-auto mt-7 h-4 w-48" />
    </div>
  );
}

function AuthInputSkeleton({
  hasInlineAction = false,
  hasTrailingAction = false,
}: {
  hasInlineAction?: boolean;
  hasTrailingAction?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-3 w-20" />
        {hasInlineAction ? <Skeleton className="h-3 w-28" tone="teal" /> : null}
      </div>
      <div className="flex h-12 items-center gap-2 rounded-xl border border-border bg-background px-3">
        <Skeleton className="h-4 min-w-0 flex-1" />
        {hasTrailingAction ? (
          <Skeleton shape="square" className="size-8 shrink-0" />
        ) : null}
      </div>
    </div>
  );
}

function SupportLoadingFixture({
  kind,
}: {
  kind: "activate" | "forgot-password" | "reset-password";
}) {
  return (
    <AuthLoadingShell layout="support">
      <div
        className="flex flex-col items-center gap-2 text-center"
        aria-hidden="true"
      >
        <Skeleton className="h-8 w-60 max-w-full" tone="teal" />
        <SkeletonText
          className="w-full"
          lines={2}
          size="sm"
          widths={["mx-auto w-full", "mx-auto w-4/5"]}
        />
      </div>

      <div
        aria-busy="true"
        aria-label={`Loading ${kind}`}
        className="mt-6 flex flex-col gap-4"
        role="status"
      >
        <span className="sr-only">Loading {kind}</span>
        {kind === "activate" ? (
          <div className="flex min-h-64 flex-col justify-center gap-4 rounded-xl border border-border bg-background px-4 py-6 text-center">
            <Skeleton shape="circle" className="mx-auto size-12" tone="teal" />
            <SkeletonText lines={2} widths={["w-full", "w-3/4"]} />
          </div>
        ) : (
          <>
            <AuthInputSkeleton hasTrailingAction={kind === "reset-password"} />
            {kind === "reset-password" ? (
              <AuthInputSkeleton hasTrailingAction />
            ) : null}
            <SkeletonButton className="h-12 w-full" tone="teal" />
          </>
        )}
      </div>
    </AuthLoadingShell>
  );
}
