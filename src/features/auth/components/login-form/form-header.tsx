export function FormHeader() {
  return (
    <div className="mb-6 flex flex-col items-center sm:mb-8">
      <h1 className="text-balance text-center font-display font-extrabold text-2xl text-ink leading-tight tracking-tight sm:text-4xl">
        Welcome back.
      </h1>
      <p className="mt-1 text-center font-sans text-slate-muted text-xs sm:mt-2 sm:text-base">
        Sign in to see your groups, messages, and plans.
      </p>
    </div>
  );
}
