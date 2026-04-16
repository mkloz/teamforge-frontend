import { Button as ButtonV2 } from "@/shared/components/ui/button";
import { ArrowRight, Home, Settings2, User, Zap } from "lucide-react";

const states = [
  "DEFAULT",
  "HOVER (PEEK)",
  "ACTIVE (PRESS)",
  "FOCUS",
  "LOADING",
  "DISABLED",
];

const variants = [
  {
    id: "primary",
    name: "PRIMARY",
    theme: "primary",
    icon: Zap,
    shadow: "var(--shadow-button-primary)",
  },
  {
    id: "secondary",
    name: "SECONDARY",
    theme: "secondary",
    icon: User,
    shadow: "var(--shadow-button-secondary)",
  },
  {
    id: "outline",
    name: "OUTLINE",
    theme: "outline",
    icon: Settings2,
    shadow: "var(--shadow-button-outline)",
  },
  { id: "ghost", name: "GHOST", theme: "ghost", icon: Home, shadow: "none" },
] as const;

export function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#1C1C1A] selection:bg-forge-teal/20 font-sans p-8 lg:p-12">
      <div className="max-w-300 mx-auto space-y-16">
        {/* Concise Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/5 pb-8">
          <div>
            <p className="text-[10px] font-black tracking-[0.2em] text-forge-teal uppercase mb-2">
              TeamForge Laboratory
            </p>
            <h1 className="text-4xl font-black tracking-tight">
              Component Workbench
            </h1>
          </div>
          <p className="text-sm text-slate-muted font-medium italic max-w-sm md:text-right">
            V2.0 — Mechanical physics, unblurred shadows, and border-driven
            depth.
          </p>
        </header>

        {/* The State Matrix - Light Context */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-px flex-1 bg-black/5" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-muted px-4">
              01. Canvas / Light Context
            </h2>
            <div className="h-px flex-1 bg-black/5" />
          </div>

          <div className="w-full overflow-x-auto overflow-y-visible pb-12">
            <div className="min-w-250">
              {/* Header */}
              <div className="grid grid-cols-[140px_repeat(6,1fr)] gap-4 items-center mb-10">
                <span className="text-[9px] font-black text-slate-muted/50 tracking-widest uppercase">
                  Variant
                </span>
                {states.map((s) => (
                  <span
                    key={s}
                    className="text-[9px] font-black text-slate-muted/50 tracking-widest uppercase text-center"
                  >
                    {s}
                  </span>
                ))}
              </div>

              {/* Light Rows */}
              <div className="space-y-10">
                {variants.map((v) => (
                  <div
                    key={v.id}
                    className="grid grid-cols-[140px_repeat(6,1fr)] gap-4 items-center"
                  >
                    <span className="text-[11px] font-black tracking-widest text-ink uppercase">
                      {v.name}
                    </span>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme}>Action</ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        className="-translate-y-1"
                        style={{ boxShadow: v.shadow }}
                      >
                        Hovered
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        className="translate-y-0 shadow-none"
                      >
                        Pressed
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        className="ring-2 ring-ink ring-offset-2"
                      >
                        Focused
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} loading>
                        Loading
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} disabled>
                        Disabled
                      </ButtonV2>
                    </div>
                  </div>
                ))}

                {/* Light Icon Only Rows */}
                {variants.map((v) => (
                  <div
                    key={`${v.id}-icon`}
                    className="grid grid-cols-[140px_repeat(6,1fr)] gap-4 items-center opacity-80 pt-4 border-t border-black/5"
                  >
                    <span className="text-[10px] font-bold tracking-widest text-ink/70 uppercase">
                      {v.name} <br />{" "}
                      <span className="text-[8px] opacity-50">ICON ONLY</span>
                    </span>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} size="icon">
                        <v.icon className="size-5" />
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        size="icon"
                        className="-translate-y-1"
                        style={{ boxShadow: v.shadow }}
                      >
                        <v.icon className="size-5" />
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        size="icon"
                        className="translate-y-0 shadow-none"
                      >
                        <v.icon className="size-5" />
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        size="icon"
                        className="ring-2 ring-ink ring-offset-2"
                      >
                        <v.icon className="size-5" />
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} size="icon" loading />
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} size="icon" disabled>
                        <v.icon className="size-5" />
                      </ButtonV2>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The State Matrix - Dark Context */}
        <section className="space-y-6 bg-ink -mx-8 lg:-mx-12 p-8 lg:p-12 rounded-[3.5rem] dark shadow-2xl">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-px flex-1 bg-white/10" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 px-4">
              02. Void / Dark Context
            </h2>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="w-full overflow-x-auto overflow-y-visible pb-12">
            <div className="min-w-250">
              {/* Rows */}
              <div className="space-y-10">
                {variants.map((v) => (
                  <div
                    key={`${v.id}-dark`}
                    className="grid grid-cols-[140px_repeat(6,1fr)] gap-4 items-center"
                  >
                    <span className="text-[11px] font-black tracking-widest text-white uppercase">
                      {v.name}
                    </span>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme}>Action</ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        className="-translate-y-1"
                        style={{
                          boxShadow:
                            v.id === "outline"
                              ? "var(--shadow-button-outline-dark)"
                              : v.shadow,
                        }}
                      >
                        Hovered
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        className="translate-y-0 shadow-none"
                      >
                        Pressed
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        className="ring-2 ring-white ring-offset-2 ring-offset-ink"
                      >
                        Focused
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} loading>
                        Loading
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} disabled>
                        Disabled
                      </ButtonV2>
                    </div>
                  </div>
                ))}

                {/* Dark Icon Only Rows */}
                {variants.map((v) => (
                  <div
                    key={`${v.id}-dark-icon`}
                    className="grid grid-cols-[140px_repeat(6,1fr)] gap-4 items-center opacity-80 pt-4 border-t border-white/5"
                  >
                    <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">
                      {v.name} <br />{" "}
                      <span className="text-[8px] opacity-50">ICON ONLY</span>
                    </span>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} size="icon">
                        <v.icon className="size-5" />
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        size="icon"
                        className="-translate-y-1"
                        style={{
                          boxShadow:
                            v.id === "outline"
                              ? "var(--shadow-button-outline-dark)"
                              : v.shadow,
                        }}
                      >
                        <v.icon className="size-5" />
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        size="icon"
                        className="translate-y-0 shadow-none"
                      >
                        <v.icon className="size-5" />
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2
                        variant={v.theme}
                        size="icon"
                        className="ring-2 ring-white ring-offset-2 ring-offset-ink"
                      >
                        Focused
                      </ButtonV2>
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} size="icon" loading />
                    </div>
                    <div className="flex justify-center">
                      <ButtonV2 variant={v.theme} size="icon" disabled>
                        <v.icon className="size-5" />
                      </ButtonV2>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="bg-white rounded-[2.5rem] border border-black/5 p-10 flex flex-wrap items-end justify-between gap-8 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-muted">
              Scale Reference
            </h3>
            <p className="text-[11px] font-medium text-ink/60 italic">
              From 32px (XS) to 64px (Hero) height tokens.
            </p>
          </div>
          <div className="flex items-end gap-6 text-ink">
            <ButtonV2 size="xs">XS</ButtonV2>
            <ButtonV2 size="sm">Small</ButtonV2>
            <ButtonV2 size="md">Medium</ButtonV2>
            <ButtonV2 size="lg">Large</ButtonV2>
            <ButtonV2 variant="primary" size="hero">
              Hero Primary <ArrowRight className="size-5" />
            </ButtonV2>
          </div>
        </section>

        <footer className="text-center pb-20">
          <p className="text-[10px] font-bold text-slate-muted tracking-widest uppercase opacity-50">
            Systemic Integrity Confirmed — Releasing to Production
          </p>
        </footer>
      </div>
    </div>
  );
}
