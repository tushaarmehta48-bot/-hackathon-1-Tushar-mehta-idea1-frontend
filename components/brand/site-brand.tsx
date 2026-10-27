import { Link } from "@/i18n/navigation";
import { IturrietaLogo } from "@/components/brand/iturrieta-logo";
import { site } from "@/content/site";

type SiteBrandProps = {
  className?: string;
  onNavigate?: () => void;
};

export function SiteBrand({ className = "", onNavigate }: SiteBrandProps) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      className={`group flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90 ${className}`.trim()}
    >
      <IturrietaLogo />
      <span className="flex min-w-0 flex-col justify-center border-l border-forest/15 pl-3">
        <span className="font-heading text-[1.2rem] font-semibold italic leading-none tracking-tight text-forest sm:text-[1.45rem]">
          {site.brand.primary}
        </span>
        <span className="mt-1 font-heading text-[0.68rem] font-medium uppercase leading-none tracking-[0.32em] text-olive sm:text-[0.72rem]">
          {site.brand.secondary}
        </span>
      </span>
      <span className="sr-only">{site.name}</span>
    </Link>
  );
}
