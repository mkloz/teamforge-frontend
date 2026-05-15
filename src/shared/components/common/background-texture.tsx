/**
 * Decorative background texture with noise overlay, radial gradients, and a subtle dotted grid.
 * Shared between auth-page and personality-test-page.
 */
export function BackgroundTexture() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-canvas"
      aria-hidden="true"
    >
      <div className="mask-[radial-gradient(circle,transparent_30%,black_80%)] absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--color-slate-muted)_32%,transparent)_1px,transparent_0)] bg-size-[32px_32px] opacity-5 [-webkit-mask-image:radial-gradient(circle,transparent_30%,black_80%)]" />
    </div>
  );
}
