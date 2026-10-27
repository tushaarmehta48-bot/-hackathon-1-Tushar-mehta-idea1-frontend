"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { CustomerSignedInBanner } from "@/components/auth/customer-signed-in-banner";
import { useCustomerAuth } from "@/lib/use-customer-auth";

export function CustomerLoginPanel() {
  const router = useRouter();
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const safeNext =
    nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/book";
  const auth = useCustomerAuth();

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
    <LoginForm
      onAuthenticated={() => {
        router.refresh();
        router.replace(safeNext as "/book");
      }}
    />
  );
}
