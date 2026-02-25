import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { TeamForgeLogo } from "./logo";

const NAV_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "The Algorithm", href: "#algorithm" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#090909]/95 backdrop-blur-md border-b border-white/8"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Wordmark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2 select-none"
            aria-label="TeamForge home"
          >
            <TeamForgeLogo className="w-8 h-8" showBackground={false} />
            <span className="font-sans text-lg font-semibold tracking-tight">
              <span className="text-white">Team</span>
              <span className="text-[#0D9488]">Forge</span>
            </span>
          </a>

          {/* Desktop nav links */}
          <nav
            className="hidden md:flex items-center gap-8"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="font-sans text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-[#0D9488] scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/login"
              className="font-sans text-sm font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 rounded-lg px-4 py-2 transition-all duration-200"
            >
              Log In
            </a>
            <a
              href="/register"
              className="font-sans text-sm font-semibold text-white bg-[#0D9488] hover:bg-[#0f9e92] rounded-lg px-5 py-2 transition-all duration-200 shadow-[0_0_16px_rgba(13,148,136,0.3)] hover:shadow-[0_0_24px_rgba(13,148,136,0.5)]"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white/70 hover:text-white p-2 rounded-lg transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <div
        ref={menuRef}
        className={`fixed inset-0 z-40 bg-[#090909]/98 backdrop-blur-lg flex flex-col items-center justify-center gap-8 transition-all duration-300 ${
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!menuOpen}
      >
        <nav
          className="flex flex-col items-center gap-6"
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="font-sans text-2xl font-semibold text-white/70 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-3 w-48">
          <a
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center font-sans text-base font-medium text-white/70 hover:text-white border border-white/20 rounded-lg px-4 py-3 transition-all"
          >
            Log In
          </a>
          <a
            href="/register"
            onClick={() => setMenuOpen(false)}
            className="w-full text-center font-sans text-base font-semibold text-white bg-[#0D9488] rounded-lg px-4 py-3 transition-all shadow-[0_0_20px_rgba(13,148,136,0.35)]"
          >
            Get Started
          </a>
        </div>
      </div>
    </>
  );
}
