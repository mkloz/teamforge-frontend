import { Component, type ErrorInfo, type ReactNode } from "react";

import { warnInDevelopment } from "@/shared/lib/development-warning";

interface DatePickerBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface DatePickerBoundaryState {
  failed: boolean;
}

export class DatePickerBoundary extends Component<
  DatePickerBoundaryProps,
  DatePickerBoundaryState
> {
  state: DatePickerBoundaryState = { failed: false };

  static getDerivedStateFromError(): DatePickerBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    warnInDevelopment("Accessible date picker failed to load.", {
      error,
      errorInfo,
    });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
