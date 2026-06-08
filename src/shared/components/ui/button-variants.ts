import { cva, type VariantProps } from "class-variance-authority";

/**
 * TeamForge Button Variants
 * Embodying the "Structured Warmth" design system:
 * - Mechanical physics: -translate-y-1 on hover reveals unblurred shadow.
 * - Tactile press: translate-y-0 on active hides shadow.
 * - High-speed transition: 150ms duration.
 */
export const buttonVariants = cva(
  "group relative inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-bold text-sm transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed data-[loading=true]:cursor-wait",
  {
    variants: {
      variant: {
        primary:
          "border-2 border-button-primary-border bg-button-primary-border text-primary-foreground after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 hover:-translate-y-1 hover:shadow-button-primary focus-visible:ring-primary active:translate-y-0 active:shadow-none",
        secondary:
          "border-2 border-accent/35 bg-accent/12 text-accent after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 hover:-translate-y-1 hover:border-accent/45 hover:bg-accent/18 hover:shadow-button-secondary focus-visible:ring-accent active:translate-y-0 active:shadow-none",
        outline:
          "border-2 border-ink bg-transparent text-ink after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 hover:-translate-y-1 hover:shadow-button-outline focus-visible:ring-ink active:translate-y-0! active:shadow-none! dark:border-white dark:text-white focus-visible:dark:ring-white hover:dark:shadow-button-outline-dark",
        destructive:
          "border-2 border-destructive/50 bg-transparent text-destructive after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 hover:-translate-y-1 hover:shadow-button-destructive focus-visible:ring-destructive active:translate-y-0! active:shadow-none! hover:dark:shadow-button-destructive",
        ghost:
          "border-2 border-transparent bg-transparent text-ink hover:bg-ink/5 focus-visible:ring-ink active:translate-y-px active:bg-ink/10 dark:text-white focus-visible:dark:ring-white hover:dark:bg-white/10",
        accentGhost:
          "border-2 border-transparent bg-transparent text-slate-muted hover:bg-primary/8 hover:text-primary focus-visible:ring-primary active:translate-y-px active:bg-primary/12 focus-visible:dark:ring-primary hover:dark:bg-primary/12 hover:dark:text-primary",
        inverseGhost:
          "border border-white/10 bg-white/8 text-white/80 backdrop-blur-sm hover:border-white/25 hover:bg-white/14 hover:text-white hover:shadow-sm focus-visible:ring-white active:translate-y-px",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary",
        subtle:
          "border border-transparent bg-muted/40 text-slate-muted hover:border-border/50 hover:bg-muted hover:text-ink",
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
