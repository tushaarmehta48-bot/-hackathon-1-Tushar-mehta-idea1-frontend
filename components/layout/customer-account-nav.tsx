"use client";

import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { MeResponse } from "@/lib/api-client";
import {
  customerDisplayLabel,
  customerInitial,
  type CustomerAuthContextValue,
} from "@/lib/use-customer-auth";

type CustomerAccountNavProps = {
  variant?: "inline" | "stacked";
  onNavigate?: () => void;
  auth: CustomerAuthContextValue;
};

export function CustomerAccountNav({
  variant = "inline",
  onNavigate,
  auth,
}: CustomerAccountNavProps) {
  const t = useTranslations("nav");

  if (auth.status === "loading") {
    if (variant === "stacked") {
      return (
        <li className="px-2 py-3 text-sm text-muted" aria-live="polite">
          {t("accountLoading")}
        </li>
      );
    }
    return (
      <span className="inline-block w-10 shrink-0 text-xs text-muted" aria-live="polite">
        {t("accountLoading")}
      </span>
    );
  }

  if (auth.status === "guest") {
    const signInLink = (
      <Link
        href="/login"
        className={
          variant === "stacked"
            ? "block rounded-sm px-2 py-3 text-forest"
            : "shrink-0 whitespace-nowrap text-sm text-muted transition-colors hover:text-forest"
        }
        onClick={onNavigate}
      >
        {t("signIn")}
      </Link>
    );
    return variant === "stacked" ? <li>{signInLink}</li> : signInLink;
  }

  if (variant === "stacked") {
    return (
      <AccountMenu
        me={auth.me}
        signOut={auth.signOut}
        layout="stacked"
        onNavigate={onNavigate}
      />
    );
  }

  return (
    <AccountMenu me={auth.me} signOut={auth.signOut} layout="inline" onNavigate={onNavigate} />
  );
}

type AccountMenuProps = {
  me: MeResponse;
  signOut: () => Promise<void>;
  layout: "inline" | "stacked";
  onNavigate?: () => void;
};

function AccountMenu({ me, signOut, layout, onNavigate }: AccountMenuProps) {
  const t = useTranslations("nav");
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const label = customerDisplayLabel(me);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function closeAndNavigate() {
    setOpen(false);
    onNavigate?.();
  }

  async function handleSignOut() {
    setOpen(false);
    onNavigate?.();
    await signOut();
  }

  const trigger = (
    <button
      type="button"
      className={
        layout === "inline"
          ? "inline-flex max-w-[10rem] shrink-0 items-center gap-1.5 rounded-full border border-line/70 bg-cream py-0.5 pl-0.5 pr-2 text-sm text-forest transition-colors hover:border-forest/30 hover:bg-cream-dark/50 sm:max-w-[11rem]"
          : "flex w-full items-center gap-3 rounded-sm px-2 py-3 text-left text-forest hover:bg-cream-dark/40"
      }
      aria-expanded={open}
      aria-haspopup="menu"
      aria-controls={menuId}
      aria-label={`${t("accountMenu")}: ${label}`}
      onClick={() => setOpen((value) => !value)}
    >
      <span
        className={
          layout === "inline"
            ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest/10 text-xs font-semibold text-forest"
            : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/10 text-sm font-semibold text-forest"
        }
        aria-hidden
      >
        {customerInitial(me)}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">{label}</span>
      <FontAwesomeIcon
        icon={faChevronDown}
        className={`h-3 w-3 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        aria-hidden
      />
    </button>
  );

  const menuPanel = open ? (
    <div
      id={menuId}
      role="menu"
      className={
        layout === "inline"
          ? "absolute right-0 top-[calc(100%+0.35rem)] z-[60] min-w-[12rem] overflow-hidden rounded-lg border border-line bg-cream shadow-lg"
          : "mx-2 mb-2 overflow-hidden rounded-lg border border-line bg-cream shadow-sm"
      }
    >
      {me.email ? (
        <p className="border-b border-line px-3 py-2 text-xs text-muted truncate" title={me.email}>
          {me.email}
        </p>
      ) : null}
      <Link
        href="/bookings"
        role="menuitem"
        className="block px-3 py-2.5 text-sm text-forest transition-colors hover:bg-cream-dark/70"
        onClick={closeAndNavigate}
      >
        {t("myBookings")}
      </Link>
      <button
        type="button"
        role="menuitem"
        className="block w-full px-3 py-2.5 text-left text-sm text-muted transition-colors hover:bg-cream-dark/70 hover:text-rust"
        onClick={() => void handleSignOut()}
      >
        {t("signOut")}
      </button>
    </div>
  ) : null;

  if (layout === "stacked") {
    return (
      <li className="border-b border-line pb-2">
        <div ref={rootRef}>
          {trigger}
          {menuPanel}
        </div>
      </li>
    );
  }

  return (
    <div ref={rootRef} className="relative shrink-0">
      {trigger}
      {menuPanel}
    </div>
  );
}
