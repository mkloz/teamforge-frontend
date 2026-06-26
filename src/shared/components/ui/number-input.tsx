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

type StepDirection = 1 | -1;

const EMPTY_NUMBER_INPUT_VALUES = new Set(["", "-", "."]);

function getExponentialDecimalPlaces(valueString: string) {
  if (!valueString.includes("e-")) {
    return null;
  }

  return Number(valueString.split("e-")[1] ?? 0);
}

function getFractionDecimalPlaces(valueString: string) {
  return valueString.split(".")[1]?.length ?? 0;
}

function getDecimalPlaces(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  const valueString = String(value);
  const exponentialPlaces = getExponentialDecimalPlaces(valueString);

  return exponentialPlaces ?? getFractionDecimalPlaces(valueString);
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

function parseNumberInputValue(value: string) {
  if (EMPTY_NUMBER_INPUT_VALUES.has(value)) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function getBlurCommitValue({
  max,
  min,
  precision,
  step,
  value,
}: {
  max?: number;
  min?: number;
  precision?: number;
  step: number;
  value: string;
}) {
  const parsed = parseNumberInputValue(value);

  return parsed == null
    ? null
    : formatNumber(clampValue(parsed, min, max), precision, step);
}

function getStepDirection(key: string): StepDirection | null {
  if (key === "ArrowUp") {
    return 1;
  }

  if (key === "ArrowDown") {
    return -1;
  }

  return null;
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
    onNumberChange?.(parseNumberInputValue(nextValue));
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
        const blurCommitValue = getBlurCommitValue({
          max,
          min,
          precision,
          step,
          value: stringValue,
        });

        if (blurCommitValue !== null) {
          commitValue(blurCommitValue);
        }

        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);

        if (event.defaultPrevented) {
          return;
        }

        const stepDirection = getStepDirection(event.key);

        if (stepDirection !== null) {
          event.preventDefault();
          stepValue(stepDirection);
        }
      }}
    />
  );
}

export { NumberInput };
