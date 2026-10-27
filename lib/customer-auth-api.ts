import { apiPost, ApiError } from "@/lib/api-client";

export async function registerCustomerAccount(email: string, password: string): Promise<void> {
  await apiPost<{ ok: true }>("/auth/customer/sign-up", { email, password });
}

export function customerSignUpErrorMessage(err: unknown, t: (key: string) => string): string {
  if (err instanceof ApiError) {
    if (err.status === 409) {
      return t("errors.emailAlreadyRegistered");
    }
    if (err.message && err.status >= 400 && err.status < 500) {
      return err.message;
    }
  }
  return t("errors.signUpFailed");
}
