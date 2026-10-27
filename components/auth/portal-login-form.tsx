"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ApiError, fetchMe, type MeResponse } from "@/lib/api-client";
import { signInPortal, type PortalKind } from "@/lib/portal-auth-api";
import { Button } from "@/components/ui/button";

type PortalLoginFormProps = {
  portal: PortalKind;
  allowedRoles: MeResponse["profile"]["role"][];
  onAuthenticated: (me: MeResponse) => void;
};

export function PortalLoginForm({
  portal,
  allowedRoles,
  onAuthenticated,
}: PortalLoginFormProps) {
  const t = useTranslations("auth");
  const tPortal = useTranslations(portal === "staff" ? "portalLoginStaff" : "portalLoginAdmin");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const session = await signInPortal(portal, userId.trim(), password);
      const supabase = createSupabaseBrowserClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      if (sessionError) {
        setError(tPortal("errors.session"));
        return;
      }

      const me = await fetchMe(session.access_token);
      if (!allowedRoles.includes(me.profile.role)) {
        await supabase.auth.signOut();
        setError(t("errors.wrongArea"));
        return;
      }

      onAuthenticated(me);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t("errors.invalidPortalCredentials"));
      } else if (err instanceof ApiError && err.status === 503) {
        setError(tPortal("errors.notConfigured"));
      } else if (err instanceof ApiError && (err.status === 0 || err.status >= 500)) {
        setError(tPortal("errors.server"));
      } else {
        setError(t("errors.generic"));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div>
        <label htmlFor={`${portal}-user-id`} className="block text-sm font-medium text-forest">
          {tPortal("userId")}
        </label>
        <input
          id={`${portal}-user-id`}
          type="text"
          autoComplete="username"
          required
          spellCheck={false}
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          className="mt-1.5 w-full rounded-sm border border-line bg-cream px-3 py-2.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        />
      </div>
      <div>
        <label htmlFor={`${portal}-password`} className="block text-sm font-medium text-forest">
          {t("password")}
        </label>
        <input
          id={`${portal}-password`}
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1.5 w-full rounded-sm border border-line bg-cream px-3 py-2.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        />
      </div>
      {error ? (
        <p className="text-sm text-rust" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("signingIn") : t("signIn")}
      </Button>
      <p className="text-center text-xs leading-relaxed text-muted">{tPortal("footnote")}</p>
    </form>
  );
}
