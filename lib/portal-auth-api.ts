import { apiPost } from "@/lib/api-client";

export type PortalKind = "staff" | "admin";

export type PortalSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

export async function signInPortal(
  portal: PortalKind,
  userId: string,
  password: string,
): Promise<PortalSession> {
  return apiPost<PortalSession>("/auth/portal/sign-in", { portal, userId, password });
}
