import { storage, StorageKeys } from './storage';
import { mockHandler } from './mockBackend';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? '';
const USE_MOCK = !BASE_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  signal?: AbortSignal;
  /** Skip auth header (e.g. /auth/login). */
  anonymous?: boolean;
};

function buildUrl(path: string, query?: ApiOptions['query']): string {
  const base = BASE_URL || 'mock://local';
  const url = new URL(path.startsWith('/') ? path.slice(1) : path, `${base}/`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v == null) continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

function getAuthHeader(): Record<string, string> {
  const token = storage.getString(StorageKeys.AuthToken);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { method = 'GET', body, query, signal, anonymous } = options;

  if (USE_MOCK) {
    return mockHandler<T>(path, { method, body, query });
  }

  const url = buildUrl(path, query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(anonymous ? {} : getAuthHeader()),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  const text = await res.text();
  const parsed: unknown = text ? safeJSON(text) : undefined;

  if (!res.ok) {
    const message =
      typeof parsed === 'object' && parsed && 'message' in parsed
        ? String((parsed as { message: unknown }).message)
        : res.statusText;
    throw new ApiError(res.status, message, parsed);
  }

  return parsed as T;
}

function safeJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const apiInfo = {
  baseUrl: BASE_URL || '(mock)',
  isMock: USE_MOCK,
};
