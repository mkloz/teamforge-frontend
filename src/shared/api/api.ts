import ky, { type HTTPError } from "ky";

import { config } from "@/config/config";

// TODO: Replace with actual imports once modules are implemented
export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
export const tokensStore = {
  getState: () => ({
    tokens: { accessToken: "", refreshToken: "" } as Tokens | null,
    deleteTokens: () => {},
    setTokens: (t: Tokens) => {
      void t;
    },
  }),
};
export const useSelectedProjectId = {
  getState: () => ({ clearId: () => {} }),
};

export const apiClient = ky.create({
  prefixUrl: config.apiUrl,
  hooks: {
    beforeRequest: [
      async (request) => {
        if (
          request.url.includes("auth/refresh") ||
          request.url.includes("auth/logout")
        )
          return request;

        const accessToken = tokensStore.getState().tokens?.accessToken;

        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
        return request;
      },
    ],
    beforeError: [
      async (error) => {
        return error.response.json<HTTPError>();
      },
    ],
    beforeRetry: [
      async ({ request, error }) => {
        if (request.url.includes("refresh")) {
          tokensStore.getState().deleteTokens();
          useSelectedProjectId.getState().clearId();
          window.location.href = "/";
          return;
        }
        if ("status" in error && error.status !== 401) return;
        const refreshToken = tokensStore.getState().tokens?.refreshToken;

        if (!refreshToken) return;

        const res = await apiClient
          .post("auth/refresh", {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          })
          .json<Tokens>();

        tokensStore.getState().setTokens(res);
        request.headers.set("Authorization", `Bearer ${res.accessToken}`);
      },
    ],
  },
  retry: {
    methods: ["get", "post", "put", "patch", "delete"],
    statusCodes: [401],
    limit: 2,
  },
});
