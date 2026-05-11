import { AuthPageLoading } from "@/features/auth/auth-page.loading";

const AUTH_CAPTURE_VARIANTS = [
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "activate",
] as const;

export function AuthSkeletonCapture() {
  return (
    <main className="bg-canvas">
      {AUTH_CAPTURE_VARIANTS.map((variant) => (
        <section className="min-h-screen" key={variant}>
          <AuthPageLoading mode="route" variant={variant} />
        </section>
      ))}
    </main>
  );
}
