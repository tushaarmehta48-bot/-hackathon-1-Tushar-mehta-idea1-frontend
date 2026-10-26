"use client";

import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { navAnchors, site } from "@/content/site";
import { Link } from "@/i18n/navigation";
import { ButtonLink } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-cream/95 backdrop-blur-sm">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-sm focus:bg-cream focus:px-3 focus:py-2 focus:text-forest"
      >
        {t("skipToContent")}
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-heading text-xl tracking-tight text-forest transition-colors hover:text-forest-light"
        >
          {site.name}
        </Link>

        <nav
          className="hidden items-center gap-6 md:flex"
          aria-label={t("primary")}
        >
          {navAnchors.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-forest"
            >
              {t(link.key)}
            </Link>
          ))}
          <LocaleSwitcher />
          <ButtonLink href="/book" variant="primary" className="px-4 py-2">
            {t("book")}
          </ButtonLink>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
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
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-sm px-2 py-3 text-forest"
                  onClick={() => setOpen(false)}
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
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
