"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { CustomerSignedInBanner } from "@/components/auth/customer-signed-in-banner";
import { OAuthSignInButtons } from "@/components/auth/oauth-sign-in-buttons";
import { useCustomerAuth } from "@/lib/use-customer-auth";

export function CustomerLoginPanel() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/book";
  const [oauthBanner, setOauthBanner] = useState<string | null>(null);
  const auth = useCustomerAuth();

  useEffect(() => {
    if (searchParams.get("error") === "oauth") {
      setOauthBanner(t("oauth.errors.callback"));
    }
  }, [searchParams, t]);

  if (auth.status === "loading") {
    return <p className="text-center text-sm text-muted">{t("loading")}</p>;
  }

  if (auth.status === "signedIn") {
    return (
      <div className="space-y-4">
        <CustomerSignedInBanner />
        <p className="text-center text-sm text-muted">
          <button
            type="button"
            className="text-forest underline-offset-4 hover:underline"
            onClick={() => {
              router.refresh();
              router.replace(safeNext as "/book");
            }}
          >
            {t("continueToApp")}
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {oauthBanner ? (
        <p className="rounded-sm border border-rust/30 bg-rust/5 px-3 py-2 text-sm text-rust" role="alert">
          {oauthBanner}
        </p>
      ) : null}
      <OAuthSignInButtons nextPath={safeNext} locale={locale} />
      <LoginForm
        onAuthenticated={() => {
          router.refresh();
          router.replace(safeNext as "/book");
        }}
      />
    </div>
  );
}
