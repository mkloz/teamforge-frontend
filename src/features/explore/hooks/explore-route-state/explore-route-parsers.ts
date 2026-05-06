import {
  createParser,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

import { explorePanelValues } from "@/features/explore/lib/explore-route";
import {
  CATEGORIES,
  FILTER_BOUNDARIES,
} from "@/features/explore/constants/explore.constants";

const categoryValues = CATEGORIES.map((category) => category.id);
const locationValues = ["ALL", "IN_PERSON", "ONLINE"] as const;
const accessValues = ["ALL", "OPEN", "BY_REQUEST"] as const;
const sortValues = ["MATCH", "SOONEST", "NEWEST"] as const;

const parseAsSizeRange = createParser({
  parse(value) {
    const [min, max] = value.split("-").map((part) => Number(part));

    if (
      !Number.isInteger(min) ||
      !Number.isInteger(max) ||
      min > max ||
      min < FILTER_BOUNDARIES.size.min ||
      max > FILTER_BOUNDARIES.size.max
    ) {
      return null;
    }

    return [min, max] as [number, number];
  },
  serialize(value) {
    return `${value[0]}-${value[1]}`;
  },
});

const parseAsDistance = createParser({
  parse(value) {
    const distance = Number(value);

    if (
      !Number.isInteger(distance) ||
      distance < FILTER_BOUNDARIES.distance.min ||
      distance > FILTER_BOUNDARIES.distance.max
    ) {
      return null;
    }

    return distance;
  },
  serialize(value) {
    return String(value);
  },
});

export const exploreRouteParsers = {
  access: parseAsStringLiteral(accessValues),
  category: parseAsArrayOf(parseAsStringLiteral(categoryValues)),
  distance: parseAsDistance,
  location: parseAsStringLiteral(locationValues),
  panel: parseAsStringLiteral(explorePanelValues),
  q: parseAsString,
  request: parseAsString,
  size: parseAsSizeRange,
  sort: parseAsStringLiteral(sortValues),
};
