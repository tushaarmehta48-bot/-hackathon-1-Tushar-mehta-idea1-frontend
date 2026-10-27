import Image from "next/image";

type IturrietaLogoProps = {
  className?: string;
};

/** Brand mark on the cream header: white logotype on forest green tile. */
export function IturrietaLogo({
  className = "h-10 w-10 sm:h-11 sm:w-11",
}: IturrietaLogoProps) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex shrink-0 overflow-hidden rounded-md bg-forest ${className}`.trim()}
    >
      <Image
        src="/images/iturrieta-logo-blanco.png"
        alt=""
        fill
        className="object-contain p-1.5"
        sizes="44px"
        priority
      />
    </span>
  );
}
