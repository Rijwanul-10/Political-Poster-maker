const API_BASE = 
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim().replace(/\/$/, '') || 
  'http://localhost:5000';

interface ApiOptions extends RequestInit {
  token?: string | null;
  body?: any;
}

export async function apiFetch<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, body, headers = {}, ...rest } = options;

  const url = `${API_BASE}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  let formattedBody = body;
  if (body && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json';
    formattedBody = JSON.stringify(body);
  }

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...rest,
    headers: requestHeaders,
    body: formattedBody,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export { API_BASE };
