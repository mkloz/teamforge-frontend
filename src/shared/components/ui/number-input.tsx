import { Input, type InputProps } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";

type NumberInputProps = Omit<
  InputProps,
  "type" | "inputMode" | "onChange" | "value" | "rightIcon"
> & {
  allowDecimal?: boolean;
  max?: number;
  min?: number;
  onNumberChange?: (value: number | undefined) => void;
  onValueChange?: (value: string) => void;
  precision?: number;
  step?: number;
  value?: number | string | null;
};

function getDecimalPlaces(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const valueString = String(value);

  if (valueString.includes("e-")) {
    return Number(valueString.split("e-")[1] ?? 0);
  }

  return valueString.split(".")[1]?.length ?? 0;
}

function roundToScale(value: number, scale: number) {
  const multiplier = 10 ** scale;

  return Math.round((value + Number.EPSILON) * multiplier) / multiplier;
}

function trimTrailingZeros(value: string) {
  return value.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");
}

function formatNumber(value: number, precision?: number, step?: number) {
  if (precision != null) {
    return value.toFixed(precision);
  }

  const scale = step == null ? getDecimalPlaces(value) : getDecimalPlaces(step);

  if (scale === 0) {
    return String(Math.round(value));
  }

  return trimTrailingZeros(roundToScale(value, scale).toFixed(scale));
}

function clampValue(value: number, min?: number, max?: number) {
  if (min != null && value < min) {
    return min;
  }

  if (max != null && value > max) {
    return max;
  }

  return value;
}

function sanitizeValue(value: string, allowDecimal: boolean) {
  const sign = value.startsWith("-") ? "-" : "";
  const unsigned = value.replace(/-/g, "");

  if (!allowDecimal) {
    return `${sign}${unsigned.replace(/\D/g, "")}`;
  }

  const [integer = "", ...decimalParts] = unsigned.split(".");
  const decimal = decimalParts.join("").replace(/\D/g, "");
  const normalizedInteger = integer.replace(/\D/g, "");

  return decimalParts.length > 0
    ? `${sign}${normalizedInteger}.${decimal}`
    : `${sign}${normalizedInteger}`;
}

function NumberInput({
  allowDecimal = false,
  className,
  disabled,
  leftIcon,
  max,
  min,
  onBlur,
  onKeyDown,
  onNumberChange,
  onValueChange,
  precision,
  step = allowDecimal ? 0.01 : 1,
  value,
  ...props
}: NumberInputProps) {
  const stringValue = value == null ? "" : String(value);
  const numericValue = Number(stringValue);

  const commitValue = (nextValue: string) => {
    onValueChange?.(nextValue);

    if (nextValue === "" || nextValue === "-" || nextValue === ".") {
      onNumberChange?.(undefined);
      return;
    }

    const parsed = Number(nextValue);
    onNumberChange?.(Number.isFinite(parsed) ? parsed : undefined);
  };

  const stepValue = (direction: 1 | -1) => {
    const baseValue = Number.isFinite(numericValue) ? numericValue : 0;
    const scale = Math.max(getDecimalPlaces(step), precision ?? 0);
    const nextValue = clampValue(
      roundToScale(baseValue + step * direction, scale),
      min,
      max,
    );
    commitValue(formatNumber(nextValue, precision, step));
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode={allowDecimal ? "decimal" : "numeric"}
      disabled={disabled}
      value={stringValue}
      leftIcon={leftIcon}
      className={cn("tabular-nums", className)}
      onChange={(event) => {
        commitValue(sanitizeValue(event.target.value, allowDecimal));
      }}
      onBlur={(event) => {
        if (stringValue !== "" && stringValue !== "-") {
          const parsed = Number(stringValue);
          if (Number.isFinite(parsed)) {
            commitValue(
              formatNumber(clampValue(parsed, min, max), precision, step),
            );
          }
        }

        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented) {
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          stepValue(1);
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          stepValue(-1);
        }
      }}
    />
  );
}

export { NumberInput };
