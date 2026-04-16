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
      {/* Ultra-subtle 32px Dotted Grid - Slate color for lower contrast */}
      <div
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)`,
          backgroundSize: "32px 32px",
          WebkitMaskImage:
            "radial-gradient(circle, transparent 30%, black 80%)",
          maskImage: "radial-gradient(circle, transparent 30%, black 80%)",
        }}
      />
    </div>
  );
}
