import {
  faCheese,
  faDrumstickBite,
  faFireFlameSimple,
  faFish,
  faPepperHot,
  faStore,
  faUtensils,
  faWineBottle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { getTranslations } from "next-intl/server";
import { MenuFoodCards } from "@/components/home/menu-food-cards";
import { SectionHeading } from "@/components/layout/section-heading";
import { Reveal } from "@/components/motion/reveal";

const dishKeys = ["chorizo", "codScramble", "codPeppers", "steak", "cheese", "cider"] as const;

const dishIcons: Record<(typeof dishKeys)[number], IconDefinition> = {
  chorizo: faPepperHot,
  codScramble: faFish,
  codPeppers: faFish,
  steak: faFireFlameSimple,
  cheese: faCheese,
  cider: faWineBottle,
};

export async function MenuSection() {
  const t = await getTranslations("menuSection");

  return (
    <section id="menu" className="scroll-mt-24 bg-cream px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-olive">
              <FontAwesomeIcon icon={faUtensils} className="mr-2 h-3.5 w-3.5" aria-hidden />
              {t("foodGallery.eyebrow")}
            </p>
            <h3 className="mt-2 font-heading text-2xl text-forest sm:text-3xl">{t("foodGallery.title")}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{t("foodGallery.lead")}</p>
          </div>
        </Reveal>
        <MenuFoodCards />

        <Reveal delay={0.06}>
          <div className="mt-10 sm:mt-12">
            <SectionHeading
              eyebrow={t("eyebrow")}
              title={t("title")}
              description={t("description")}
            />
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-10 flex flex-col gap-2 border border-line bg-cream-dark/40 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
            <div>
              <p className="text-xs uppercase tracking-wider text-olive">{t("priceLabel")}</p>
              <p className="mt-1 font-heading text-3xl text-forest">
                {t("price")}
                <span className="ml-2 text-base font-normal text-muted">{t("priceUnit")}</span>
              </p>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-muted">{t("kidsNote")}</p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6 flex gap-3 border border-gold/40 bg-gold/10 p-4 sm:p-5">
            <FontAwesomeIcon icon={faDrumstickBite} className="mt-0.5 h-5 w-5 shrink-0 text-forest" aria-hidden />
            <div>
              <p className="font-heading text-lg text-forest">{t("seasonalMenu.title")}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{t("seasonalMenu.body")}</p>
            </div>
          </div>
        </Reveal>

        <ul className="mt-8 divide-y divide-line border border-line bg-cream-dark/30">
          {dishKeys.map((key, index) => (
            <li key={key}>
              <Reveal delay={0.04 + index * 0.04}>
                <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-forest/10 text-forest"
                      aria-hidden
                    >
                      <FontAwesomeIcon icon={dishIcons[key]} className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-forest">{t(`dishes.${key}.name`)}</span>
                  </div>
                  <span className="text-sm text-muted sm:text-right">{t(`dishes.${key}.detail`)}</span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={0.12}>
          <div className="mt-12 grid gap-8 border-t border-line pt-12 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-olive">{t("cider.eyebrow")}</p>
              <h3 className="mt-2 font-heading text-2xl text-forest">{t("cider.title")}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">{t("cider.body")}</p>
              <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted">
                <FontAwesomeIcon icon={faStore} className="mt-1 h-4 w-4 shrink-0 text-rust" aria-hidden />
                {t("cider.shop")}
              </p>
            </div>
            <dl className="grid grid-cols-3 gap-4">
              {(["trees", "eco", "txotxSeason"] as const).map((key) => (
                <div key={key} className="border border-line bg-cream p-4 text-center">
                  <dt className="text-xs uppercase tracking-wider text-olive">{t(`cider.highlights.${key}.label`)}</dt>
                  <dd className="mt-2 font-heading text-xl text-forest">
                    {t(`cider.highlights.${key}.value`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="mt-10 rounded-sm border border-line bg-forest/5 p-6 sm:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-olive">{t("produce.eyebrow")}</p>
            <p className="mt-2 font-heading text-xl text-forest">{t("produce.title")}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">{t("produce.body")}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
