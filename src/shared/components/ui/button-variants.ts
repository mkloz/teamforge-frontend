import { cva, type VariantProps } from "class-variance-authority";

/**
 * TeamForge Button Variants
 * Embodying the "Structured Warmth" design system:
 * - Mechanical physics: -translate-y-1 on hover reveals unblurred shadow.
 * - Tactile press: translate-y-0 on active hides shadow.
 * - High-speed transition: 150ms duration.
 */
export const buttonVariants = cva(
  "group relative inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-bold text-sm transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 active:enabled:scale-95 disabled:cursor-not-allowed data-[loading=true]:cursor-wait",
  {
    variants: {
      variant: {
        primary:
          "border-2 border-button-primary-border bg-forge-teal text-white after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 focus-visible:ring-forge-teal active:enabled:translate-y-0 active:enabled:shadow-none hover:enabled:-translate-y-1 hover:enabled:shadow-button-primary",
        secondary:
          "border-2 border-spark-amber/35 bg-spark-amber/12 text-spark-amber after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 focus-visible:ring-spark-amber active:enabled:translate-y-0 active:enabled:shadow-none hover:enabled:-translate-y-1 hover:enabled:border-spark-amber/45 hover:enabled:bg-spark-amber/18 hover:enabled:shadow-button-secondary",
        outline:
          "border-2 border-ink bg-transparent text-ink after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 focus-visible:ring-ink active:enabled:translate-y-0! active:enabled:shadow-none! hover:enabled:-translate-y-1 hover:enabled:shadow-button-outline dark:border-white dark:text-white focus-visible:dark:ring-white hover:enabled:dark:shadow-button-outline-dark",
        destructive:
          "border-2 border-destructive/50 bg-transparent text-destructive after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 focus-visible:ring-destructive active:enabled:translate-y-0! active:enabled:shadow-none! hover:enabled:-translate-y-1 hover:enabled:shadow-button-destructive hover:enabled:dark:shadow-button-destructive",
        ghost:
          "border-2 border-transparent bg-transparent text-ink focus-visible:ring-ink active:enabled:translate-y-px active:enabled:bg-ink/10 hover:enabled:bg-ink/5 dark:text-white focus-visible:dark:ring-white hover:enabled:dark:bg-white/10",
        accentGhost:
          "border-2 border-transparent bg-transparent text-slate-muted focus-visible:ring-forge-teal active:enabled:translate-y-px active:enabled:bg-forge-teal/12 hover:enabled:bg-forge-teal/8 hover:enabled:text-forge-teal focus-visible:dark:ring-forge-teal hover:enabled:dark:bg-forge-teal/12 hover:enabled:dark:text-forge-teal",
        inverseGhost:
          "border border-white/10 bg-white/8 text-white/80 backdrop-blur-sm focus-visible:ring-white active:enabled:translate-y-px hover:enabled:border-white/25 hover:enabled:bg-white/14 hover:enabled:text-white hover:enabled:shadow-sm",
        link: "text-forge-teal underline-offset-4 focus-visible:ring-forge-teal hover:enabled:underline",
        subtle:
          "border border-transparent bg-muted/40 text-slate-muted hover:enabled:border-border/50 hover:enabled:bg-muted hover:enabled:text-ink",
      },
      size: {
        default: "h-11 rounded-lg px-6",
        compact: "h-11 rounded-lg px-3",
        xs: "h-9 rounded-full px-3 text-xs",
        sm: "h-9 rounded-full px-4",
        md: "h-11 rounded-lg px-6",
        lg: "h-13 rounded-xl px-5 text-base sm:px-8",
        hero: "h-14 rounded-xl px-6 text-base sm:h-16 sm:px-10 sm:text-lg",
        icon: "size-11 rounded-md",
        "icon-sm": "size-9 rounded-full",
        "icon-xs": "size-9 rounded-full",
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
