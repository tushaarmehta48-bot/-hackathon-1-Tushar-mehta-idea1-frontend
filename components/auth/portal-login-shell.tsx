"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { MeResponse } from "@/lib/api-client";
import { PortalLoginForm } from "@/components/auth/portal-login-form";
import type { PortalKind } from "@/lib/portal-auth-api";

type PortalLoginShellProps = {
  portal: PortalKind;
  titleKey: "adminTitle" | "staffTitle";
  redirectPath: string;
  allowedRoles: MeResponse["profile"]["role"][];
  onAuthenticated: (me: MeResponse) => void;
};

const portalVisuals: Record<
  PortalKind,
  { image: string; imageAltKey: "staffImageAlt" | "adminImageAlt" }
> = {
  staff: {
    image: "/images/iturrieta-txotx.jpg",
    imageAltKey: "staffImageAlt",
  },
  admin: {
    image: "/images/iturrieta-about-farmhouse.jpg",
    imageAltKey: "adminImageAlt",
  },
};

export function PortalLoginShell({
  portal,
  titleKey,
  redirectPath,
  allowedRoles,
  onAuthenticated,
}: PortalLoginShellProps) {
  const tAuth = useTranslations("auth");
  const tPortal = useTranslations(portal === "staff" ? "portalLoginStaff" : "portalLoginAdmin");
  const visuals = portalVisuals[portal];

  return (
    <div className="grid min-h-[calc(100vh-4rem)] w-full lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <section className="relative order-2 flex flex-col justify-end border-t border-line bg-forest text-cream lg:order-1 lg:min-h-full lg:border-t-0 lg:border-r lg:border-line">
        <div className="absolute inset-0">
          <Image
            src={visuals.image}
            alt={tPortal(visuals.imageAltKey)}
            fill
            priority
            className="object-cover opacity-50"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div
            className="absolute inset-0 bg-linear-to-t from-forest via-forest/85 to-forest/55 lg:bg-linear-to-r lg:from-forest lg:via-forest/88 lg:to-forest/70"
            aria-hidden
          />
        </div>
        <div className="relative mx-auto flex w-full max-w-xl flex-col gap-6 px-6 py-12 sm:px-10 sm:py-16 lg:max-w-none lg:justify-center lg:py-20">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-cream/75">
              {tAuth(titleKey)}
            </p>
            <h1 className="mt-3 font-heading text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
              {tPortal("headline")}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-cream/88">{tPortal("lead")}</p>
          </div>
          <ul className="space-y-3 text-sm text-cream/90">
            {[1, 2, 3].map((index) => (
              <li key={index} className="flex gap-3">
                <span
                  className="mt-1.5 size-1.5 shrink-0 rounded-full bg-gold"
                  aria-hidden
                />
                <span>{tPortal(`points.${index}` as "points.1")}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="order-1 flex items-center justify-center bg-cream px-6 py-12 sm:px-10 lg:order-2 lg:py-16">
        <div className="w-full max-w-md space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-olive">{tPortal("formEyebrow")}</p>
            <h2 className="mt-2 font-heading text-3xl text-forest">{tAuth("signIn")}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{tPortal("formHint")}</p>
          </div>
          <PortalLoginForm
            portal={portal}
            allowedRoles={allowedRoles}
            onAuthenticated={onAuthenticated}
          />
          <p className="text-center text-sm text-muted">
            <Link href="/en/login" className="text-forest underline-offset-4 hover:underline">
              {tPortal("customerLink")}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
