import type { PasswordStrength } from "./password-strength";

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
}

export function PasswordStrengthMeter({
  strength,
}: PasswordStrengthMeterProps) {
  if (!strength.label) {
    return null;
  }

  const [meterColorClassName, labelColorClassName] =
    strength.colorClassName.split(" ");

  return (
    <div className="mt-1 pb-1">
      <div className="flex h-1 gap-1">
        {[1, 2, 3].map((segment) => (
          <div
            key={segment}
            className={`flex-1 rounded-full transition-[background-color] duration-300 ${
              strength.score >= segment ? meterColorClassName : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className={`mt-1 text-xs font-medium ${labelColorClassName}`}>
        {strength.label}
      </p>
    </div>
  );
}
