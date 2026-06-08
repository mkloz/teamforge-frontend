export function FormHeader() {
  return (
    <div className="mb-6 flex flex-col items-center sm:mb-8">
      <h1 className="text-balance text-center font-extrabold font-sans text-2xl text-ink leading-tight tracking-tight sm:text-4xl">
        Welcome back! Ready for your next forge
        <span className="text-forge-teal">?</span>
      </h1>
      <p className="mt-1 text-center font-sans text-slate-muted text-xs sm:mt-2 sm:text-base">
        Jump back in and find your people.
      </p>
    </div>
  );
}
