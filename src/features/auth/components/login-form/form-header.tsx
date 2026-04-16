export function FormHeader() {
  return (
    <div className="flex flex-col items-center mb-6 sm:mb-8">
      <h1 className="font-sans text-2xl sm:text-4xl font-extrabold text-ink leading-tight text-balance text-center tracking-tight">
        Welcome back! Ready for your next forge
        <span className="text-forge-teal">?</span>
      </h1>
      <p className="font-sans text-xs sm:text-base text-slate-muted mt-1 sm:mt-2 text-center">
        Jump back in and find your people.
      </p>
    </div>
  );
}
