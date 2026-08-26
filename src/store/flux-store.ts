"use client";

import { create } from "zustand";

export type ViewKey =
  | "dashboard"
  | "spending"
  | "forecast"
  | "break"
  | "vault"
  | "simulator"
  | "profile"
  | "chat";

export interface FluxProfile {
  id: string;
  name: string;
  email: string;
  city: string;
  role: string;
  stabilityScore: number;
  incomeTarget: number;
  spendingTarget: number;
  vaultGoal: number;
  minRunwayMonths: number;
  workType: string;
  paymentFreq: string;
}

export interface FluxSnapshot {
  id: number;
  monthLabel: string;
  monthShort: string;
  year: number;
  monthIndex: number;
  today: number;
  daysInMonth: number;
  daysPassed: number;
  income: number;
  spending: number;
  baselineNeed: number;
  vaultBalance: number;
}

export interface Tx {
  id: string;
  label: string;
  date: string | Date;
  category: string;
  amount: number;
  flow: string;
  tone: string;
}

export interface VaultTx {
  id: string;
  label: string;
  date: string | Date;
  type: string;
  amount: number;
  flow: string;
  tone: string;
}

export interface Category {
  id: string;
  icon: string;
  label: string;
  spent: number;
  limit: number;
  tone: string;
  order: number;
}

export interface HeatmapDay {
  id: string;
  day: number;
  level: number;
  amount: number;
  probability: number;
  predicted: boolean;
}

export interface ForecastDayDb {
  id: string;
  dayIndex: number;
  date: string | Date;
  baseYhat: number;
  finalY: number;
  lowBand: number;
  highBand: number;
  isFuture: boolean;
}

export interface ForecastRunDb {
  id: string;
  runNumber: number;
  createdAt: string | Date;
  projectedIncome: number;
  essentialCosts: number;
  surplusDeficit: number;
  coverageRatio: number;
  vaultAction: string;
  vaultDelta: number;
  vaultBalanceAfter: number;
  baseMape: number;
  hybridMape: number;
  horizon: number;
  source: string;
  csvFilename: string | null;
  days?: ForecastDayDb[];
}

export interface ChatMsg {
  id?: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string | Date;
}

export interface FluxState {
  profile: FluxProfile | null;
  snapshot: FluxSnapshot | null;
  transactions: Tx[];
  vaultTransactions: VaultTx[];
  categories: Category[];
  heatmapDays: HeatmapDay[];
  lastForecast: (ForecastRunDb & { days?: ForecastDayDb[] }) | null;
  vaultHistory: { run: number; projectedIncome: number; essentialCosts: number; surplusDeficit: number; vaultBalance: number }[];
  chatMessages: ChatMsg[];
  loading: boolean;
  error: string | null;
}

interface FluxStore extends FluxState {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  load: () => Promise<void>;
  setRaw: (partial: Partial<FluxState>) => void;
  addChatMsg: (m: ChatMsg) => void;
  setChatMessages: (m: ChatMsg[]) => void;
}

export const useFlux = create<FluxStore>((set, get) => ({
  view: "dashboard",
  profile: null,
  snapshot: null,
  transactions: [],
  vaultTransactions: [],
  categories: [],
  heatmapDays: [],
  lastForecast: null,
  vaultHistory: [],
  chatMessages: [],
  loading: false,
  error: null,
  setView: (v) => set({ view: v }),
  setRaw: (partial) => set(partial),
  addChatMsg: (m) => set((s) => ({ chatMessages: [...s.chatMessages, m] })),
  setChatMessages: (m) => set({ chatMessages: m }),
  load: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch("/api/state");
      if (!res.ok) throw new Error("Failed to load state");
      const data = await res.json();
      set({
        profile: data.profile,
        snapshot: data.snapshot,
        transactions: data.transactions,
        vaultTransactions: data.vaultTransactions,
        categories: data.categories,
        heatmapDays: data.heatmapDays,
        lastForecast: data.lastForecast,
        vaultHistory: data.vaultHistory,
        chatMessages: data.chatMessages,
        loading: false,
      });
    } catch (e: any) {
      set({ loading: false, error: e.message ?? "Unknown error" });
    }
  },
}));

/* ── derived selectors / helpers ── */

export function formatINR(n: number, opts?: { compact?: boolean; decimals?: number }) {
  if (n == null || isNaN(n)) return "₹0";
  if (opts?.compact) {
    if (Math.abs(n) >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
    if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
    if (Math.abs(n) >= 1000) return `₹${(n / 1000).toFixed(1)}k`;
    return `₹${Math.round(n)}`;
  }
  const rounded = opts?.decimals != null
    ? Number(n.toFixed(opts.decimals))
    : Math.round(n);
  return `₹${rounded.toLocaleString("en-IN", {
    maximumFractionDigits: opts?.decimals ?? 0,
    minimumFractionDigits: 0,
  })}`;
}

export function runwayMonths(income: number, spending: number, vault: number) {
  const monthlyBurn = spending || 1;
  return (vault + Math.max(0, income - spending) * 1) / monthlyBurn;
}
