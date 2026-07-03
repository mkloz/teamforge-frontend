export function getSearchRecord(searchParams: URLSearchParams) {
  const search: Record<string, unknown> = {};

  searchParams.forEach((value, key) => {
    appendSearchRecordValue(search, key, value);
  });

  return search;
}

function appendSearchRecordValue(
  search: Record<string, unknown>,
  key: string,
  value: string,
) {
  const existingValue = search[key];

  if (existingValue === undefined) {
    search[key] = value;
    return;
  }

  search[key] = Array.isArray(existingValue)
    ? [...existingValue, value]
    : [existingValue, value];
}
