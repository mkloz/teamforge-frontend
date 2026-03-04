/**
 * Random value generation utilities.
 * Exported as standalone functions instead of a static-only class.
 */
import { v4 } from "uuid";

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
  return v4();
}

/** Alias for `getUuid()`. */
export const getId = getUuid;
