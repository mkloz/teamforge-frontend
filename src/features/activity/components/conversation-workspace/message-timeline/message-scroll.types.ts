import type { ProgrammaticScrollIntent } from "@/shared/lib/browser-scroll";

export interface ScrollToMessageOptions {
  highlight?: boolean;
  intent?: ProgrammaticScrollIntent;
}

export interface MessageScrollHandle {
  scrollToMessage: (id: string, options?: ScrollToMessageOptions) => void;
}

export type ScrollToMessage = MessageScrollHandle["scrollToMessage"];
