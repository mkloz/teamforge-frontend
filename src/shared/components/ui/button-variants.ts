import { cva, type VariantProps } from "class-variance-authority";

/**
 * TeamForge buttons preserve the original mechanical lift and press response.
 * Focus stays crisp and the separate glossy sweep layer is excluded.
 */
export const buttonVariants = cva(
  "group relative inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-bold text-sm transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-95 disabled:pointer-events-none disabled:cursor-not-allowed data-[loading=true]:cursor-wait",
  {
    variants: {
      variant: {
        primary:
          "border-2 border-transparent bg-button-primary-border text-primary-foreground after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 hover:-translate-y-1 hover:shadow-button-primary focus-visible:ring-primary active:translate-y-0 active:shadow-none",
        secondary:
          "border-2 border-transparent bg-accent/12 text-accent after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 hover:-translate-y-1 hover:bg-accent/18 hover:shadow-button-secondary focus-visible:ring-accent active:translate-y-0 active:shadow-none",
        outline:
          "border-2 border-ink bg-transparent text-ink after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 hover:-translate-y-1 hover:shadow-button-outline focus-visible:ring-ink active:translate-y-0! active:shadow-none! dark:border-white dark:text-white focus-visible:dark:ring-white hover:dark:shadow-button-outline-dark",
        destructive:
          "border-2 border-transparent bg-destructive/10 text-destructive after:pointer-events-auto after:absolute after:inset-x-0 after:top-0 after:-bottom-2 hover:-translate-y-1 hover:shadow-button-destructive focus-visible:ring-destructive active:translate-y-0! active:shadow-none! hover:dark:shadow-button-destructive",
        ghost:
          "border-2 border-transparent bg-transparent text-ink hover:bg-ink/6 focus-visible:ring-ink active:translate-y-px active:bg-ink/10 dark:text-white active:dark:bg-white/12 focus-visible:dark:ring-white hover:dark:bg-white/8",
        accentGhost:
          "border-2 border-transparent bg-transparent text-slate-muted hover:text-ink focus-visible:ring-ink active:translate-y-px focus-visible:dark:ring-white hover:dark:text-white",
        inverseGhost:
          "border border-transparent bg-white/8 text-white/80 hover:text-white hover:shadow-soft-sm focus-visible:ring-white active:translate-y-px",
        link: "text-foreground underline-offset-4 hover:underline focus-visible:ring-ink focus-visible:dark:ring-white",
        subtle:
          "border border-transparent bg-muted/40 text-slate-muted hover:text-ink hover:shadow-soft-sm",
      },
      size: {
        default: "h-(--control-height) rounded-lg px-6",
        compact: "h-(--control-height) rounded-lg px-3",
        xs: "h-11 rounded-full px-3 text-xs sm:h-9",
        sm: "h-11 rounded-full px-4 sm:h-9",
        md: "h-(--control-height) rounded-lg px-6",
        lg: "h-13 rounded-xl px-5 text-base sm:px-8",
        hero: "h-14 rounded-xl px-6 text-base sm:h-16 sm:px-10 sm:text-lg",
        icon: "size-(--control-height) rounded-md",
        "icon-sm": "size-11 rounded-full sm:size-9",
        "icon-xs": "size-11 rounded-full sm:size-9",
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
