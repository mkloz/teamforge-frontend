import { createContext } from "react";

export const EMPTY_EMOJI_OPTIONS: readonly string[] = [];

export const SelectedEmojiContext =
  createContext<readonly string[]>(EMPTY_EMOJI_OPTIONS);
