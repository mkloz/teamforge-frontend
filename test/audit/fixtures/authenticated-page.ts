import type { Page } from "@playwright/test";
import {
  collectRouteBrowserSignals,
  type RouteBrowserSignals,
} from "../assertions/network";

export function collectAuthenticatedPageSignals(
  page: Page,
): RouteBrowserSignals {
  return collectRouteBrowserSignals(page);
}
