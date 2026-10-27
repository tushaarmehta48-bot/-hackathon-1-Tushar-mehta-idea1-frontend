"use client";

import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { SiteBrand } from "@/components/brand/site-brand";
import { navAnchors } from "@/content/site";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/button";
import { CustomerAccountNav } from "@/components/layout/customer-account-nav";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { useCustomerAuth } from "@/lib/use-customer-auth";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const t = useTranslations("nav");
  const auth = useCustomerAuth();
  const showMyBookingsLink = auth.status !== "signedIn";

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-cream/95 backdrop-blur-sm">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-cream focus:px-3 focus:py-2 focus:text-forest"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6 sm:py-3.5">
        <SiteBrand className="min-w-0 shrink sm:max-w-none" />

        <nav
          className="hidden min-w-0 flex-1 items-center justify-end gap-2 md:flex lg:gap-4"
          aria-label={t("primary")}
        >
          {navAnchors.map((link) => (
            <Link
              key={link.sectionId}
              href={{ pathname: "/", hash: link.sectionId }}
              className="shrink-0 whitespace-nowrap text-sm text-muted transition-colors hover:text-forest"
            >
              {t(link.key)}
            </Link>
          ))}
          <LocaleSwitcher />
          {showMyBookingsLink ? (
            <Link
              href="/bookings"
              className="shrink-0 whitespace-nowrap text-sm text-muted transition-colors hover:text-forest"
            >
              {t("myBookings")}
            </Link>
          ) : null}
          <CustomerAccountNav auth={auth} />
          <ButtonLink href="/book" variant="primary" className="shrink-0 px-3 py-2 text-sm lg:px-4">
            {t("book")}
          </ButtonLink>
        </nav>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          <LocaleSwitcher />
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-sm p-2 text-forest"
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? t("closeMenu") : t("openMenu")}</span>
            <FontAwesomeIcon icon={open ? faXmark : faBars} className="h-5 w-5" />
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id={menuId}
          className="border-t border-line bg-cream px-4 pb-4 md:hidden"
          aria-label={t("mobile")}
        >
          <ul className="flex flex-col gap-1 pt-2">
            {navAnchors.map((link) => (
              <li key={link.sectionId}>
                <Link
                  href={{ pathname: "/", hash: link.sectionId }}
                  className="block rounded-sm px-2 py-3 text-forest"
                  onClick={() => setOpen(false)}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
            <CustomerAccountNav variant="stacked" auth={auth} onNavigate={() => setOpen(false)} />
            {showMyBookingsLink ? (
              <li>
                <Link
                  href="/bookings"
                  className="block rounded-sm px-2 py-3 text-forest"
                  onClick={() => setOpen(false)}
                >
                  {t("myBookings")}
                </Link>
              </li>
            ) : null}
            <li className="pt-2">
              <ButtonLink
                href="/book"
                variant="primary"
                className="w-full"
                onClick={() => setOpen(false)}
              >
                {t("book")}
              </ButtonLink>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
