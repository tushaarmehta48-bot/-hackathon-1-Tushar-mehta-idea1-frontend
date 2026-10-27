"use client";

import {
  faCalendarDays,
  faChartLine,
  faChartColumn,
  faClock,
  faNewspaper,
  faRightFromBracket,
  faSliders,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { MeResponse } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

export type AdminSectionId =
  | "overview"
  | "analytics"
  | "blog"
  | "policy"
  | "shifts"
  | "seasons"
  | "staff";

type AdminSidebarProps = {
  active: AdminSectionId;
  onSelect: (id: AdminSectionId) => void;
  onSignOut: () => void;
  me: MeResponse;
  labels: Record<AdminSectionId, string>;
  eyebrow: string;
  title: string;
  navLabel: string;
  signOutLabel: string;
};

const NAV: { id: AdminSectionId; icon: IconDefinition }[] = [
  { id: "overview", icon: faChartLine },
  { id: "analytics", icon: faChartColumn },
  { id: "blog", icon: faNewspaper },
  { id: "policy", icon: faSliders },
  { id: "shifts", icon: faClock },
  { id: "seasons", icon: faCalendarDays },
  { id: "staff", icon: faUserShield },
];

export function AdminSidebar({
  active,
  onSelect,
  onSignOut,
  me,
  labels,
  eyebrow,
  title,
  navLabel,
  signOutLabel,
}: AdminSidebarProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-line/80 bg-gradient-to-b from-forest to-forest/95 text-cream lg:w-64 lg:border-b-0 lg:border-r lg:min-h-[calc(100dvh-0px)]">
      <div className="border-b border-cream/10 px-5 py-6">
        <p className="text-[0.65rem] uppercase tracking-[0.28em] text-gold/90">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-2xl leading-tight">{title}</h1>
        <p className="mt-2 truncate text-xs text-cream/70">{me.email ?? me.id}</p>
      </div>

      <nav className="flex-1 overflow-x-auto px-3 py-4 lg:overflow-visible" aria-label={navLabel}>
        <ul className="flex gap-1 lg:flex-col">
          {NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id} className="min-w-[9rem] shrink-0 lg:min-w-0">
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    isActive
                      ? "bg-cream/15 text-cream shadow-inner ring-1 ring-cream/20"
                      : "text-cream/75 hover:bg-cream/10 hover:text-cream"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
                      isActive ? "bg-gold/25 text-gold" : "bg-cream/10 text-cream/90"
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {labels[item.id]}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-cream/10 p-4">
        <Button
          type="button"
          variant="ghost"
          className="w-full justify-center border-cream/25 bg-cream/10 text-cream hover:bg-cream/20 hover:text-cream"
          onClick={() => void onSignOut()}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" aria-hidden />
          {signOutLabel}
        </Button>
      </div>
    </aside>
  );
}
