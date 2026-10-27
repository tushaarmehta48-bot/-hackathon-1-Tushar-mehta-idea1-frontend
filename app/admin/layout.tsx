import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";

export const instant = false;

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <div className="flex min-h-full flex-1 flex-col">{children}</div>
    </NextIntlClientProvider>
  );
}
