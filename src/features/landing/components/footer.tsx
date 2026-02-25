import { TeamForgeLogo } from "../../../assets/logo";

export function Footer() {
  return (
    <footer
      className="bg-hero-bg py-5 border-t border-white/5"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span className="flex items-center gap-1.5 font-sans text-sm">
            <TeamForgeLogo className="w-5 h-5" showBackground={false} />
            <span className="text-white/50">Team</span>
            <span className="text-forge-teal">Forge</span>
          </span>
          <span className="hidden sm:block text-white/20 text-sm">·</span>
          <a
            href="/privacy"
            className="font-sans text-sm text-slate-muted hover:text-white/60 transition-colors"
          >
            Privacy
          </a>
          <span className="hidden sm:block text-white/20 text-sm">·</span>
          <a
            href="/terms"
            className="font-sans text-sm text-slate-muted hover:text-white/60 transition-colors"
          >
            Terms
          </a>
          <span className="hidden sm:block text-white/20 text-sm">·</span>
          <span className="font-sans text-sm text-slate-muted">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
