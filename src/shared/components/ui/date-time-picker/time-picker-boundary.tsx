import { Component, type ErrorInfo, type ReactNode } from "react";

import { warnInDevelopment } from "@/shared/lib/development-warning";

interface TimePickerBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface TimePickerBoundaryState {
  failed: boolean;
}

export class TimePickerBoundary extends Component<
  TimePickerBoundaryProps,
  TimePickerBoundaryState
> {
  state: TimePickerBoundaryState = { failed: false };

  static getDerivedStateFromError(): TimePickerBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    warnInDevelopment("Accessible time picker failed to load.", {
      error,
      errorInfo,
    });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
