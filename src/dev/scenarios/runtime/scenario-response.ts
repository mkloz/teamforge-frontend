export function scenarioJson(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  headers.set("x-request-id", "scenario-request");

  return Response.json(body, { ...init, headers });
}

export function scenarioPage(items: unknown[] = [], limit = 50) {
  return {
    items,
    meta: {
      currentPage: 1,
      itemsPerPage: limit,
      totalItemsCount: items.length,
      totalPages: 1,
    },
  };
}
