"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  buildOAuthCallbackUrl,
  getEnabledOAuthProviders,
} from "@/lib/oauth-providers";
import { Button } from "@/components/ui/button";

type OAuthSignInButtonsProps = {
  nextPath: string;
  locale: string;
};

export function OAuthSignInButtons({ nextPath, locale }: OAuthSignInButtonsProps) {
  const t = useTranslations("auth.oauth");
  const providers = getEnabledOAuthProviders();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (providers.length === 0) {
    return null;
  }

  async function signInWithGoogle() {
    setError(null);
    setPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const redirectTo = buildOAuthCallbackUrl(origin, nextPath, locale);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });

      if (oauthError) {
        setError(t("errors.start"));
      }
    } catch {
      setError(t("errors.start"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative py-1">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-line" />
        </div>
        <p className="relative mx-auto w-fit bg-cream px-3 text-xs uppercase tracking-wide text-muted">
          {t("divider")}
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        className="w-full justify-center gap-2 border-line bg-cream"
        onClick={() => void signInWithGoogle()}
      >
        <FontAwesomeIcon icon={faGoogle} className="h-4 w-4" aria-hidden />
        {pending ? t("redirecting") : t("google")}
      </Button>

      {error ? (
        <p className="text-center text-sm text-rust" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
