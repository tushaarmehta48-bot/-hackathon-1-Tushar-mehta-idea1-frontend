"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchMe, type MeResponse } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

type LoginFormProps = {
  /** Full path for admin/staff; omit when the caller navigates (e.g. locale-aware `/book`). */
  redirectPath?: string;
  allowedRoles?: MeResponse["profile"]["role"][];
  onAuthenticated: (me: MeResponse) => void;
};

export function LoginForm({
  redirectPath,
  allowedRoles,
  onAuthenticated,
}: LoginFormProps) {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const authResult =
        mode === "signIn"
          ? await supabase.auth.signInWithPassword({ email, password })
          : await supabase.auth.signUp({ email, password });

      if (authResult.error) {
        setError(t("errors.invalidCredentials"));
        return;
      }

      const session = authResult.data.session;
      if (!session?.access_token) {
        setError(t("errors.confirmEmail"));
        return;
      }

      const me = await fetchMe(session.access_token);
      if (allowedRoles && !allowedRoles.includes(me.profile.role)) {
        await supabase.auth.signOut();
        setError(t("errors.wrongArea"));
        return;
      }

      onAuthenticated(me);
      if (redirectPath) {
        window.location.assign(redirectPath);
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-forest">
          {t("email")}
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-sm border border-line bg-cream px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-forest">
          {t("password")}
        </label>
        <input
          id="password"
          type="password"
          autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-sm border border-line bg-cream px-3 py-2 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        />
      </div>
      {error ? (
        <p className="text-sm text-rust" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending
            ? t("signingIn")
            : mode === "signIn"
              ? t("signIn")
              : t("register")}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        >
          {mode === "signIn" ? t("register") : t("signIn")}
        </Button>
      </div>
    </form>
  );
}
