"use client";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function adminFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const isFormData =
    typeof FormData !== "undefined" && options?.body instanceof FormData;
  const headers: Record<string, string> = { ...(options?.headers as Record<string, string> | undefined) };
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    ...options,
    headers,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "error" in data && String((data as any).error)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data);
  }

  return data as T;
}

export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    usp.set(k, String(v));
  }
  const s = usp.toString();
  return s ? `?${s}` : "";
}
