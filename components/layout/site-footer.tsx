import { getTranslations } from "next-intl/server";
import { site } from "@/content/site";

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <footer className="border-t border-line bg-cream-dark">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg text-forest">{site.name}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("tagline")}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-olive">
            {t("contact")}
          </p>
          <p className="mt-3 text-sm text-ink">
            <a
              className="underline-offset-2 hover:underline"
              href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
            >
              {site.contact.phone}
            </a>
          </p>
          <p className="mt-1 text-sm text-ink">
            <a
              className="underline-offset-2 hover:underline"
              href={`mailto:${site.contact.email}`}
            >
              {site.contact.email}
            </a>
          </p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-olive">
            {t("visit")}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {site.address.line1}
            <br />
            {site.address.line2}
          </p>
        </div>
      </div>
      <div className="border-t border-line/80 px-4 py-4 text-center text-xs text-muted sm:px-6">
        <p>
          © {site.name}. {t("photoCredit")}{" "}
          <code className="text-[0.7rem]">public/images/ATTRIBUTION.md</code>.
        </p>
      </div>
    </footer>
  );
}
