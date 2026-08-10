import type { Interest } from "@/shared/schemas";
import type { CurrentUser } from "@/shared/schemas/user-response";

export function createUser(overrides: Partial<CurrentUser> = {}): CurrentUser {
  return {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    avatar: null,
    bio: null,
    authProvider: "EMAIL",
    emailVerified: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    age: 24,
    gender: null,
    city: "London",
    personalityType: null,
    oceanO: null,
    oceanC: null,
    oceanE: null,
    oceanA: null,
    oceanN: null,
    searchStatus: "IDLE",
    signInMethods: { google: false, password: true },
    trustScore: 80,
    profileComplete: true,
    role: "USER",
    interests: [],
    ...overrides,
  };
}

export function createInterest(
  name: string,
  aliases: string[] = [],
  overrides: Partial<Interest> = {},
): Interest {
  const id = overrides.id ?? name;

  return {
    id,
    name,
    slug: id.toLowerCase().replaceAll(" ", "-"),
    description: null,
    icon: null,
    color: null,
    sortOrder: 0,
    isActive: true,
    parentId: null,
    aliases,
    ...overrides,
  };
}
