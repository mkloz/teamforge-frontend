import { cva, type VariantProps } from "class-variance-authority";

/**
 * Findafew buttons preserve the original mechanical lift and press response.
 * Focus stays crisp and the separate glossy sweep layer is excluded.
 */
export const buttonVariants = cva(
  "group relative inline-flex min-w-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap font-bold text-sm transition-[background-color,border-color,box-shadow,color,transform] duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:transition-none disabled:transform-none disabled:cursor-not-allowed disabled:shadow-none data-[disabled=true]:transform-none data-[loading=true]:transform-none data-[disabled=true]:cursor-not-allowed data-[loading=true]:cursor-wait data-[disabled=true]:shadow-none data-[loading=true]:shadow-none motion-reduce:transform-none motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary:
          "border-2 border-transparent bg-button-primary-border text-primary-foreground after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:-bottom-1 focus-visible:ring-primary active:translate-y-0 active:shadow-none hover:[@media(hover:hover)_and_(pointer:fine)]:-translate-y-1 hover:[@media(hover:hover)_and_(pointer:fine)]:shadow-button-primary hover:[@media(hover:hover)_and_(pointer:fine)]:after:pointer-events-auto",
        secondary:
          "border-2 border-transparent bg-accent-soft text-accent after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:-bottom-1 focus-visible:ring-accent active:translate-y-0 active:shadow-none hover:[@media(hover:hover)_and_(pointer:fine)]:-translate-y-1 hover:[@media(hover:hover)_and_(pointer:fine)]:bg-accent/18 hover:[@media(hover:hover)_and_(pointer:fine)]:shadow-button-secondary hover:[@media(hover:hover)_and_(pointer:fine)]:after:pointer-events-auto",
        outline:
          "border-2 border-ink bg-transparent text-ink after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:-bottom-1 focus-visible:ring-ink active:translate-y-0! active:shadow-none! dark:border-white dark:text-white focus-visible:dark:ring-white hover:[@media(hover:hover)_and_(pointer:fine)]:-translate-y-1 hover:[@media(hover:hover)_and_(pointer:fine)]:shadow-button-outline hover:[@media(hover:hover)_and_(pointer:fine)]:after:pointer-events-auto hover:dark:[@media(hover:hover)_and_(pointer:fine)]:shadow-button-outline-dark",
        destructive:
          "border-2 border-transparent bg-destructive-soft text-destructive after:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:-bottom-1 focus-visible:ring-destructive active:translate-y-0! active:shadow-none! hover:[@media(hover:hover)_and_(pointer:fine)]:-translate-y-1 hover:[@media(hover:hover)_and_(pointer:fine)]:shadow-button-destructive hover:[@media(hover:hover)_and_(pointer:fine)]:after:pointer-events-auto hover:dark:[@media(hover:hover)_and_(pointer:fine)]:shadow-button-destructive",
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
