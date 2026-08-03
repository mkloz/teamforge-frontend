export function scenarioJson(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("x-request-id", "scenario-request");

  return Response.json(body, { ...init, headers });
}

export function scenarioPage(items: unknown[] = [], limit = 50, page = 1) {
  const normalizedLimit = Math.max(1, Math.trunc(limit));
  const totalPages = Math.max(1, Math.ceil(items.length / normalizedLimit));
  const currentPage = Math.min(totalPages, Math.max(1, Math.trunc(page)));
  const startIndex = (currentPage - 1) * normalizedLimit;

  return {
    items: items.slice(startIndex, startIndex + normalizedLimit),
    meta: {
      currentPage,
      itemsPerPage: normalizedLimit,
      totalItemsCount: items.length,
      totalPages,
    },
  };
}
