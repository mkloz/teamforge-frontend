import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "micro",
            "nano",
            "display-xs",
            "display-sm",
            "display-md",
            "display-lg",
          ],
        },
      ],
      "border-w": ["border-thin", "border-thick"],
      rounded: ["rounded-4xl"],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
