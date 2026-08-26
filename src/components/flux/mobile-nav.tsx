"use client";

import { useFlux, type ViewKey } from "@/store/flux-store";
import { Icon } from "./icon";

const ITEMS: { key: ViewKey; icon: string; label: string }[] = [
  { key: "dashboard", icon: "dashboard", label: "Home" },
  { key: "spending", icon: "gauge", label: "Spend" },
  { key: "forecast", icon: "forecast", label: "Forecast" },
  { key: "vault", icon: "vault", label: "Vault" },
  { key: "profile", icon: "profile", label: "Profile" },
];

export function MobileNav() {
  const view = useFlux((s) => s.view);
  const setView = useFlux((s) => s.setView);
  return (
    <nav className="mobile-nav">
      {ITEMS.map((it) => (
        <button
          key={it.key}
          className={`mobile-nav-item ${view === it.key ? "active" : ""}`}
          onClick={() => setView(it.key)}
          type="button"
        >
          <Icon name={it.icon} size={18} />
          <span>{it.label}</span>
        </button>
      ))}
    </nav>
  );
}
