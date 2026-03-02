import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { TeamForgeLogo } from "@/assets/logo";

interface LoginFormProps {
  onFocusChange: (focused: boolean) => void;
  onSubmitStart: () => void;
  onSwitchToRegister: () => void;
}

export function LoginForm({
  onFocusChange,
  onSubmitStart,
  onSwitchToRegister,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});

  function validate() {
    const next: typeof errors = {};
    if (!email) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6) next.password = "Password must be at least 6 characters.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length > 0) { setErrors(v); return; }
    setErrors({});
    setLoading(true);
    onSubmitStart();
    // Placeholder — replace with real auth call
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
  }

  const inputBase =
    "w-full h-11 px-3.5 rounded-xl border font-sans text-sm text-ink placeholder:text-slate-muted bg-white outline-none transition-all duration-200";
  const inputNormal = "border-[#E5E7EB] focus:border-forge-teal focus:ring-2 focus:ring-[rgba(13,148,136,0.12)]";
  const inputError = "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100";

  return (
    <div
      className="flex flex-col w-full"
      style={{ animation: "auth-form-in 0.5s ease-out forwards" }}
    >
      {/* Logo + title */}
      <div className="flex flex-col items-center mb-8">
        <TeamForgeLogo className="w-9 h-9 mb-3" showBackground={true} />
        <h1 className="font-sans text-2xl font-extrabold text-ink leading-tight text-balance text-center">
          Welcome back.
        </h1>
        <p className="font-sans text-sm text-slate-muted mt-1 text-center">
          Sign in to your TeamForge account.
        </p>
      </div>

      {/* Form-level error */}
      {errors.form && (
        <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50">
          <span className="text-red-500 text-xs font-medium">{errors.form}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-email" className="font-sans text-xs font-semibold text-ink">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => onFocusChange(true)}
            onBlur={() => {
              onFocusChange(false);
              if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                setErrors((p) => ({ ...p, email: "Enter a valid email address." }));
              else setErrors((p) => ({ ...p, email: undefined }));
            }}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            aria-invalid={!!errors.email}
            className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
          />
          {errors.email && (
            <p id="login-email-error" className="text-xs font-medium text-red-500 mt-0.5">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="login-password" className="font-sans text-xs font-semibold text-ink">
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => onFocusChange(true)}
              onBlur={() => {
                onFocusChange(false);
                if (password && password.length < 6)
                  setErrors((p) => ({ ...p, password: "Password must be at least 6 characters." }));
                else setErrors((p) => ({ ...p, password: undefined }));
              }}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              aria-invalid={!!errors.password}
              className={`${inputBase} pr-10 ${errors.password ? inputError : inputNormal}`}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-muted hover:text-forge-teal transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" className="text-xs font-medium text-red-500 mt-0.5">
              {errors.password}
            </p>
          )}
        </div>

        {/* Forgot password */}
        <div className="flex justify-end -mt-2">
          <a
            href="/auth/forgot-password"
            className="font-sans text-xs font-medium text-forge-teal hover:underline"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl font-sans text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100"
          style={{
            background: "#0D9488",
            boxShadow: loading ? "none" : "0 4px 14px rgba(13,148,136,0.28)",
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            "Sign In"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-[#E5E7EB]" />
          <span className="font-sans text-xs text-slate-muted">or continue with</span>
          <div className="flex-1 h-px bg-[#E5E7EB]" />
        </div>

        {/* Google OAuth */}
        <button
          type="button"
          className="w-full h-11 rounded-xl border border-[#E5E7EB] bg-white font-sans text-sm font-semibold text-ink flex items-center justify-center gap-2.5 hover:border-slate-muted transition-colors"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>

      {/* Switch to register */}
      <p className="font-sans text-sm text-slate-muted text-center mt-6">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-forge-teal hover:underline"
        >
          Sign up
        </button>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
