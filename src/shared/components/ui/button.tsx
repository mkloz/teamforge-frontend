import { cn } from "@/shared/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Loader2 } from "lucide-react";
import {
  isValidElement,
  memo,
  type ComponentPropsWithoutRef,
  type Ref,
} from "react";
import { buttonVariants, type ButtonVariants } from "./button-variants";

export interface ButtonV2Props
  extends Omit<ComponentPropsWithoutRef<"button">, "disabled">, ButtonVariants {
  asChild?: boolean;
  contentClassName?: string;
  loading?: boolean;
  ref?: Ref<HTMLButtonElement>;
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

  // Heuristic to detect if the child is a link (a tag or component with to/href)
  const isLink =
    asChild &&
    isValidElement(children) &&
    (children.type === "a" ||
      (children.props &&
        typeof children.props === "object" &&
        ("href" in children.props || "to" in children.props)));

  // CSS :enabled pseudo-class doesn't apply to links.
  // If we detect a link being used via asChild, we strip :enabled.
  const finalClasses = isLink
    ? baseClasses.replace(/:enabled/g, "")
    : baseClasses;

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
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
                <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-sweep" />
              </div>
            )}

          {/* Layer 2: Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center z-10 rounded-[inherit]">
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
              "flex items-center gap-2 transition-opacity duration-150 h-full w-full",
              loading ? "opacity-0" : "opacity-100",
              // Respect justification from the outer button
              finalClasses.includes("justify-start")
                ? "justify-start"
                : finalClasses.includes("justify-end")
                  ? "justify-end"
                  : finalClasses.includes("justify-between")
                    ? "justify-between"
                    : "justify-center",
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
