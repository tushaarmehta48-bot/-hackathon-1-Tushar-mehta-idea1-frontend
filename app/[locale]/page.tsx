import { AboutSection } from "@/components/home/about-section";
import { BlogSection } from "@/components/home/blog-section";
import { ExperiencesSection } from "@/components/home/experiences-section";
import { Hero } from "@/components/home/hero";
import { MenuSection } from "@/components/home/menu-section";
import { SeasonBanner } from "@/components/home/season-banner";
import { VisitSection } from "@/components/home/visit-section";

export default function HomePage() {
  return (
    <main id="main" className="flex-1">
      <Hero />
      <AboutSection />
      <MenuSection />
      <SeasonBanner />
      <BlogSection />
      <ExperiencesSection />
      <VisitSection />
    </main>
  );
}
