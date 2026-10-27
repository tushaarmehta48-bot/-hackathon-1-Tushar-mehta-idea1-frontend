"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { customerDisplayLabel, useCustomerAuth } from "@/lib/use-customer-auth";

export function CustomerSignedInBanner() {
  const t = useTranslations("auth");
  const auth = useCustomerAuth();

  if (auth.status !== "signedIn") {
    return null;
  }

  const label = customerDisplayLabel(auth.me);

  return (
    <div className="rounded-lg border border-forest/20 bg-forest/5 px-4 py-4 text-sm">
      <p className="font-medium text-forest">
        {t("signedInAs", { name: label })}
      </p>
      {auth.me.email ? <p className="mt-1 text-muted">{auth.me.email}</p> : null}
      <Link
        href="/bookings"
        className="mt-3 inline-block font-medium text-forest underline-offset-4 hover:underline"
      >
        {t("goToBookings")}
      </Link>
    </div>
  );
}
