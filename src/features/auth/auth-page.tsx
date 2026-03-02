import { useState } from "react";
import { LoginForm } from "./components/login-form";
import { RegisterForm } from "./components/register-form";

type AuthView = "login" | "register";

interface AuthPageProps {
  defaultView?: AuthView;
}

export function AuthPage({ defaultView = "login" }: AuthPageProps) {
  const [view, setView] = useState<AuthView>(defaultView);
  const [switching, setSwitching] = useState(false);

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
      className="min-h-screen w-full flex items-center justify-center px-4 py-12 relative"
      style={{ background: "#FAFAF8" }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5"
        style={{ background: "#0D9488" }}
        aria-hidden="true"
      />

      {/* Subtle background texture — two soft teal blobs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(13,148,136,0.06) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Form card */}
      <div
        className="relative w-full max-w-sm"
        style={{
          opacity: switching ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        {view === "login" ? (
          <LoginForm
            onSwitchToRegister={() => switchView("register")}
          />
        ) : (
          <RegisterForm
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
  );
}
