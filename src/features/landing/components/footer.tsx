import { TeamForgeLogo } from "@/assets/logo";

export function Footer() {
  return (
    <footer className="dark border-white/5 border-t bg-hero-bg py-5">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
          <span className="flex items-center gap-1.5 font-sans text-sm">
            <TeamForgeLogo className="size-5" showBackground={false} />
            <span className="text-text-dark-secondary">Team</span>
            <span className="text-forge-teal">Forge</span>
          </span>
          <span className="hidden text-sm text-text-dark-muted sm:block">
            ·
          </span>
          <a
            href="/privacy"
            className="font-sans text-sm text-text-dark-muted transition-colors hover:text-text-dark-secondary"
          >
            Privacy
          </a>
          <span className="hidden text-sm text-text-dark-muted sm:block">
            ·
          </span>
          <a
            href="/terms"
            className="font-sans text-sm text-text-dark-muted transition-colors hover:text-text-dark-secondary"
          >
            Terms
          </a>
          <span className="hidden text-sm text-text-dark-muted sm:block">
            ·
          </span>
          <span className="font-sans text-sm text-text-dark-muted">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
