import { Slot } from "@radix-ui/react-slot";
import { type ComponentPropsWithoutRef, isValidElement, type Ref } from "react";
import { cn } from "@/shared/lib/utils";
import { type ButtonVariants, buttonVariants } from "./button-variants";
import { Spinner } from "./spinner";

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

function getLoaderSizeClass(size: ButtonV2Props["size"]) {
  if (size === "icon-xs") {
    return "size-3.5";
  }

  if (size === "xs") {
    return "size-3.5";
  }

  if (size === "sm" || size === "icon-sm") {
    return "size-4";
  }

  return "size-5";
}

function isButtonUnavailable({
  disabled,
  loading,
}: Pick<ButtonV2Props, "disabled" | "loading">) {
  return Boolean(disabled || loading);
}

function shouldRenderSweepEffect({
  disabled,
  loading,
  variant,
}: Pick<ButtonV2Props, "disabled" | "loading" | "variant">) {
  return (
    (variant === "primary" || variant === "secondary") &&
    !isButtonUnavailable({ disabled, loading })
  );
}

function getButtonClassName({
  asChild,
  children,
  className,
  disabled,
  size,
  variant,
}: Pick<
  ButtonV2Props,
  "asChild" | "children" | "className" | "disabled" | "size" | "variant"
>) {
  const baseClasses = buttonVariants({
    variant,
    size,
    disabled: !!disabled,
    className,
  });

  return getSlottedButtonClasses(
    baseClasses,
    isSlottedLink(Boolean(asChild), children),
  );
}

function getButtonContentClassName({
  contentClassName,
  finalClasses,
  loading,
}: Pick<ButtonV2Props, "contentClassName" | "loading"> & {
  finalClasses: string;
}) {
  return cn(
    "flex size-full items-center gap-2 transition-opacity duration-150",
    "min-w-0 [&>span]:min-w-0",
    loading ? "opacity-0" : "opacity-100",
    getContentJustificationClass(finalClasses),
    contentClassName,
  );
}

/**
 * TeamForge Unified Button (V2)
 * High-fidelity, mechanical-first design system component.
 */
function Button({
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
  const isUnavailable = isButtonUnavailable({ disabled, loading });
  const finalClasses = getButtonClassName({
    asChild,
    children,
    className,
    disabled,
    size,
    variant,
  });

  return (
    <Comp
      ref={ref}
      type={type}
      disabled={isUnavailable}
      data-loading={loading}
      aria-disabled={isUnavailable}
      aria-busy={loading}
      className={cn(finalClasses)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {/* Layer 1: Internal sweep effect on solid buttons */}
          {shouldRenderSweepEffect({ disabled, loading, variant }) ? (
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-sweep" />
            </div>
          ) : null}

          {/* Layer 2: Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit]">
              <Spinner
                aria-hidden="true"
                className={getLoaderSizeClass(size)}
              />
              <span className="sr-only">Loading...</span>
            </div>
          )}

          {/* Layer 3: Content Container - Maintains layout width while loading */}
          <span
            className={getButtonContentClassName({
              contentClassName,
              finalClasses,
              loading,
            })}
          >
            {children}
          </span>
        </>
      )}
    </Comp>
  );
}

export { Button };
