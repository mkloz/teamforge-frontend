export function Footer() {
  return (
    <footer
      className="bg-[#090909] py-5 border-t border-white/5"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          <span className="font-sans text-sm text-[#6B7280]">
            <span className="text-white/50">Team</span>
            <span className="text-[#0D9488]">Forge</span>
          </span>
          <span className="hidden sm:block text-white/20 text-sm">·</span>
          <a
            href="/privacy"
            className="font-sans text-sm text-[#6B7280] hover:text-white/60 transition-colors"
          >
            Privacy
          </a>
          <span className="hidden sm:block text-white/20 text-sm">·</span>
          <a
            href="/terms"
            className="font-sans text-sm text-[#6B7280] hover:text-white/60 transition-colors"
          >
            Terms
          </a>
          <span className="hidden sm:block text-white/20 text-sm">·</span>
          <span className="font-sans text-sm text-[#6B7280]">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}
