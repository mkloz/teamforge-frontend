const PASSWORD_STRENGTH_LEVELS = [
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

const PASSWORD_STRENGTH_RULES = [
  (password: string) => password.length >= 8,
  (password: string) => /[A-Z]/.test(password) && /[a-z]/.test(password),
  (password: string) => /[0-9!@#$%^&*]/.test(password),
] as const;

export type PasswordStrength = (typeof PASSWORD_STRENGTH_LEVELS)[number];

export function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return PASSWORD_STRENGTH_LEVELS[0];

  const score = getPasswordStrengthScore(password);

  return PASSWORD_STRENGTH_LEVELS[score];
}

function getPasswordStrengthScore(password: string) {
  return PASSWORD_STRENGTH_RULES.reduce(
    (score, rule) => score + (rule(password) ? 1 : 0),
    0,
  );
}
