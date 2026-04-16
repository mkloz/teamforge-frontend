import { TeamForgeLogo } from "../../../../assets/logo";

export function Footer() {
  return (
    <footer
      className="bg-hero-bg py-5 border-t border-white/5 dark"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1.5 font-sans text-sm">
            <TeamForgeLogo className="w-5 h-5" showBackground={false} />
            <span className="text-text-dark-secondary">Team</span>
            <span className="text-forge-teal">Forge</span>
          </span>
          <span className="hidden sm:block text-text-dark-muted text-sm">
            ·
          </span>
          <a
            href="/privacy"
            className="font-sans text-sm text-text-dark-muted hover:text-text-dark-secondary transition-colors"
          >
            Privacy
          </a>
          <span className="hidden sm:block text-text-dark-muted text-sm">
            ·
          </span>
          <a
            href="/terms"
            className="font-sans text-sm text-text-dark-muted hover:text-text-dark-secondary transition-colors"
          >
            Terms
          </a>
          <span className="hidden sm:block text-text-dark-muted text-sm">
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
