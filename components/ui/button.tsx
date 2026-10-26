import type { ComponentPropsWithoutRef } from "react";
import { Link } from "@/i18n/navigation";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-medium tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-forest";

const variants = {
  primary: `${base} bg-forest text-cream hover:bg-forest-light`,
  secondary: `${base} border border-forest/30 bg-transparent text-forest hover:border-forest hover:bg-forest/5`,
  rust: `${base} bg-rust text-cream hover:bg-rust/90`,
} as const;

type Variant = keyof typeof variants;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: Variant;
};

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: Variant;
};

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${variants[variant]} ${className}`.trim()}
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
