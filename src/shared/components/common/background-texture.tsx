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
      <div className="auth-background-dot-grid absolute inset-0 opacity-5" />
    </div>
  );
}
