import { request, tokenStore } from "./client";
import type { components } from "./schema";

type AuthResponse = components["schemas"]["AuthResponse"];
type MeResponse = components["schemas"]["MeResponse"];

export async function login(email: string, password: string, remember: boolean): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  tokenStore.save(data.token, remember);
  return data;
}

export async function register(email: string, password: string, remember: boolean): Promise<AuthResponse> {
  const data = await request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  tokenStore.save(data.token, remember);
  return data;
}

export function getMe(): Promise<MeResponse> {
  return request<MeResponse>("/api/auth/me");
}

export function logout(): void {
  tokenStore.clear();
}
