import { useState } from "react";
import { ConvergenceAnimation } from "./components/convergence-animation";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";

type AuthView = "login" | "register";

interface AuthPageProps {
  defaultView?: AuthView;
}

export function AuthPage({ defaultView = "login" }: AuthPageProps) {
  const [view, setView] = useState<AuthView>(defaultView);
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [switching, setSwitching] = useState(false);

  function handleFocusChange(f: boolean) {
    setFocused(f);
  }

  function handleSubmitStart() {
    setSubmitted(true);
    // Reset after animation completes
    setTimeout(() => setSubmitted(false), 2200);
  }

  function switchView(to: AuthView) {
    if (switching) return;
    setSwitching(true);
    setTimeout(() => {
      setView(to);
      setSwitching(false);
    }, 220);
  }

  return (
    <div
      className="min-h-screen w-full flex"
      style={{ background: "#FAFAF8" }}
    >
      {/* Left panel — Convergence Animation (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%] relative">
        <ConvergenceAnimation focused={focused} submitted={submitted} />
      </div>

      {/* Right panel — Form area */}
      <div
        className="flex-1 lg:w-1/2 xl:w-[45%] flex flex-col items-center justify-center px-6 py-12 min-h-screen relative"
        style={{ background: "#FAFAF8" }}
      >
        {/* Mobile-only top accent line */}
        <div
          className="lg:hidden absolute top-0 left-0 right-0 h-0.5"
          style={{ background: "#0D9488" }}
          aria-hidden="true"
        />

        {/* Mobile-only wordmark */}
        <div className="lg:hidden mb-8">
          <a
            href="/"
            className="flex items-center gap-2 font-sans text-base font-bold"
            aria-label="Back to TeamForge home"
          >
            <span className="text-slate-muted">Team</span>
            <span style={{ color: "#0D9488" }}>Forge</span>
          </a>
        </div>

        {/* Form card */}
        <div
          className="w-full max-w-sm"
          style={{
            opacity: switching ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {view === "login" ? (
            <LoginForm
              onFocusChange={handleFocusChange}
              onSubmitStart={handleSubmitStart}
              onSwitchToRegister={() => switchView("register")}
            />
          ) : (
            <RegisterForm
              onFocusChange={handleFocusChange}
              onSubmitStart={handleSubmitStart}
              onSwitchToLogin={() => switchView("login")}
            />
          )}
        </div>

        {/* Back to landing link */}
        <a
          href="/"
          className="absolute bottom-6 left-0 right-0 flex justify-center font-sans text-xs text-slate-muted hover:text-ink transition-colors"
        >
          Back to teamforge.app
        </a>
      </div>
    </div>
  );
}
