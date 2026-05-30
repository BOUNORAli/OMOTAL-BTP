import type { Role } from "@/lib/domain/types";

export const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

type RequestOptions = RequestInit & {
  auth?: boolean;
};

export function isBackendEnabled() {
  return API_BASE_URL.length > 0;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL n'est pas configure.");
  }

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getPersistedToken();
  if (options.auth !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response
      .json()
      .then((payload) => payload.message ?? "Erreur serveur")
      .catch(() => "Erreur serveur");
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export async function apiDownload(path: string): Promise<Blob> {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL n'est pas configure.");
  }

  const headers = new Headers();
  const token = getPersistedToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) {
    throw new Error("Telechargement impossible.");
  }
  return response.blob();
}

export function getPersistedToken() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem("omotal-app-store");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { state?: { authToken?: string } };
    return parsed.state?.authToken ?? null;
  } catch {
    return null;
  }
}

export function getPersistedSelectedChantierId() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem("omotal-app-store");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as { state?: { selectedChantierId?: string } };
    return parsed.state?.selectedChantierId ?? null;
  } catch {
    return null;
  }
}

export function normalizeRole(role: string): Role {
  return role.toLowerCase() as Role;
}

function normalizeApiBaseUrl(value?: string) {
  const baseUrl = value?.trim().replace(/\/$/, "") ?? "";
  if (!baseUrl) return "";
  if (baseUrl.startsWith("http://") || baseUrl.startsWith("https://")) return baseUrl;
  if (baseUrl.startsWith("//")) return `https:${baseUrl}`;
  if (baseUrl.startsWith("localhost") || baseUrl.startsWith("127.0.0.1")) return `http://${baseUrl}`;
  return `https://${baseUrl}`;
}
