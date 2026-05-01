/**
 * Random value generation utilities.
 * Exported as standalone functions instead of a static-only class.
 */

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomArray<T>(length: number, generator: () => T): T[] {
  return Array.from({ length }, generator);
}

export function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export function getRandomDate(): string {
  return new Date(
    Date.now() - getRandomInt(0, 100) * 24 * 60 * 60 * 1000,
  ).toISOString();
}

export function getRandomBoolean(): boolean {
  return Math.random() < 0.5;
}

export function getRandomString(): string {
  return Math.random().toString(36).substring(7);
}

export function getUuid(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return [
    hex.slice(0, 4).join(""),
    hex.slice(4, 6).join(""),
    hex.slice(6, 8).join(""),
    hex.slice(8, 10).join(""),
    hex.slice(10, 16).join(""),
  ].join("-");
}

/** Alias for `getUuid()`. */
export const getId = getUuid;
