import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TeamForgeLogo } from "../../../../assets/logo";

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
    const handleScroll = () => {
      const isScrolled = window.scrollY > 60;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

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
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-150",
          scrolled
            ? "bg-hero-bg/95 backdrop-blur-md border-b border-white/5"
            : "bg-transparent",
        )}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
              <span className="text-forge-teal">Forge</span>
            </span>
          </a>

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
                <span className="absolute -bottom-0.5 left-0 right-0 h-px bg-forge-teal scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              asChild
              className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/40 bg-transparent px-4 py-2"
            >
              <Link to="/auth/login">Log In</Link>
            </Button>
            <Button variant="default" asChild className="px-5 py-2">
              <Link to="/auth/register">Get Started</Link>
            </Button>
          </div>

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

      <div
        ref={menuRef}
        className={cn(
          "fixed inset-0 z-40 bg-hero-bg/98 backdrop-blur-lg flex flex-col items-center justify-center gap-8 transition-opacity duration-150",
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
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
        <div className="flex flex-col items-center gap-4 w-48">
          <Button
            variant="outline"
            asChild
            className="w-full border-white/20 text-white hover:bg-white/10 hover:border-white/40 bg-transparent text-base"
          >
            <Link to="/auth/login" onClick={() => setMenuOpen(false)}>
              Log In
            </Link>
          </Button>
          <Button variant="default" asChild className="w-full text-base py-6">
            <Link to="/auth/register" onClick={() => setMenuOpen(false)}>
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
