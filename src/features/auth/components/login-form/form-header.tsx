export function FormHeader() {
  return (
    <div className="mb-6 flex flex-col items-center sm:mb-8">
      <h1 className="text-center font-sans text-2xl leading-tight font-extrabold tracking-tight text-balance text-ink sm:text-4xl">
        Welcome back! Ready for your next forge
        <span className="text-forge-teal">?</span>
      </h1>
      <p className="mt-1 text-center font-sans text-xs text-slate-muted sm:mt-2 sm:text-base">
        Jump back in and find your people.
      </p>
    </div>
  );
}
