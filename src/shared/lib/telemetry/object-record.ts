import type { UnknownRecord } from "@/shared/lib/telemetry/telemetry-types";

export function isObjectRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object";
}

export function readProperty(source: unknown, key: PropertyKey) {
  return isObjectRecord(source) && key in source ? source[key] : undefined;
}

export function readNumberProperty(source: unknown, key: PropertyKey) {
  const value = readProperty(source, key);

  return typeof value === "number" ? value : undefined;
}

export function readStringProperty(source: unknown, key: PropertyKey) {
  const value = readProperty(source, key);

  return typeof value === "string" ? value : undefined;
}
