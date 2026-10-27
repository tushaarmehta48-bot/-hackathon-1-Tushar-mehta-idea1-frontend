import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { MyBookingsPanel } from "@/components/booking/my-bookings-panel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("myBookings");
  return { title: t("title") };
}

export default async function MyBookingsPage() {
  const t = await getTranslations("myBookings");

  return (
    <main
      id="main"
      className="flex flex-1 flex-col bg-gradient-to-b from-cream-dark/40 via-cream to-cream px-4 py-16 sm:px-6"
    >
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-olive">{t("eyebrow")}</p>
        <h1 className="mt-2 font-heading text-4xl text-forest">{t("title")}</h1>
      </header>
      <MyBookingsPanel />
    </main>
  );
}
