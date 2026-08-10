import { Slot } from "@radix-ui/react-slot";
import {
  type ComponentPropsWithoutRef,
  isValidElement,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
} from "react";
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
    "flex size-full items-center gap-2 transition-opacity duration-150 motion-reduce:transition-none",
    "min-w-0 [&>span]:min-w-0",
    loading ? "opacity-0" : "opacity-100",
    getContentJustificationClass(finalClasses),
    contentClassName,
  );
}

/**
 * Findafew Unified Button (V2)
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
  onClickCapture,
  onKeyDownCapture,
  tabIndex,
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
  const handleUnavailableClickCapture = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    if (asChild && isUnavailable) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClickCapture?.(event);
  };
  const handleUnavailableKeyDownCapture = (
    event: KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      asChild &&
      isUnavailable &&
      (event.key === "Enter" || event.key === " ")
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onKeyDownCapture?.(event);
  };

  return (
    <Comp
      ref={ref}
      type={type}
      disabled={asChild ? undefined : isUnavailable}
      data-slot="button"
      data-size={size ?? "default"}
      data-disabled={isUnavailable}
      data-loading={loading}
      aria-disabled={isUnavailable}
      aria-busy={loading}
      tabIndex={asChild && isUnavailable ? -1 : tabIndex}
      onClickCapture={handleUnavailableClickCapture}
      onKeyDownCapture={handleUnavailableKeyDownCapture}
      className={cn(finalClasses)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit]">
              <Spinner
                aria-hidden="true"
                className={getLoaderSizeClass(size)}
              />
            </div>
          )}

          {/* Content container maintains layout width while loading. */}
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
