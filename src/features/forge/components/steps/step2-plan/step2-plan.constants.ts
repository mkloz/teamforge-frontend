import { Globe, Home, Monitor } from "lucide-react";
import type { ElementType } from "react";

import type { LocationType } from "./types";

export const LOCATION_TYPES: Array<{
  id: LocationType;
  label: string;
  sub: string;
  Icon: ElementType;
}> = [
  {
    id: "IN_PERSON",
    label: "In person",
    sub: "Specific address",
    Icon: Home,
  },
  {
    id: "TBD",
    label: "To be decided",
    sub: "Confirm later",
    Icon: Globe,
  },
  {
    id: "ONLINE",
    label: "Virtual",
    sub: "Online meeting",
    Icon: Monitor,
  },
];
