const API_BASE = '/api';

export interface ApiFetchOptions extends RequestInit {
  workspaceId?: string;
}

export async function apiFetch<T>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { workspaceId, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers || {});
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (workspaceId) {
    headers.set('x-workspace-id', workspaceId);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...fetchOptions,
    headers,
    credentials: 'include', // Ensure session cookies are transmitted
  });

  if (res.headers.get('content-type')?.includes('text/csv')) {
    return (await res.text()) as unknown as T;
  }

  let json: any;
  try {
    json = await res.json();
  } catch {
    json = { success: false, error: { message: `HTTP Error ${res.status}: ${res.statusText}` } };
  }

  if (!res.ok || !json.success) {
    const errorMsg = json.error?.message || `Request failed with status ${res.status}`;
    const err: any = new Error(errorMsg);
    err.status = res.status;
    err.code = json.error?.code;
    err.details = json.error?.details;
    throw err;
  }

  return json.data as T;
}
