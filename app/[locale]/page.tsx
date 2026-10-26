import { setRequestLocale } from "next-intl/server";
import { ExperiencesSection } from "@/components/home/experiences-section";
import { Hero } from "@/components/home/hero";
import { MenuSection } from "@/components/home/menu-section";
import { SeasonBanner } from "@/components/home/season-banner";
import { VisitSection } from "@/components/home/visit-section";

type HomePageProps = PageProps<"/[locale]">;

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main id="main" className="flex-1">
      <Hero />
      <MenuSection />
      <SeasonBanner />
      <ExperiencesSection />
      <VisitSection />
    </main>
  );
}
