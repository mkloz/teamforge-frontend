import type { TabValue } from "./types";

export function getFriendsTabId(idBase: string, tab: TabValue) {
  return `${idBase}-${tab}-tab`;
}

export function getFriendsTabPanelId(idBase: string) {
  return `${idBase}-panel`;
}
