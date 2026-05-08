interface FormLevelErrorProps {
  message: string;
}

export function FormLevelError({ message }: FormLevelErrorProps) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3.5 py-2.5">
      <span className="font-medium text-destructive text-xs">{message}</span>
    </div>
  );
}
