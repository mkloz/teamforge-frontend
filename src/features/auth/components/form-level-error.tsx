interface FormLevelErrorProps {
  message: string;
}

export function FormLevelError({ message }: FormLevelErrorProps) {
  return (
    <div className="mb-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-destructive/20 bg-destructive/5">
      <span className="text-destructive text-xs font-medium">{message}</span>
    </div>
  );
}
