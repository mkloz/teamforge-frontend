import { cva, type VariantProps } from "class-variance-authority";

/**
 * TeamForge Button Variants
 * Embodying the "Structured Warmth" design system:
 * - Mechanical physics: -translate-y-1 on hover reveals unblurred shadow.
 * - Tactile press: translate-y-0 on active hides shadow.
 * - High-speed transition: 150ms duration.
 */
export const buttonVariants = cva(
  "group relative inline-flex min-w-0 items-center justify-center gap-2 text-sm font-bold whitespace-nowrap transition-all duration-150 ease-out focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:outline-none active:enabled:scale-[0.98] disabled:pointer-events-none data-[loading=true]:cursor-wait",
  {
    variants: {
      variant: {
        primary:
          "border-2 border-button-primary-border bg-forge-teal text-white after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 focus-visible:ring-forge-teal hover:enabled:-translate-y-1 hover:enabled:shadow-button-primary active:enabled:translate-y-0 active:enabled:shadow-none",
        secondary:
          "border-2 border-button-secondary-border bg-spark-amber text-ink after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 focus-visible:ring-spark-amber hover:enabled:-translate-y-1 hover:enabled:shadow-button-secondary active:enabled:translate-y-0 active:enabled:shadow-none",
        outline:
          "border-2 border-ink bg-transparent text-ink after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 focus-visible:ring-ink hover:enabled:-translate-y-1 hover:enabled:shadow-button-outline active:enabled:translate-y-0 active:enabled:shadow-none dark:border-white dark:text-white focus-visible:dark:ring-white hover:enabled:dark:shadow-button-outline-dark",
        destructive:
          "border-2 border-destructive/50 bg-transparent text-destructive after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 focus-visible:ring-destructive hover:enabled:-translate-y-1 hover:enabled:shadow-button-destructive active:enabled:translate-y-0 active:enabled:shadow-none hover:enabled:dark:shadow-button-destructive",
        ghost:
          "border-2 border-transparent bg-transparent text-ink focus-visible:ring-ink hover:enabled:bg-ink/5 active:enabled:translate-y-px active:enabled:bg-ink/10 dark:text-white focus-visible:dark:ring-white hover:enabled:dark:bg-white/10",
        accentGhost:
          "border-2 border-transparent bg-transparent text-slate-muted focus-visible:ring-forge-teal hover:enabled:bg-forge-teal/8 hover:enabled:text-forge-teal active:enabled:translate-y-px active:enabled:bg-forge-teal/12 dark:text-slate-300 focus-visible:dark:ring-forge-teal hover:enabled:dark:bg-forge-teal/12 hover:enabled:dark:text-forge-teal",
        surface:
          "border border-border/70 bg-card/90 text-foreground shadow-sm backdrop-blur-sm focus-visible:ring-forge-teal hover:enabled:border-forge-teal/35 hover:enabled:bg-forge-teal/8 hover:enabled:text-forge-teal active:enabled:translate-y-px active:enabled:bg-forge-teal/12",
        inverseGhost:
          "border border-ink/5 bg-canvas/10 text-primary-foreground backdrop-blur-sm focus-visible:ring-white hover:enabled:border-ink/10 hover:enabled:bg-white hover:enabled:text-ink hover:enabled:shadow-sm active:enabled:translate-y-px",
        link: "text-forge-teal underline-offset-4 focus-visible:ring-forge-teal hover:enabled:underline",
        subtle:
          "border border-transparent bg-muted/40 text-slate-muted hover:enabled:border-border/50 hover:enabled:bg-muted hover:enabled:text-ink",
      },
      size: {
        default: "h-11 rounded-lg px-6",
        xs: "h-9 rounded-lg px-3 text-xs",
        sm: "h-9 rounded-lg px-4",
        md: "h-11 rounded-xl px-6",
        lg: "h-13 rounded-xl px-5 text-base sm:px-8",
        hero: "h-14 rounded-xl px-6 text-base sm:h-16 sm:px-10 sm:text-lg",
        icon: "size-11 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
        "icon-xs": "size-9 rounded-lg",
      },
      disabled: {
        true: "opacity-50",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      disabled: false,
    },
  },
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;
