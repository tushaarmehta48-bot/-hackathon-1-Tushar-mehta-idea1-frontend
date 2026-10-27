"use client";

import { createContext, useContext } from "react";
import type { MeResponse } from "@/lib/api-client";

export type CustomerAuthState =
  | { status: "loading" }
  | { status: "guest" }
  | { status: "signedIn"; me: MeResponse };

export type CustomerAuthContextValue = CustomerAuthState & {
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within CustomerAuthProvider");
  }
  return ctx;
}

export function customerDisplayLabel(me: MeResponse): string {
  const name = me.profile.displayName?.trim();
  if (name) {
    return name;
  }
  if (me.email) {
    return me.email.split("@")[0] ?? me.email;
  }
  return me.id.slice(0, 8);
}

export function customerInitial(me: MeResponse): string {
  const label = customerDisplayLabel(me);
  return label.charAt(0).toUpperCase() || "?";
}
