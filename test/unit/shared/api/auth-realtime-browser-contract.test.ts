import { apiRoute } from "@test/support/msw/api";
import { server } from "@test/support/msw/server";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { AuthApi } from "@/features/auth/api/auth.api";
import { realtimeGroupProposalUpdatedPayloadSchema } from "@/shared/schemas/realtime";

describe("auth and realtime browser contract", () => {
  it("exchanges a Google authorization code at the exact login route", async () => {
    let capturedBody: unknown;
    let requestedWith: string | null = null;

    server.use(
      http.post(apiRoute("auth/google/login"), async ({ request }) => {
        capturedBody = await request.json();
        requestedWith = request.headers.get("X-Requested-With");
        return HttpResponse.json({
          accessToken: "access-token",
          isNewUser: false,
          refreshToken: "refresh-token",
        });
      }),
    );

    await expect(
      AuthApi.loginWithGoogle("authorization-code", "login"),
    ).resolves.toMatchObject({
      data: { accessToken: "access-token", isNewUser: false },
      requestId: null,
    });
    expect(capturedBody).toEqual({
      code: "authorization-code",
      intent: "login",
    });
    expect(requestedWith).toBe("XmlHttpRequest");
  });

  it("sends the exact popup-exchange header when linking Google", async () => {
    let requestedWith: string | null = null;

    server.use(
      http.post(apiRoute("auth/google/link"), ({ request }) => {
        requestedWith = request.headers.get("X-Requested-With");
        return HttpResponse.json({
          bio: null,
          city: "Leeds",
          email: "person@example.invalid",
          id: "00000000-0000-4000-8000-000000000001",
          locationLat: null,
          locationLng: null,
          name: "Sam",
        });
      }),
    );

    await AuthApi.linkGoogleAccount("authorization-code").catch(() => null);
    expect(requestedWith).toBe("XmlHttpRequest");
  });

  it("accepts only the exact group-proposal.updated payload shape", () => {
    const payload = {
      entityKey: "group-proposal:proposal-1",
      entityVersion: 2,
      eventId: "event-1",
      occurredAt: "2099-08-10T18:30:00.000Z",
      proposalId: "proposal-1",
      version: 2,
    };

    expect(realtimeGroupProposalUpdatedPayloadSchema.parse(payload)).toEqual(
      payload,
    );
    expect(
      realtimeGroupProposalUpdatedPayloadSchema.safeParse({
        ...payload,
        unrelatedId: payload.proposalId,
        proposalId: undefined,
      }).success,
    ).toBe(false);
  });
});
