import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { menuFoodSlideIds, menuFoodSlideSources } from "@/content/menu-food-images";
import { Reveal } from "@/components/motion/reveal";

export async function MenuFoodCards() {
  const t = await getTranslations("menuSection.foodGallery");

  return (
    <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {menuFoodSlideIds.map((id, index) => (
        <li key={id}>
          <Reveal delay={0.04 + index * 0.05}>
            <article className="group flex h-full flex-col overflow-hidden border border-line bg-cream-dark/30 shadow-sm transition-shadow duration-300 hover:shadow-md">
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={menuFoodSlideSources[id]}
                  alt={t(`slides.${id}.alt`)}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1 border-t border-line/80 bg-cream p-4">
                <h4 className="font-heading text-base leading-snug text-forest">
                  {t(`slides.${id}.alt`)}
                </h4>
                <p className="text-sm leading-relaxed text-muted italic">{t(`slides.${id}.caption`)}</p>
              </div>
            </article>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
