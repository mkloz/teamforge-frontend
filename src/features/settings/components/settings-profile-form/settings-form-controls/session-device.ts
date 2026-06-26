import { LaptopMinimal, type LucideIcon, Smartphone } from "lucide-react";
import type { AuthSession } from "@/shared/schemas";

interface UserAgentLabelRule {
  label: string;
  matches: (userAgent: string) => boolean;
}

const BROWSER_LABEL_RULES: UserAgentLabelRule[] = [
  { label: "Microsoft Edge", matches: includesAny("edg/") },
  { label: "Opera", matches: includesAny("opr/", "opera") },
  { label: "Firefox", matches: includesAny("firefox/") },
  { label: "Chrome", matches: includesAny("chrome/", "crios/") },
  { label: "Safari", matches: includesAny("safari/") },
];

const PLATFORM_LABEL_RULES: UserAgentLabelRule[] = [
  { label: "Windows", matches: includesAny("windows") },
  { label: "macOS", matches: includesAny("mac os", "macintosh") },
  { label: "iOS", matches: includesAny("iphone", "ipad") },
  { label: "Android", matches: includesAny("android") },
  { label: "Linux", matches: includesAny("linux") },
];

function includesAny(...needles: string[]) {
  return (userAgent: string) =>
    needles.some((needle) => userAgent.includes(needle));
}

function getUserAgentLabel(
  userAgent: string,
  rules: UserAgentLabelRule[],
  fallback: string,
) {
  return rules.find((rule) => rule.matches(userAgent))?.label ?? fallback;
}

function getBrowserName(userAgent: string) {
  return getUserAgentLabel(userAgent, BROWSER_LABEL_RULES, "Browser");
}

function getPlatformName(userAgent: string) {
  return getUserAgentLabel(userAgent, PLATFORM_LABEL_RULES, "Unknown device");
}

export function describeSessionDevice(session: AuthSession): {
  label: string;
  icon: LucideIcon;
} {
  const userAgent = session.userAgent?.toLowerCase() ?? "";
  const isMobile =
    userAgent.includes("iphone") ||
    userAgent.includes("android") ||
    userAgent.includes("mobile");

  return {
    label: `${getBrowserName(userAgent)} on ${getPlatformName(userAgent)}`,
    icon: isMobile ? Smartphone : LaptopMinimal,
  };
}
