import { cva, type VariantProps } from "class-variance-authority";

/**
 * TeamForge Button Variants
 * Embodying the "Structured Warmth" design system:
 * - Mechanical physics: -translate-y-1 on hover reveals unblurred shadow.
 * - Tactile press: translate-y-0 on active hides shadow.
 * - High-speed transition: 150ms duration.
 */
export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:pointer-events-none enabled:active:scale-[0.98] data-[loading=true]:cursor-wait group",
  {
    variants: {
      variant: {
        primary:
          "bg-forge-teal text-white border-2 border-button-primary-border shadow-none hover:enabled:-translate-y-1 hover:enabled:shadow-button-primary active:enabled:translate-y-0 active:enabled:shadow-none focus-visible:ring-forge-teal after:absolute after:inset-x-0 after:top-0 after:-bottom-2 after:pointer-events-auto",
        secondary:
          "bg-spark-amber text-ink border-2 border-button-secondary-border shadow-none hover:enabled:-translate-y-1 hover:enabled:shadow-button-secondary active:enabled:translate-y-0 active:enabled:shadow-none focus-visible:ring-spark-amber after:absolute after:inset-x-0 after:top-0 after:-bottom-2 after:pointer-events-auto",
        outline:
          "bg-transparent text-ink border-2 border-ink shadow-none hover:enabled:-translate-y-1 hover:enabled:shadow-button-outline active:enabled:translate-y-0 active:enabled:shadow-none focus-visible:ring-ink dark:text-white dark:border-white dark:hover:enabled:shadow-button-outline-dark dark:focus-visible:ring-white dark:active:enabled:shadow-none after:absolute after:inset-x-0 after:top-0 after:-bottom-2 after:pointer-events-auto",
        ghost:
          "bg-transparent text-ink border-2 border-transparent hover:enabled:bg-ink/5 active:enabled:bg-ink/10 active:enabled:translate-y-[1px] focus-visible:ring-ink dark:text-white dark:hover:enabled:bg-white/10 dark:focus-visible:ring-white dark:active:enabled:shadow-none",
        link: "text-forge-teal underline-offset-4 hover:enabled:underline focus-visible:ring-forge-teal",
        subtle:
          "bg-muted/40 text-slate-muted border border-transparent hover:enabled:bg-muted hover:enabled:text-ink hover:enabled:border-border/50",
      },
      size: {
        default: "h-11 px-6 rounded-lg",
        xs: "h-8 px-3 text-xs rounded-lg",
        sm: "h-9 px-4 rounded-lg",
        md: "h-11 px-6 rounded-xl",
        lg: "h-13 px-8 text-base rounded-xl",
        hero: "h-16 px-10 text-lg rounded-[1.25rem]",
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
