import {
  createParser,
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs";

import { explorePanelValues } from "@/features/explore/lib/explore-route";
import { CATEGORIES } from "@/features/explore/constants/explore.constants";

const categoryValues = CATEGORIES.map((category) => category.id);
const locationValues = ["ALL", "IN_PERSON", "ONLINE", "TBD"] as const;
const accessValues = ["ALL", "OPEN", "BY_REQUEST"] as const;
const sortValues = ["MATCH", "SOONEST", "NEWEST"] as const;

const parseAsSizeRange = createParser({
  parse(value) {
    const [min, max] = value.split("-").map((part) => Number(part));

    if (!Number.isInteger(min) || !Number.isInteger(max) || min > max) {
      return null;
    }

    return [min, max] as [number, number];
  },
  serialize(value) {
    return `${value[0]}-${value[1]}`;
  },
});

export const exploreRouteParsers = {
  access: parseAsStringLiteral(accessValues),
  category: parseAsArrayOf(parseAsStringLiteral(categoryValues)),
  distance: parseAsInteger,
  location: parseAsStringLiteral(locationValues),
  panel: parseAsStringLiteral(explorePanelValues),
  q: parseAsString,
  request: parseAsString,
  size: parseAsSizeRange,
  sort: parseAsStringLiteral(sortValues),
};
