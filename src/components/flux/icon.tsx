"use client";

import {
  LayoutDashboard, Gauge, CalendarRange, CalendarOff, Vault, User,
  Moon, Sun, FileText, MessageCircle, TrendingUp, Target, Plus,
  Home, Utensils, Briefcase, Car, Activity, Sparkles, Bell, Lock,
  Shield, Download, RefreshCw, Trash2, LogOut, Send, Bot, Menu, X,
  ChevronRight, AlertTriangle, CheckCircle2, Info, Wallet, PiggyBank,
  ArrowUpRight, ArrowDownRight, Settings, Globe, Cpu, Brain, Copy
} from "lucide-react";

const MAP: Record<string, any> = {
  dashboard: LayoutDashboard, gauge: Gauge, forecast: CalendarRange,
  calendar: CalendarOff, vault: Vault, profile: User, user: User,
  moon: Moon, sun: Sun,
  paper: FileText, chat: MessageCircle, peak: TrendingUp, target: Target,
  plus: Plus, home: Home, utensils: Utensils, briefcase: Briefcase, car: Car,
  pulse: Activity, sparkles: Sparkles, bell: Bell, lock: Lock, shield: Shield,
  download: Download, refresh: RefreshCw, trash: Trash2, signout: LogOut,
  send: Send, bot: Bot, menu: Menu, x: X, chevron: ChevronRight,
  warn: AlertTriangle, check: CheckCircle2, info: Info, wallet: Wallet,
  piggy: PiggyBank, up: ArrowUpRight, down: ArrowDownRight, settings: Settings,
  globe: Globe, cpu: Cpu, brain: Brain, copy: Copy,
};

export function Icon({ name, size = 16, className }: { name: string; size?: number; className?: string }) {
  const Cmp = MAP[name] ?? Info;
  return <Cmp size={size} className={className} />;
}
