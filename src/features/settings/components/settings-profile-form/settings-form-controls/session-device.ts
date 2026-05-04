import type { AuthSession } from "@/shared/schemas";
import { LaptopMinimal, Smartphone, type LucideIcon } from "lucide-react";

function getBrowserName(userAgent: string) {
  if (userAgent.includes("edg/")) {
    return "Microsoft Edge";
  }

  if (userAgent.includes("opr/") || userAgent.includes("opera")) {
    return "Opera";
  }

  if (userAgent.includes("firefox/")) {
    return "Firefox";
  }

  if (userAgent.includes("chrome/") || userAgent.includes("crios/")) {
    return "Chrome";
  }

  if (userAgent.includes("safari/")) {
    return "Safari";
  }

  return "Browser";
}

function getPlatformName(userAgent: string) {
  if (userAgent.includes("windows")) {
    return "Windows";
  }

  if (userAgent.includes("mac os") || userAgent.includes("macintosh")) {
    return "macOS";
  }

  if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
    return "iOS";
  }

  if (userAgent.includes("android")) {
    return "Android";
  }

  if (userAgent.includes("linux")) {
    return "Linux";
  }

  return "Unknown device";
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
