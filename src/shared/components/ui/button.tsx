import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import {
  type ComponentPropsWithoutRef,
  isValidElement,
  memo,
  type Ref,
} from "react";
import { cn } from "@/shared/lib/utils";
import { type ButtonVariants, buttonVariants } from "./button-variants";

export interface ButtonV2Props
  extends Omit<ComponentPropsWithoutRef<"button">, "disabled">,
    ButtonVariants {
  asChild?: boolean;
  contentClassName?: string;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

function isSlottedLink(asChild: boolean, children: ButtonV2Props["children"]) {
  if (!asChild || !isValidElement<{ href?: unknown; to?: unknown }>(children)) {
    return false;
  }

  return (
    children.type === "a" || "href" in children.props || "to" in children.props
  );
}

function getSlottedButtonClasses(classes: string, asLink: boolean) {
  return asLink ? classes.replace(/:enabled/g, "") : classes;
}

function getContentJustificationClass(classes: string) {
  if (classes.includes("justify-start")) {
    return "justify-start";
  }

  if (classes.includes("justify-end")) {
    return "justify-end";
  }

  if (classes.includes("justify-between")) {
    return "justify-between";
  }

  return "justify-center";
}

/**
 * TeamForge Unified Button (V2)
 * High-fidelity, mechanical-first design system component.
 */
function ButtonComponent({
  className,
  variant,
  size,
  asChild = false,
  contentClassName,
  loading = false,
  children,
  disabled = false,
  type = "button",
  ref,
  ...props
}: ButtonV2Props) {
  const Comp = asChild ? Slot : "button";

  const baseClasses = buttonVariants({
    variant,
    size,
    disabled: !!disabled,
    className,
  });

  const finalClasses = getSlottedButtonClasses(
    baseClasses,
    isSlottedLink(asChild, children),
  );

  return (
    <Comp
      ref={ref}
      type={type}
      disabled={disabled || loading}
      data-loading={loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      className={cn(finalClasses)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {/* Layer 1: Internal sweep effect on solid buttons */}
          {(variant === "primary" || variant === "secondary") &&
            !(disabled || loading) && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-inherit">
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-sweep" />
              </div>
            )}

          {/* Layer 2: Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-inherit">
              <Loader2
                className={cn(
                  "animate-spin text-current",
                  size === "xs"
                    ? "size-3.5"
                    : size === "sm"
                      ? "size-4"
                      : "size-5",
                )}
              />
              <span className="sr-only">Loading...</span>
            </div>
          )}

          {/* Layer 3: Content Container - Maintains layout width while loading */}
          <span
            className={cn(
              "flex size-full items-center gap-2 transition-opacity duration-150",
              "min-w-0 [&>span]:min-w-0",
              loading ? "opacity-0" : "opacity-100",
              getContentJustificationClass(finalClasses),
              contentClassName,
            )}
          >
            {children}
          </span>
        </>
      )}
    </Comp>
  );
}

const Button = memo(ButtonComponent);

Button.displayName = "Button";

export { Button };
