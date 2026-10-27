import type { ComponentPropsWithoutRef } from "react";
import { Link } from "@/i18n/navigation";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-medium tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-forest";

const variants = {
  primary: `${base} bg-forest text-cream shadow-sm hover:bg-forest-light hover:shadow-md`,
  secondary: `${base} border border-forest/25 bg-cream text-forest shadow-sm hover:border-forest/50 hover:bg-cream-dark/40 hover:shadow`,
  rust: `${base} bg-rust text-cream shadow-sm hover:bg-rust/90 hover:shadow-md`,
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-full border border-line/90 bg-cream/80 px-4 py-2.5 text-sm font-medium text-forest shadow-sm transition-all hover:border-forest/30 hover:bg-cream hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-forest",
  /** High-contrast on dark photography (hero) */
  cream: `${base} border border-cream bg-cream text-forest shadow-lg hover:bg-white hover:text-forest`,
} as const;

const sizes = {
  default: "",
  sm: "px-4 py-2 text-xs tracking-normal",
} as const;

type Variant = keyof typeof variants;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
  size?: keyof typeof sizes;
};

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
};

export function Button({
  variant = "primary",
  size = "default",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const sizeClass = variant === "ghost" && size === "default" ? "" : sizes[size];
  return (
    <button
      type={type}
      className={`${variants[variant]} ${sizeClass} ${className}`.trim()}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={`${variants[variant]} ${className}`.trim()} {...props} />
  );
}
