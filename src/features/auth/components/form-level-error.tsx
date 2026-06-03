import { Notice } from "@/shared/components/ui/notice";

interface FormLevelErrorProps {
  message: string;
}

export function FormLevelError({ message }: FormLevelErrorProps) {
  return (
    <Notice
      role="alert"
      tone="danger"
      size="xs"
      className="mb-4 items-center px-3.5 py-2.5"
    >
      {message}
    </Notice>
  );
}
