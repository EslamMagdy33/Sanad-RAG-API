import type { components } from "./schema";

type ApiProblem = components["schemas"]["ApiProblem"];

export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:5152";

const TOKEN_KEY = "sanad_token";

/** تذكرني = localStorage (يفضل بعد قفل المتصفح)، غير كده sessionStorage */
export const tokenStore = {
  get(): string | null {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  },
  save(token: string, remember: boolean): void {
    tokenStore.clear();
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

export function authHeader(): Record<string, string> {
  const token = tokenStore.get();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

let onUnauthorized: (() => void) | null = null;

/** AuthProvider بيسجّل handler هنا عشان أي 401 يرجّع لصفحة الدخول */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

type RequestOptions = {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  form?: FormData;
  /** false للـ login و register، لأنهم بيتعملوا من غير token */
  auth?: boolean;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, form, auth = true } = options;

  const headers: Record<string, string> = auth ? { ...authHeader() } : {};
  let payload: BodyInit | undefined;

  if (form) {
    payload = form; // المتصفح بيحط الـ multipart boundary بنفسه
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, "network", "network");
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const problem = data as ApiProblem | null;
    if (res.status === 401 && auth) {
      tokenStore.clear();
      onUnauthorized?.();
    }
    throw new ApiError(res.status, problem?.code, problem?.title ?? `Request failed (${res.status})`);
  }

  return data as T;
}
