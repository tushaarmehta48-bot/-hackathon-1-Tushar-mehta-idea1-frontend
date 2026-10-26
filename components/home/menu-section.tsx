import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal } from "@/components/motion/reveal";

const menuCardMeta = [
  { key: "txotx" as const, image: "/images/menu-plating.jpg" },
  { key: "grill" as const, image: "/images/hero-dining.jpg" },
  { key: "cellar" as const, image: "/images/experience-gathering.jpg" },
];

export async function MenuSection() {
  const t = await getTranslations("menuSection");

  return (
    <section id="menu" className="scroll-mt-24 bg-cream px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHeading
            eyebrow={t("eyebrow")}
            title={t("title")}
            description={t("description")}
          />
        </Reveal>
        <ul className="mt-12 grid gap-8 md:grid-cols-3">
          {menuCardMeta.map((card, index) => (
            <li key={card.key}>
              <Reveal delay={index * 0.08}>
                <article className="group flex h-full flex-col overflow-hidden border border-line bg-cream-dark/40">
                  <div className="relative aspect-4/3 overflow-hidden">
                    <Image
                      src={card.image}
                      alt={t(`cards.${card.key}.alt`)}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-heading text-xl text-forest">
                      {t(`cards.${card.key}.title`)}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {t(`cards.${card.key}.body`)}
                    </p>
                    <p className="mt-4 text-xs uppercase tracking-wider text-olive">
                      {t("availabilityNote")}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
