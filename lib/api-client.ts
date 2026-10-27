const DEFAULT_API_BASE = "http://localhost:3001/api/v1";

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE;
  return base.replace(/\/$/, "");
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiRequestOptions = RequestInit & {
  accessToken?: string;
};

export async function apiGet<T>(path: string, options?: ApiRequestOptions): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers(options?.headers);
  headers.set("Accept", "application/json");
  if (options?.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string | { message?: string } };
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (payload.message && typeof payload.message.message === "string") {
        message = payload.message.message;
      }
    } catch {
      /* keep default */
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export type MeResponse = {
  id: string;
  email: string | null;
  profile: {
    displayName: string | null;
    role: "CUSTOMER" | "STAFF" | "ADMIN";
    preferredLocale: string;
  };
};

export async function fetchMe(accessToken: string): Promise<MeResponse> {
  return apiGet<MeResponse>("/me", { accessToken });
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  accessToken?: string,
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Network request failed");
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string | { message?: string } };
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (payload.message && typeof payload.message.message === "string") {
        message = payload.message.message;
      }
    } catch {
      /* keep default */
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export async function apiPatch<T>(
  path: string,
  body: unknown,
  accessToken?: string,
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "Network request failed");
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const payload = (await response.json()) as { message?: string | { message?: string } };
      if (typeof payload.message === "string") {
        message = payload.message;
      } else if (payload.message && typeof payload.message.message === "string") {
        message = payload.message.message;
      }
    } catch {
      /* keep default */
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

export async function apiDownload(
  path: string,
  accessToken: string,
  filename: string,
): Promise<void> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers({ Accept: "*/*" });
  headers.set("Authorization", `Bearer ${accessToken}`);

  const response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, { headers });
  if (!response.ok) {
    throw new ApiError(response.status, `Download failed: ${response.status}`);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export async function apiUpload<T>(
  path: string,
  formData: FormData,
  accessToken?: string,
): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiDelete<T>(path: string, accessToken?: string): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const headers = new Headers({ Accept: "application/json" });
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${normalizedPath}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new ApiError(response.status, `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
