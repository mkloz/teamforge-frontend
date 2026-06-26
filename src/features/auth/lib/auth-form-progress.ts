import type {
  LoginValues,
  RegisterValues,
} from "@/features/auth/schemas/auth-schemas";

const LOGIN_FIELD_MIN_LENGTH = 3;

type ProgressRule<TValues> = (values: Partial<TValues>) => boolean;

const LOGIN_PROGRESS_RULES: ReadonlyArray<ProgressRule<LoginValues>> = [
  (values) => hasMinimumTextLength(values.email, LOGIN_FIELD_MIN_LENGTH),
  (values) => hasMinimumTextLength(values.password, LOGIN_FIELD_MIN_LENGTH),
];

const REGISTER_PROGRESS_RULES: ReadonlyArray<ProgressRule<RegisterValues>> = [
  (values) => hasMinimumTextLength(values.name, 2),
  (values) => hasMinimumTextLength(values.email, 4),
  (values) => hasMinimumTextLength(values.password, 5),
  (values) => values.otp?.length === 6,
  (values) => hasAgeValue(values.age),
  (values) => hasMinimumTextLength(values.city, 2),
  (values) => hasMinimumTextLength(values.gender, 1),
];

function hasMinimumTextLength(value: string | undefined, minLength: number) {
  return Boolean(value && value.length > minLength);
}

function hasAgeValue(value: RegisterValues["age"] | undefined) {
  return value !== undefined && value !== null && String(value) !== "";
}

function countCompletedRules<TValues>(
  values: Partial<TValues>,
  rules: ReadonlyArray<ProgressRule<TValues>>,
) {
  return rules.reduce((completedCount, rule) => {
    return rule(values) ? completedCount + 1 : completedCount;
  }, 0);
}

function calculateProgressRatio<TValues>(
  values: Partial<TValues>,
  rules: ReadonlyArray<ProgressRule<TValues>>,
) {
  return Math.min(countCompletedRules(values, rules) / rules.length, 1);
}

export function calculateLoginProgress(values: Partial<LoginValues>) {
  return calculateProgressRatio(values, LOGIN_PROGRESS_RULES);
}

export function calculateRegisterProgress(values: Partial<RegisterValues>) {
  return calculateProgressRatio(values, REGISTER_PROGRESS_RULES);
}
