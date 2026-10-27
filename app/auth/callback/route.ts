import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function safeNextPath(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
    return raw;
  }
  return "/book";
}

function withLocalePrefix(path: string, locale: string): string {
  const localePattern = new RegExp(`^/(${routing.locales.join("|")})(/|$)`);
  if (localePattern.test(path)) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalized === "/" ? "" : normalized}`;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = safeNextPath(requestUrl.searchParams.get("next"));
  const localeParam = requestUrl.searchParams.get("locale");
  const locale =
    localeParam && routing.locales.includes(localeParam as (typeof routing.locales)[number])
      ? localeParam
      : routing.defaultLocale;

  if (!code) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=oauth`, requestUrl.origin),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/${locale}/login?error=oauth`, requestUrl.origin),
    );
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (accessToken && apiBase) {
    try {
      await fetch(`${apiBase}/me`, {
        headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
        cache: "no-store",
      });
    } catch {
      /* profile sync on next client request */
    }
  }

  const destination = withLocalePrefix(nextPath, locale);
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
