import { cva, type VariantProps } from "class-variance-authority";

/**
 * TeamForge Button Variants
 * Embodying the "Structured Warmth" design system:
 * - Mechanical physics: -translate-y-1 on hover reveals unblurred shadow.
 * - Tactile press: translate-y-0 on active hides shadow.
 * - High-speed transition: 150ms duration.
 */
export const buttonVariants = cva(
  "relative inline-flex min-w-0 items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none enabled:active:scale-[0.98] data-[loading=true]:cursor-wait group",
  {
    variants: {
      variant: {
        primary:
          "bg-forge-teal text-white border-2 border-button-primary-border shadow-none hover:enabled:-translate-y-1 hover:enabled:shadow-button-primary active:enabled:translate-y-0 active:enabled:shadow-none focus-visible:ring-forge-teal after:absolute after:inset-x-0 after:top-0 after:-bottom-2 after:pointer-events-auto",
        secondary:
          "bg-spark-amber text-ink border-2 border-button-secondary-border shadow-none hover:enabled:-translate-y-1 hover:enabled:shadow-button-secondary active:enabled:translate-y-0 active:enabled:shadow-none focus-visible:ring-spark-amber after:absolute after:inset-x-0 after:top-0 after:-bottom-2 after:pointer-events-auto",
        outline:
          "bg-transparent text-ink border-2 border-ink shadow-none hover:enabled:-translate-y-1 hover:enabled:shadow-button-outline hover:enabled:active:shadow-none active:enabled:translate-y-0 active:enabled:shadow-none focus-visible:ring-ink dark:text-white dark:border-white dark:hover:enabled:shadow-button-outline-dark dark:hover:enabled:active:shadow-none dark:focus-visible:ring-white dark:active:enabled:shadow-none after:absolute after:inset-x-0 after:top-0 after:-bottom-2 after:pointer-events-auto",
        destructive:
          "bg-transparent text-destructive border-2 border-destructive/50 shadow-none hover:enabled:-translate-y-1 hover:enabled:shadow-button-destructive hover:enabled:active:shadow-none active:enabled:translate-y-0 active:enabled:shadow-none focus-visible:ring-destructive dark:bg-transparent dark:text-destructive dark:border-destructive/50 dark:hover:enabled:shadow-button-destructive dark:hover:enabled:active:shadow-none dark:active:enabled:shadow-none dark:focus-visible:ring-destructive after:absolute after:inset-x-0 after:top-0 after:-bottom-2 after:pointer-events-auto",
        ghost:
          "bg-transparent text-ink border-2 border-transparent hover:enabled:bg-ink/5 active:enabled:bg-ink/10 active:enabled:translate-y-[1px] focus-visible:ring-ink dark:text-white dark:hover:enabled:bg-white/10 dark:focus-visible:ring-white dark:active:enabled:shadow-none",
        accentGhost:
          "bg-transparent text-slate-muted border-2 border-transparent hover:enabled:bg-forge-teal/8 hover:enabled:text-forge-teal active:enabled:bg-forge-teal/12 active:enabled:translate-y-[1px] focus-visible:ring-forge-teal dark:text-slate-300 dark:hover:enabled:bg-forge-teal/12 dark:hover:enabled:text-forge-teal dark:focus-visible:ring-forge-teal",
        surface:
          "bg-card/90 text-foreground border border-border/70 shadow-sm backdrop-blur-sm hover:enabled:border-forge-teal/35 hover:enabled:bg-forge-teal/8 hover:enabled:text-forge-teal active:enabled:bg-forge-teal/12 active:enabled:translate-y-[1px] focus-visible:ring-forge-teal",
        inverseGhost:
          "bg-canvas/10 text-primary-foreground border border-ink/5 backdrop-blur-sm hover:enabled:bg-white hover:enabled:text-ink hover:enabled:border-ink/10 hover:enabled:shadow-sm active:enabled:translate-y-[1px] focus-visible:ring-white",
        link: "text-forge-teal underline-offset-4 hover:enabled:underline focus-visible:ring-forge-teal",
        subtle:
          "bg-muted/40 text-slate-muted border border-transparent hover:enabled:bg-muted hover:enabled:text-ink hover:enabled:border-border/50",
      },
      size: {
        default: "h-11 px-6 rounded-lg",
        xs: "h-8 px-3 text-xs rounded-lg",
        sm: "h-9 px-4 rounded-lg",
        md: "h-11 px-6 rounded-xl",
        lg: "h-13 px-5 text-base rounded-xl sm:px-8",
        hero: "h-14 px-6 text-base rounded-[1.125rem] sm:h-16 sm:px-10 sm:text-lg sm:rounded-[1.25rem]",
        icon: "h-11 w-11 rounded-xl",
        "icon-sm": "h-9 w-9 rounded-lg",
        "icon-xs": "h-8 w-8 rounded-lg",
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
