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
type AuthFormLoadingVariant = Extract<AuthLoadingVariant, "login" | "register">;
type AuthLoadingLayout = "form" | "support";
type SupportLoadingKind = "activate" | "forgot-password" | "reset-password";

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

const SUPPORT_LOADING_KIND_BY_VARIANT: Partial<
  Record<AuthLoadingVariant, SupportLoadingKind>
> = {
  activate: "activate",
  "forgot-password": "forgot-password",
  "reset-password": "reset-password",
};

const AUTH_LOADING_SHELL_LAYOUT = {
  form: {
    backLabel: "Back home",
    backTo: "/",
    contentClassName: "sm:px-10 lg:p-0",
    innerClassName: "justify-start px-4 lg:justify-center",
    scrollClassName: "",
    showProgress: true,
  },
  support: {
    backLabel: "Back to login",
    backTo: "/auth/login",
    contentClassName: "sm:px-0",
    innerClassName: "justify-center",
    scrollClassName: "px-4",
    showProgress: false,
  },
} satisfies Record<
  AuthLoadingLayout,
  {
    backLabel: string;
    backTo: "/" | "/auth/login";
    contentClassName: string;
    innerClassName: string;
    scrollClassName: string;
    showProgress: boolean;
  }
>;

export function AuthPageLoading({ variant }: AuthPageLoadingProps) {
  void AUTH_LOADING_NAMES[variant];
  return <AuthPageLoadingFixture variant={variant} />;
}

function AuthPageLoadingFixture({
  variant,
}: Pick<AuthPageLoadingProps, "variant">) {
  if (isAuthFormLoadingVariant(variant)) {
    return (
      <AuthLoadingShell>
        <AuthFormSkeleton variant={variant} />
      </AuthLoadingShell>
    );
  }

  const supportKind = SUPPORT_LOADING_KIND_BY_VARIANT[variant];

  return <SupportLoadingFixture kind={supportKind ?? "forgot-password"} />;
}

function isAuthFormLoadingVariant(
  variant: AuthLoadingVariant,
): variant is AuthFormLoadingVariant {
  return variant === "login" || variant === "register";
}

function AuthLoadingShell({
  children,
  layout = "form",
}: {
  children: ReactNode;
  layout?: "form" | "support";
}) {
  const shellLayout = AUTH_LOADING_SHELL_LAYOUT[layout];

  return (
    <div className="relative flex h-screen max-h-dvh w-full flex-col overflow-hidden lg:flex-row">
      <div className="pointer-events-none absolute top-0 right-0 left-0 z-30 flex h-16 items-center px-4 lg:h-24 lg:px-10">
        <Link
          to={shellLayout.backTo}
          aria-label={shellLayout.backLabel}
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
        {shellLayout.showProgress ? (
          <TopProgressBar
            progress={0}
            className="absolute top-0 right-0 left-0 z-50 w-full"
          />
        ) : null}

        <div
          className={cn(
            "relative z-10 flex-1 overflow-y-auto overflow-x-hidden scroll-smooth pb-4",
            shellLayout.scrollClassName,
          )}
        >
          <div
            className={cn(
              "flex min-h-full w-full flex-col items-center pt-20 pb-10 lg:py-8",
              shellLayout.innerClassName,
            )}
          >
            <div
              className={cn(
                "w-full max-w-sm px-2",
                shellLayout.contentClassName,
                layout === "form" && "relative",
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

function AuthFormSkeleton({ variant }: { variant: AuthFormLoadingVariant }) {
  return (
    <div aria-busy="true" className="flex w-full flex-col">
      <output className="sr-only">Loading {variant}</output>

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

function SupportLoadingFixture({ kind }: { kind: SupportLoadingKind }) {
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

      <div aria-busy="true" className="mt-6 flex flex-col gap-4">
        <output className="sr-only">Loading {kind}</output>
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
