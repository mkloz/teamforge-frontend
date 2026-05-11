import { zodResolver } from "@hookform/resolvers/zod";
import type { FormEventHandler } from "react";
import { useForm } from "react-hook-form";
import { AuthPageContent } from "@/features/auth/auth-page-content";
import { ActivateAccountStatus } from "@/features/auth/components/activate-account-status";
import { AuthSupportShell } from "@/features/auth/components/auth-support-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { LoginForm } from "@/features/auth/components/login-form";
import { RegisterForm } from "@/features/auth/components/register-form";
import { ResetPasswordForm } from "@/features/auth/components/reset-password";
import {
  type ForgotPasswordValues,
  forgotPasswordSchema,
  type ResetPasswordValues,
  resetPasswordSchema,
} from "@/features/auth/schemas/auth-schemas";
import {
  GeneratedPageLoading,
  type PageLoadingProps,
} from "@/shared/components/loading/page-loading";

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
  const fixture = <AuthPageLoadingFixture variant={variant} />;

  return (
    <GeneratedPageLoading name={AUTH_LOADING_NAMES[variant]} fixture={fixture}>
      {fixture}
    </GeneratedPageLoading>
  );
}

export function AuthPageLoadingFixture({
  variant,
}: Pick<AuthPageLoadingProps, "variant">) {
  if (variant === "forgot-password") {
    return <ForgotPasswordLoadingFixture />;
  }

  if (variant === "reset-password") {
    return <ResetPasswordLoadingFixture />;
  }

  if (variant === "activate") {
    return <ActivateLoadingFixture />;
  }

  return (
    <AuthPageContent progress={variant === "register" ? 0.32 : 0.18}>
      {variant === "register" ? (
        <RegisterForm onSwitchToLogin={noop} />
      ) : (
        <LoginForm onSwitchToRegister={noop} />
      )}
    </AuthPageContent>
  );
}

function ForgotPasswordLoadingFixture() {
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  return (
    <AuthSupportShell
      title="Reset your password"
      description="Enter your email and we'll send you a secure link to choose a new password."
      backNavigation={{ to: "/auth/login" }}
      backLabel="Back to login"
      footer={
        <p className="text-center text-slate-muted text-sm">
          Need a fresh start instead?{" "}
          <span className="font-medium text-forge-teal">Create an account</span>
          .
        </p>
      }
    >
      <ForgotPasswordForm
        form={form}
        loading={false}
        onSubmit={preventFixtureSubmit}
      />
    </AuthSupportShell>
  );
}

function ResetPasswordLoadingFixture() {
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
  });

  return (
    <AuthSupportShell
      title="Choose a new password"
      description="This password will replace the old one for your TeamForge account."
      backNavigation={{ to: "/auth/login" }}
      backLabel="Back to login"
    >
      <ResetPasswordForm
        form={form}
        loading={false}
        onSubmit={preventFixtureSubmit}
      />
    </AuthSupportShell>
  );
}

function ActivateLoadingFixture() {
  return (
    <AuthSupportShell
      title="Activating your account"
      description="We're checking your verification link and signing you in securely."
      backNavigation={{ to: "/auth/login" }}
      backLabel="Back to login"
    >
      <ActivateAccountStatus errorMessage={null} state="loading" />
    </AuthSupportShell>
  );
}

const noop = () => {};

const preventFixtureSubmit: FormEventHandler<HTMLFormElement> = (event) => {
  event.preventDefault();
};
