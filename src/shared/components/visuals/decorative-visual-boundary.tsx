import { Component, type ErrorInfo, type ReactNode } from "react";
import { warnInDevelopment } from "@/shared/lib/development-warning";

interface DecorativeVisualBoundaryProps {
  children: ReactNode;
}

interface DecorativeVisualBoundaryState {
  failed: boolean;
}

export class DecorativeVisualBoundary extends Component<
  DecorativeVisualBoundaryProps,
  DecorativeVisualBoundaryState
> {
  state: DecorativeVisualBoundaryState = { failed: false };

  static getDerivedStateFromError(): DecorativeVisualBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    warnInDevelopment("An optional decorative visual failed to load.", {
      error,
      errorInfo,
    });
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
