import { useState } from "react";
import { Eye, EyeOff, Loader2, ArrowLeft, ChevronDown } from "lucide-react";
import { TeamForgeLogo } from "@/assets/logo";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

type Step = 1 | 2;

function getPasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3;
  label: string;
  color: string;
} {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9!@#$%^&*]/.test(password)) score++;
  const levels = [
    { score: 0 as const, label: "", color: "" },
    { score: 1 as const, label: "Weak", color: "#EF4444" },
    { score: 2 as const, label: "Good", color: "#F59E0B" },
    { score: 3 as const, label: "Strong", color: "#0D9488" },
  ];
  return levels[score];
}

const GENDER_OPTIONS = [
  { value: "", label: "Select gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [step, setStep] = useState<Step>(1);
  const [transitioning, setTransitioning] = useState(false);

  // Step 1
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step1Errors, setStep1Errors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});

  // Step 2
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [step2Errors, setStep2Errors] = useState<{
    age?: string;
    city?: string;
    gender?: string;
  }>({});

  const [loading, setLoading] = useState(false);
  const strength = getPasswordStrength(password);

  function validateStep1() {
    const e: typeof step1Errors = {};
    if (!name.trim()) e.name = "Full name is required.";
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    else if (password.length < 6)
      e.password = "Password must be at least 6 characters.";
    return e;
  }

  function validateStep2() {
    const e: typeof step2Errors = {};
    if (!age) e.age = "Age is required.";
    else if (Number(age) < 16 || Number(age) > 99)
      e.age = "Enter a valid age (16–99).";
    if (!city.trim()) e.city = "City is required.";
    if (!gender) e.gender = "Please select a gender.";
    return e;
  }

  function goToStep2() {
    const v = validateStep1();
    if (Object.keys(v).length > 0) {
      setStep1Errors(v);
      return;
    }
    setStep1Errors({});
    setTransitioning(true);
    setTimeout(() => {
      setStep(2);
      setTransitioning(false);
    }, 260);
  }

  function goBack() {
    setTransitioning(true);
    setTimeout(() => {
      setStep(1);
      setTransitioning(false);
    }, 260);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = validateStep2();
    if (Object.keys(v).length > 0) {
      setStep2Errors(v);
      return;
    }
    setStep2Errors({});
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
  }

  const inputBase =
    "w-full h-11 px-3.5 rounded-xl border font-sans text-sm text-ink placeholder:text-slate-muted bg-white outline-none transition-all duration-200";
  const inputNormal =
    "border-[#E5E7EB] focus:border-forge-teal focus:ring-2 focus:ring-[rgba(13,148,136,0.12)]";
  const inputError =
    "border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100";

  return (
    <div
      className="flex flex-col w-full"
      style={{
        animation: transitioning
          ? "auth-slide-left 0.25s ease-in forwards"
          : "auth-slide-right-in 0.3s ease-out forwards",
      }}
    >
      {/* Logo + title */}
      <div className="flex flex-col items-center mb-6">
        <TeamForgeLogo className="w-10 h-10 mb-4" showBackground={true} />
        <h1 className="font-sans text-2xl font-extrabold text-ink leading-tight text-balance text-center">
          {step === 1 ? "Create your account." : "Almost there."}
        </h1>
        <p className="font-sans text-sm text-slate-muted mt-1.5 text-center">
          {step === 1
            ? "Start with your credentials."
            : "A few details to build your profile."}
        </p>
      </div>

      {/* Step indicator */}
      <div
        className="flex items-center justify-center gap-2 mb-6"
        aria-label={`Step ${step} of 2`}
        role="progressbar"
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={2}
      >
        {[1, 2].map((s) => (
          <div
            key={s}
            className="rounded-full transition-all duration-300"
            style={{
              width: s === step ? 20 : 8,
              height: 8,
              background:
                s === step ? "#0D9488" : s < step ? "#0D9488" : "#E5E7EB",
              opacity: s < step ? 0.5 : 1,
            }}
          />
        ))}
      </div>

      {step === 1 ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            goToStep2();
          }}
          noValidate
          className="flex flex-col gap-4"
        >
          {/* Full name */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-name"
              className="font-sans text-xs font-semibold text-ink"
            >
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              placeholder="Alex Johnson"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (!name.trim())
                  setStep1Errors((p) => ({
                    ...p,
                    name: "Full name is required.",
                  }));
                else setStep1Errors((p) => ({ ...p, name: undefined }));
              }}
              aria-invalid={!!step1Errors.name}
              className={`${inputBase} ${step1Errors.name ? inputError : inputNormal}`}
            />
            {step1Errors.name && (
              <p className="text-xs font-medium text-red-500">
                {step1Errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-email"
              className="font-sans text-xs font-semibold text-ink"
            >
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                  setStep1Errors((p) => ({
                    ...p,
                    email: "Enter a valid email address.",
                  }));
                else setStep1Errors((p) => ({ ...p, email: undefined }));
              }}
              aria-invalid={!!step1Errors.email}
              className={`${inputBase} ${step1Errors.email ? inputError : inputNormal}`}
            />
            {step1Errors.email && (
              <p className="text-xs font-medium text-red-500">
                {step1Errors.email}
              </p>
            )}
          </div>

          {/* Password + strength */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-password"
              className="font-sans text-xs font-semibold text-ink"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => {
                  if (password && password.length < 6)
                    setStep1Errors((p) => ({
                      ...p,
                      password: "Password must be at least 6 characters.",
                    }));
                  else setStep1Errors((p) => ({ ...p, password: undefined }));
                }}
                aria-invalid={!!step1Errors.password}
                className={`${inputBase} pr-10 ${step1Errors.password ? inputError : inputNormal}`}
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-muted hover:text-forge-teal transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-1">
                <div className="flex gap-1 h-1">
                  {[1, 2, 3].map((seg) => (
                    <div
                      key={seg}
                      className="flex-1 rounded-full transition-all duration-300"
                      style={{
                        background:
                          strength.score >= seg ? strength.color : "#E5E7EB",
                      }}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p
                    className="text-xs font-medium mt-1"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </p>
                )}
              </div>
            )}
            {step1Errors.password && (
              <p className="text-xs font-medium text-red-500">
                {step1Errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl font-sans text-sm font-semibold text-white flex items-center justify-center transition-all duration-200 hover:scale-[1.01] mt-1"
            style={{
              background: "#0D9488",
              boxShadow: "0 4px 14px rgba(13,148,136,0.28)",
            }}
          >
            Continue
          </button>

          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-[#E5E7EB]" />
            <span className="font-sans text-xs text-slate-muted">
              or continue with
            </span>
            <div className="flex-1 h-px bg-[#E5E7EB]" />
          </div>

          <button
            type="button"
            className="w-full h-11 rounded-xl border border-[#E5E7EB] bg-white font-sans text-sm font-semibold text-ink flex items-center justify-center gap-2.5 hover:border-[#9CA3AF] transition-colors"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          {/* Age + City row */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="reg-age"
                className="font-sans text-xs font-semibold text-ink"
              >
                Age
              </label>
              <input
                id="reg-age"
                type="number"
                min="16"
                max="99"
                placeholder="22"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                aria-invalid={!!step2Errors.age}
                className={`${inputBase} ${step2Errors.age ? inputError : inputNormal}`}
              />
              {step2Errors.age && (
                <p className="text-xs font-medium text-red-500">
                  {step2Errors.age}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="reg-city"
                className="font-sans text-xs font-semibold text-ink"
              >
                City
              </label>
              <input
                id="reg-city"
                type="text"
                placeholder="Kyiv"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-invalid={!!step2Errors.city}
                className={`${inputBase} ${step2Errors.city ? inputError : inputNormal}`}
              />
              {step2Errors.city && (
                <p className="text-xs font-medium text-red-500">
                  {step2Errors.city}
                </p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="reg-gender"
              className="font-sans text-xs font-semibold text-ink"
            >
              Gender
            </label>
            <div className="relative">
              <select
                id="reg-gender"
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  if (e.target.value)
                    setStep2Errors((p) => ({ ...p, gender: undefined }));
                }}
                aria-invalid={!!step2Errors.gender}
                className={`${inputBase} appearance-none pr-9 cursor-pointer ${
                  step2Errors.gender ? inputError : inputNormal
                } ${!gender ? "text-slate-muted" : "text-ink"}`}
              >
                {GENDER_OPTIONS.map(({ value, label }) => (
                  <option
                    key={value}
                    value={value}
                    disabled={value === ""}
                    className="text-ink"
                  >
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-muted pointer-events-none"
                aria-hidden="true"
              />
            </div>
            {step2Errors.gender && (
              <p className="text-xs font-medium text-red-500">
                {step2Errors.gender}
              </p>
            )}
            <p className="text-xs text-slate-muted mt-0.5">
              Used for your profile only — not part of matching.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl font-sans text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100 mt-1"
            style={{
              background: "#0D9488",
              boxShadow: loading ? "none" : "0 4px 14px rgba(13,148,136,0.28)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              "Create Account"
            )}
          </button>

          <button
            type="button"
            onClick={goBack}
            className="flex items-center justify-center gap-1.5 font-sans text-sm font-medium text-slate-muted hover:text-ink transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </button>
        </form>
      )}

      <p className="font-sans text-sm text-slate-muted text-center mt-6">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="font-semibold text-forge-teal hover:underline"
        >
          Sign in
        </button>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}
