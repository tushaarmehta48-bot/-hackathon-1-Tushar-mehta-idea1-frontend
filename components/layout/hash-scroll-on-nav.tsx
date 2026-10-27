"use client";

import { usePathname } from "@/i18n/navigation";
import { useEffect } from "react";

/** Scroll to `#section` after client navigations to the homepage (e.g. from /book). */
export function HashScrollOnNav() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash.length < 2) {
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [pathname]);

  return null;
}
