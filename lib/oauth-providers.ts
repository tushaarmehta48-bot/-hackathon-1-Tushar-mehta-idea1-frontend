export type OAuthProviderId = "google";

const DEFAULT: OAuthProviderId[] = ["google"];

/** Comma-separated list in NEXT_PUBLIC_OAUTH_PROVIDERS (default: google). */
export function getEnabledOAuthProviders(): OAuthProviderId[] {
  const raw = process.env.NEXT_PUBLIC_OAUTH_PROVIDERS?.trim();
  if (!raw) {
    return DEFAULT;
  }
  return raw
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((id): id is OAuthProviderId => id === "google");
}

export function buildOAuthCallbackUrl(origin: string, nextPath: string, locale: string): string {
  const params = new URLSearchParams({
    next: nextPath,
    locale,
  });
  return `${origin}/auth/callback?${params.toString()}`;
}
