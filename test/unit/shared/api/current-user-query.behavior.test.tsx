// @vitest-environment jsdom

import { createUser } from "@test/support/factories/user";
import { apiRoute } from "@test/support/msw/api";
import { server } from "@test/support/msw/server";
import { renderWithQueryClient } from "@test/support/render";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { authApi } from "@/shared/api/api";
import {
  useCurrentUserQuery,
  useInvalidateCurrentUser,
} from "@/shared/api/current-user-query";

function CurrentUserProbe() {
  const currentUserQuery = useCurrentUserQuery();
  const invalidateCurrentUser = useInvalidateCurrentUser();

  return (
    <section aria-label="current user probe">
      <p>
        {currentUserQuery.fetchStatus === "fetching"
          ? "Loading profile"
          : (currentUserQuery.data?.name ?? "Signed out")}
      </p>
      <button onClick={invalidateCurrentUser} type="button">
        Refresh profile
      </button>
    </section>
  );
}

describe("useCurrentUserQuery behavior", () => {
  it("loads and refreshes the current user through the app query hook", async () => {
    let requestCount = 0;
    const user = userEvent.setup();

    authApi.setTokens({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });

    server.use(
      http.get(apiRoute("users/me"), () => {
        requestCount += 1;

        return HttpResponse.json(
          createUser({
            id: "user-current",
            name: requestCount === 1 ? "Avery Stone" : "Morgan Lee",
          }),
        );
      }),
    );

    renderWithQueryClient(<CurrentUserProbe />);

    expect(screen.getByText("Loading profile")).toBeInTheDocument();
    expect(await screen.findByText("Avery Stone")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Refresh profile" }));

    expect(await screen.findByText("Morgan Lee")).toBeInTheDocument();
    expect(requestCount).toBe(2);
  });

  it("does not request the current user without an auth session", () => {
    let requestCount = 0;

    server.use(
      http.get(apiRoute("users/me"), () => {
        requestCount += 1;

        return HttpResponse.json(createUser());
      }),
    );

    renderWithQueryClient(<CurrentUserProbe />);

    expect(screen.getByText("Signed out")).toBeInTheDocument();
    expect(requestCount).toBe(0);
  });
});
