let _activeBookId: string | null = null;

export function setActiveBookId(id: string | null) {
  _activeBookId = id;
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  if (_activeBookId) {
    headers.set("x-book-id", _activeBookId);
  }
  return fetch(url, { ...options, headers });
}
