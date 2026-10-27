"use client";

import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { fetchMe, type MeResponse } from "@/lib/api-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  CustomerAuthContext,
  type CustomerAuthContextValue,
  type CustomerAuthState,
} from "@/lib/customer-auth-context";

function meFromSupabaseUser(user: User): MeResponse {
  const metaName = user.user_metadata?.full_name;
  const displayName =
    typeof metaName === "string" && metaName.trim().length > 0 ? metaName.trim() : null;

  return {
    id: user.id,
    email: user.email ?? null,
    profile: {
      displayName,
      role: "CUSTOMER",
      preferredLocale: "en",
    },
  };
}

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CustomerAuthState>({ status: "loading" });
  const loadGeneration = useRef(0);

  const load = useCallback(async () => {
    const generation = ++loadGeneration.current;
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getSession();
    if (generation !== loadGeneration.current) {
      return;
    }

    const session = data.session;
    const token = session?.access_token;
    if (!token || !session.user) {
      setState({ status: "guest" });
      return;
    }

    const userId = session.user.id;
    setState((prev) => {
      if (prev.status === "signedIn" && prev.me.id === userId) {
        return prev;
      }
      return { status: "signedIn", me: meFromSupabaseUser(session.user) };
    });

    try {
      const me = await fetchMe(token);
      if (generation !== loadGeneration.current) {
        return;
      }
      setState({ status: "signedIn", me });
    } catch {
      if (generation !== loadGeneration.current) {
        return;
      }
      setState({ status: "guest" });
    }
  }, []);

  useEffect(() => {
    void load();
    const supabase = createSupabaseBrowserClient();
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
        return;
      }
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void load();
      }
    });
    return () => subscription.subscription.unsubscribe();
  }, [load]);

  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setState({ status: "guest" });
  }

  const value: CustomerAuthContextValue = {
    ...state,
    signOut,
    refresh: load,
  };

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}
