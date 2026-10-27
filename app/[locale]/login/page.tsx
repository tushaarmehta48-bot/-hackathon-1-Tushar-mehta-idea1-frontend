import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CustomerLoginPanel } from "@/components/auth/customer-login-panel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth");
  return { title: t("signIn") };
}

export default async function CustomerLoginPage() {
  const t = await getTranslations("auth");

  return (
    <main id="main" className="flex flex-1 items-center px-4 py-20 sm:px-6">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-olive">{t("customerArea")}</p>
          <h1 className="mt-2 font-heading text-4xl text-forest">{t("signIn")}</h1>
          <p className="mt-3 text-sm text-muted">{t("customerHint")}</p>
        </div>
        <Suspense fallback={<p className="text-center text-sm text-muted">{t("signingIn")}</p>}>
          <CustomerLoginPanel />
        </Suspense>
      </div>
    </main>
  );
}
