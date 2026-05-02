export const PASSWORD_STRENGTH_LEVELS = [
  { score: 0 as const, label: "", colorClassName: "" },
  {
    score: 1 as const,
    label: "Weak",
    colorClassName: "bg-destructive text-destructive",
  },
  {
    score: 2 as const,
    label: "Good",
    colorClassName: "bg-spark-amber text-spark-amber",
  },
  {
    score: 3 as const,
    label: "Strong",
    colorClassName: "bg-forge-teal text-forge-teal",
  },
] as const;

export type PasswordStrength = (typeof PASSWORD_STRENGTH_LEVELS)[number];

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return PASSWORD_STRENGTH_LEVELS[0];

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9!@#$%^&*]/.test(password)) score++;

  return PASSWORD_STRENGTH_LEVELS[score];
}
