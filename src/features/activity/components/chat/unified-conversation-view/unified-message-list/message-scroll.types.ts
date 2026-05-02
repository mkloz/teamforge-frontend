export interface ScrollToMessageOptions {
  highlight?: boolean;
}

export interface MessageScrollHandle {
  scrollToMessage: (id: string, options?: ScrollToMessageOptions) => void;
}
