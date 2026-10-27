import createIntlMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { updateSupabaseSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

function mergeCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie.name, cookie.value);
  });
}

export async function proxy(request: NextRequest) {
  const supabaseResponse = await updateSupabaseSession(request);
  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff") ||
    pathname.startsWith("/auth")
  ) {
    return supabaseResponse;
  }

  const intlResponse = intlMiddleware(request);
  mergeCookies(supabaseResponse, intlResponse);
  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
