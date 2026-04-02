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

      {/* Ultra-soft Diffusion Gradients */}
      <div className="absolute -top-[5%] -left-[5%] w-[60%] h-[60%] rounded-full opacity-[0.03] blur-[120px] bg-forge-teal" />
      <div className="absolute bottom-[0%] -right-[5%] w-[50%] h-[50%] rounded-full opacity-[0.03] blur-[120px] bg-spark-amber" />

      {/* Paper Grain - Very subtle */}
      <div className="absolute inset-0 opacity-[0.008] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
    </div>
  );
}
