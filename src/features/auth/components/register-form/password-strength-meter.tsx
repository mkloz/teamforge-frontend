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
      <div className="flex gap-1 h-1">
        {[1, 2, 3].map((segment) => (
          <div
            key={segment}
            className={`flex-1 rounded-full transition-[background-color] duration-300 ${
              strength.score >= segment ? meterColorClassName : "bg-border"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium mt-1 ${labelColorClassName}`}>
        {strength.label}
      </p>
    </div>
  );
}
