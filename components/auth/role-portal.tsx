"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchMe, type MeResponse } from "@/lib/api-client";
import { PortalLoginShell } from "@/components/auth/portal-login-shell";
import { Button } from "@/components/ui/button";

const SESSION_CHECK_MS = 15_000;

type RolePortalProps = {
  portal: "staff" | "admin";
  titleKey: "adminTitle" | "staffTitle";
  dashboardKey: "adminDashboard" | "staffDashboard";
  allowedRoles: MeResponse["profile"]["role"][];
  redirectPath: string;
  wrongRoleRedirect?: string;
  renderDashboard?: (ctx: { me: MeResponse; signOut: () => void }) => React.ReactNode;
};

function fetchMeWithTimeout(token: string): Promise<MeResponse> {
  return Promise.race([
    fetchMe(token),
    new Promise<MeResponse>((_, reject) => {
      window.setTimeout(() => reject(new Error("SESSION_CHECK_TIMEOUT")), SESSION_CHECK_MS);
    }),
  ]);
}

export function RolePortal({
  portal,
  titleKey,
  dashboardKey,
  allowedRoles,
  redirectPath,
  wrongRoleRedirect,
  renderDashboard,
}: RolePortalProps) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      setSessionError(null);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        const token = data.session?.access_token;
        if (!token) {
          return;
        }

        const profile = await fetchMeWithTimeout(token);
        if (cancelled) {
          return;
        }

        if (!allowedRoles.includes(profile.profile.role)) {
          const role = profile.profile.role;
          if (portal === "admin" && role === "STAFF" && wrongRoleRedirect) {
            router.replace(wrongRoleRedirect);
            return;
          }
          await supabase.auth.signOut();
          setMe(null);
          setSessionError(t("errors.wrongArea"));
          return;
        }

        setMe(profile);
      } catch (error) {
        if (cancelled) {
          return;
        }
        const supabase = createSupabaseBrowserClient();
        await supabase.auth.signOut();
        setMe(null);
        if (error instanceof Error && error.message === "SESSION_CHECK_TIMEOUT") {
          setSessionError(t("errors.sessionTimeout"));
        } else {
          setSessionError(t("errors.sessionCheckFailed"));
        }
      } finally {
        setSessionReady(true);
      }
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, [allowedRoles, portal, router, wrongRoleRedirect]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setMe(null);
    setSessionError(null);
    setSessionReady(true);
  }

  if (me) {
    if (renderDashboard) {
      return <>{renderDashboard({ me, signOut })}</>;
    }
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-olive">{t(titleKey)}</p>
          <h1 className="mt-2 font-heading text-3xl text-forest">{t(dashboardKey)}</h1>
          <p className="mt-2 text-sm text-muted">
            {me.profile.role} · {me.email ?? me.id}
          </p>
        </div>
        <Button type="button" variant="secondary" onClick={() => void signOut()}>
          {t("signOut")}
        </Button>
      </div>
    );
  }

  return (
    <>
      {!sessionReady ? (
        <p className="sr-only" aria-live="polite">
          {t("loading")}
        </p>
      ) : null}
      {sessionError ? (
        <div className="mx-auto mb-4 max-w-lg px-4">
          <p className="rounded-sm border border-rust/30 bg-cream px-3 py-2 text-sm text-rust" role="alert">
            {sessionError}
          </p>
        </div>
      ) : null}
      <PortalLoginShell
        portal={portal}
        titleKey={titleKey}
        redirectPath={redirectPath}
        allowedRoles={allowedRoles}
        onAuthenticated={(next) => {
          setSessionError(null);
          setSessionReady(true);
          setMe(next);
        }}
      />
    </>
  );
}
