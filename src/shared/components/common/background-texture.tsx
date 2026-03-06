/**
 * Decorative background texture with noise overlay and radial gradients.
 * Shared between auth-page and personality-test-page.
 */
export function BackgroundTexture() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Teal radial – top-left */}
      <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-60 mix-blend-multiply blur-3xl lg:opacity-40 lg:blur-[100px] bg-[radial-gradient(circle,rgba(13,148,136,0.12)_0%,transparent_70%)]" />

      {/* Amber radial – bottom-right */}
      <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-60 mix-blend-multiply blur-3xl lg:opacity-40 lg:blur-[100px] bg-[radial-gradient(circle,rgba(245,158,11,0.08)_0%,transparent_70%)]" />
    </div>
  );
}
