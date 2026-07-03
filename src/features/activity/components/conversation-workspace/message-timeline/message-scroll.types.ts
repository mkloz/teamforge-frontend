export interface ScrollToMessageOptions {
  behavior?: ScrollBehavior;
  highlight?: boolean;
}

export interface MessageScrollHandle {
  scrollToMessage: (id: string, options?: ScrollToMessageOptions) => void;
}

export type ScrollToMessage = MessageScrollHandle["scrollToMessage"];
