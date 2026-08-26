"use client";

import { useState } from "react";
import { useFlux, formatINR, runwayMonths, type FluxProfile } from "@/store/flux-store";
import { Icon } from "@/components/flux/icon";
import { useFluxTheme, type FluxTheme, type FluxLang } from "@/components/flux/theme-provider";
import { useToast } from "@/hooks/use-toast";

/* ───────────────────────── helpers ───────────────────────── */

/** "Arjun Kumar" → "AK" */
function initials(name: string): string {
  if (!name) return "FX";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Months-on-Flux label. The seed profile has no createdAt, so we use a
 *  deterministic, design-faithful "6 months" value (matches original demo). */
const MONTHS_ON_FLUX = 6;

type GoalKey =
  | "incomeTarget"
  | "spendingTarget"
  | "vaultGoal"
  | "minRunwayMonths";

const GOAL_META: Record<
  GoalKey,
  { icon: string; name: string; desc: string; suffix?: string; step?: number; min?: number }
> = {
  incomeTarget:     { icon: "target", name: "Monthly income target",   desc: "Your earning goal per month",    step: 500,  min: 0 },
  spendingTarget:   { icon: "gauge",  name: "Monthly expense ceiling", desc: "Maximum you aim to spend",       step: 500,  min: 0 },
  vaultGoal:        { icon: "vault",  name: "Safety Vault target",     desc: "Emergency fund goal",            step: 1000, min: 0 },
  minRunwayMonths:  { icon: "shield", name: "Minimum runway",          desc: "Alert threshold in months",      suffix: " mo", step: 0.5, min: 0 },
};

function formatGoal(key: GoalKey, p: FluxProfile): string {
  if (key === "minRunwayMonths") {
    return `${p.minRunwayMonths.toFixed(1)} mo`;
  }
  return formatINR(p[key] as number);
}

/* ───────────────────────── main view ───────────────────────── */

export function ProfileView() {
  const profile = useFlux((s) => s.profile);
  const snapshot = useFlux((s) => s.snapshot);
  const load = useFlux((s) => s.load);
  const { theme, lang, setTheme, setLang } = useFluxTheme();
  const { toast } = useToast();

  // profile header inline edit
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ name: "", email: "", city: "", role: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // goal inline edit
  const [editingGoal, setEditingGoal] = useState<GoalKey | null>(null);
  const [goalDraft, setGoalDraft] = useState("");
  const [savingGoal, setSavingGoal] = useState(false);

  // notification toggles (visual-only local state)
  const [notif, setNotif] = useState<Record<string, boolean>>({
    daily: true,
    spending: true,
    peakDay: true,
    weekly: false,
    breakRemind: true,
  });

  // security toggles
  const [security, setSecurity] = useState<Record<string, boolean>>({
    biometric: true,
    twoFactor: true,
  });

  const [busy, setBusy] = useState(false); // for export/reset/delete

  if (!profile) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 13, color: "var(--t3)" }}>No profile loaded.</div>
      </div>
    );
  }

  /* ── profile header save ── */
  function startEditProfile() {
    setProfileDraft({
      name: profile!.name,
      email: profile!.email,
      city: profile!.city,
      role: profile!.role,
    });
    setEditingProfile(true);
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileDraft),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      await load();
      setEditingProfile(false);
      toast({ title: "Profile updated" });
    } catch (e: any) {
      toast({ title: "Couldn't save profile", description: e?.message });
    } finally {
      setSavingProfile(false);
    }
  }

  /* ── goal save ── */
  function startEditGoal(key: GoalKey) {
    setGoalDraft(String(profile![key]));
    setEditingGoal(key);
  }

  async function saveGoal(key: GoalKey) {
    const num = key === "minRunwayMonths" ? parseFloat(goalDraft) : parseInt(goalDraft, 10);
    if (isNaN(num) || num < 0) {
      toast({ title: "Enter a valid number" });
      return;
    }
    setSavingGoal(true);
    try {
      const res = await fetch("/api/state", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: num }),
      });
      if (!res.ok) throw new Error("Failed to save goal");
      await load();
      setEditingGoal(null);
      toast({ title: "Goal updated" });
    } catch (e: any) {
      toast({ title: "Couldn't save goal", description: e?.message });
    } finally {
      setSavingGoal(false);
    }
  }

  /* ── export CSV ── */
  function exportCsv() {
    window.location.href = "/api/export";
  }

  /* ── reset app ── */
  async function resetApp() {
    if (!confirm("Reset all Flux data to the demo snapshot? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (!res.ok) throw new Error("Reset failed");
      await load();
      toast({ title: "Flux reset to demo data" });
    } catch (e: any) {
      toast({ title: "Reset failed", description: e?.message });
    } finally {
      setBusy(false);
    }
  }

  /* ── delete account (also wipes data per task spec) ── */
  async function deleteAccount() {
    if (!confirm("Delete account and wipe all local Flux data? This cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reset", { method: "POST" });
      if (!res.ok) throw new Error("Delete failed");
      await load();
      toast({ title: "Account data deleted" });
    } catch (e: any) {
      toast({ title: "Delete failed", description: e?.message });
    } finally {
      setBusy(false);
    }
  }

  /* ── sign out (visual-only) ── */
  function signOut() {
    toast({ title: "Signed out (demo)", description: "Reload to come back to Flux." });
  }

  /* ───────────────────────── render ───────────────────────── */

  const THEMES: { key: FluxTheme; label: string; desc: string }[] = [
    { key: "dark",  label: "Dark",  desc: "Graphite" },
    { key: "light", label: "Light", desc: "Airy" },
    { key: "paper", label: "Paper", desc: "Ledger" },
  ];

  const NOTIF_ROWS: { key: string; icon: string; name: string; desc: string }[] = [
    { key: "daily",      icon: "bell",     name: "Daily summary",            desc: "Morning overview of your finances" },
    { key: "spending",   icon: "gauge",    name: "Spending alerts",          desc: "When you approach your expense limit" },
    { key: "peakDay",    icon: "forecast", name: "High-income day alerts",   desc: "24 hours before predicted peaks" },
    { key: "weekly",     icon: "calendar", name: "Weekly digest",            desc: "Sunday summary" },
    { key: "breakRemind",icon: "calendar", name: "Break reminders",          desc: "Suggest rest on low-income windows" },
  ];

  const ACHIEVEMENTS: {
    icon: string; name: string; desc: string; bg: string; earned: boolean;
  }[] = [
    { icon: "plus",     name: "First Step",     desc: "Made first vault deposit",     bg: "var(--grnd)", earned: true },
    { icon: "forecast", name: "Streak Master",  desc: "30 consecutive income days",   bg: "var(--accd)", earned: true },
    { icon: "calendar", name: "Smart Break",    desc: "Break Planner used 3+ times",  bg: "var(--ambd)", earned: true },
    { icon: "vault",    name: "Vault Master",   desc: "Save ₹50,000 total",           bg: "var(--bg3)",  earned: false },
    { icon: "gauge",    name: "Zero Overspend", desc: "3 months under expense ceiling", bg: "var(--bg3)", earned: false },
  ];

  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned).length;

  /* ── goals-progress analytics (computed from live snapshot vs targets) ── */
  type GoalRow = {
    key: string;
    icon: string;
    name: string;
    currentLabel: string;
    targetLabel: string;
    pct: number;          // actual pct, may exceed 100 (e.g. runway)
    pfClass: string;      // .pf-* design-system class for the bar fill
    onTrack: boolean;
  };

  const goalRows: GoalRow[] = snapshot
    ? (() => {
        const runwayNow = runwayMonths(
          snapshot.income,
          snapshot.spending,
          snapshot.vaultBalance,
        );
        const spendPct =
          profile!.spendingTarget > 0
            ? (snapshot.spending / profile!.spendingTarget) * 100
            : 0;
        // spending approaching target is bad → green / amber / red
        const spendPfClass =
          spendPct < 50 ? "pf-grn" : spendPct <= 80 ? "pf-amb" : "pf-red";
        return [
          {
            key: "income",
            icon: "target",
            name: "Income",
            currentLabel: formatINR(snapshot.income, { compact: true }),
            targetLabel: formatINR(profile!.incomeTarget, { compact: true }),
            pct:
              profile!.incomeTarget > 0
                ? (snapshot.income / profile!.incomeTarget) * 100
                : 0,
            pfClass: "pf-acc",
            onTrack: snapshot.income >= profile!.incomeTarget,
          },
          {
            key: "spending",
            icon: "gauge",
            name: "Spending",
            currentLabel: formatINR(snapshot.spending, { compact: true }),
            targetLabel: formatINR(profile!.spendingTarget, { compact: true }),
            pct: spendPct,
            pfClass: spendPfClass,
            onTrack: snapshot.spending <= profile!.spendingTarget,
          },
          {
            key: "vault",
            icon: "vault",
            name: "Vault",
            currentLabel: formatINR(snapshot.vaultBalance, { compact: true }),
            targetLabel: formatINR(profile!.vaultGoal, { compact: true }),
            pct:
              profile!.vaultGoal > 0
                ? (snapshot.vaultBalance / profile!.vaultGoal) * 100
                : 0,
            pfClass: "pf-teal",
            onTrack: snapshot.vaultBalance >= profile!.vaultGoal,
          },
          {
            key: "runway",
            icon: "shield",
            name: "Runway",
            currentLabel: `${runwayNow.toFixed(1)} mo`,
            targetLabel: `${profile!.minRunwayMonths.toFixed(1)} mo`,
            pct:
              profile!.minRunwayMonths > 0
                ? (runwayNow / profile!.minRunwayMonths) * 100
                : 0,
            pfClass: "pf-grn",
            onTrack: runwayNow >= profile!.minRunwayMonths,
          },
        ];
      })()
    : [];

  const onTrackCount = goalRows.filter((g) => g.onTrack).length;
  const summaryColor =
    onTrackCount >= 3 ? "var(--grn)" : onTrackCount === 2 ? "var(--amb)" : "var(--red)";

  return (
    <>
      {/* ── Profile header card ───────────────────────────────────── */}
      <div className="card mb2" style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
        <div
          style={{
            width: 60, height: 60, borderRadius: "50%", background: "var(--acc)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0,
          }}
        >
          {initials(profile.name)}
        </div>

        <div style={{ flex: 1, minWidth: 200 }}>
          {editingProfile ? (
            <div className="stack" style={{ gap: 8 }}>
              <input
                className="flux-input"
                value={profileDraft.name}
                onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                placeholder="Name"
                style={inputStyle}
              />
              <input
                className="flux-input"
                value={profileDraft.email}
                onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })}
                placeholder="Email"
                style={inputStyle}
              />
              <input
                className="flux-input"
                value={profileDraft.city}
                onChange={(e) => setProfileDraft({ ...profileDraft, city: e.target.value })}
                placeholder="City"
                style={inputStyle}
              />
              <input
                className="flux-input"
                value={profileDraft.role}
                onChange={(e) => setProfileDraft({ ...profileDraft, role: e.target.value })}
                placeholder="Role"
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={saveProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving…" : "Save"}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditingProfile(false)}
                  disabled={savingProfile}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: 20, fontWeight: 700, color: "var(--t1)",
                  letterSpacing: "-.03em", marginBottom: 3,
                }}
              >
                {profile.name}
              </div>
              <div style={{ fontSize: 12.5, color: "var(--t3)", marginBottom: 11 }}>
                {profile.email} · {profile.city} · {MONTHS_ON_FLUX} months on Flux
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                <span className="badge bl">{profile.role}</span>
                <span className="badge bg">Complete</span>
                <span className="badge bk">Irregular income</span>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: "right", flexShrink: 0, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}>
            <svg width={76} height={76} style={{ transform: "rotate(-90deg)" }}>
              <circle cx={38} cy={38} r={32} fill="none" stroke="var(--bg3)" strokeWidth={6} />
              <circle
                cx={38} cy={38} r={32} fill="none"
                stroke={profile.stabilityScore >= 70 ? "var(--grn)" : profile.stabilityScore >= 50 ? "var(--amb)" : "var(--red)"}
                strokeWidth={6}
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - profile.stabilityScore / 100)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), stroke .4s" }}
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div className="flux-mono" style={{ fontSize: 20, fontWeight: 700, color: "var(--t1)", lineHeight: 1 }}>{profile.stabilityScore}</div>
              <div style={{ fontSize: 7.5, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700, marginTop: 2 }}>/ 100</div>
            </div>
          </div>
          <div>
            <div className="label-sm" style={{ marginBottom: 4 }}>Stability score</div>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: profile.stabilityScore >= 70 ? "var(--grn)" : profile.stabilityScore >= 50 ? "var(--amb)" : "var(--red)" }}>
              {profile.stabilityScore >= 70 ? "Good standing" : profile.stabilityScore >= 50 ? "Fair standing" : "Needs attention"}
            </div>
            <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>Updated live</div>
          </div>
        </div>

        {!editingProfile && (
          <button className="btn btn-secondary btn-sm" onClick={startEditProfile}>
            Edit profile
          </button>
        )}
      </div>

      {/* ── Goals progress analytics card ─────────────────────────── */}
      {snapshot && (
        <div className="card mb2">
          <div className="card-h" style={{ marginBottom: 14 }}>
            <div>
              <div className="card-t">Goals progress</div>
              <div className="card-s">How close you are to each financial target</div>
            </div>
            <span className="badge bl">
              {onTrackCount} / 4 on track
            </span>
          </div>

          <div className="g2">
            {goalRows.map((g) => {
              const barPct = Math.min(100, g.pct);          // visual cap
              const pctText = `${Math.round(g.pct)}%`;      // actual number shown
              return (
                <div
                  key={g.key}
                  style={{
                    padding: 12,
                    background: "var(--surf2)",
                    borderRadius: 10,
                    border: "1px solid var(--bdr)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 9 }}>
                    <div
                      className="sr-icon"
                      style={{ width: 26, height: 26 }}
                    >
                      <Icon name={g.icon} size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t1)" }}>
                        {g.name}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 1 }}>
                        <span className="flux-mono">{g.currentLabel}</span>
                        <span style={{ opacity: 0.6 }}> / </span>
                        <span className="flux-mono">{g.targetLabel}</span>
                      </div>
                    </div>
                    <div
                      className="flux-mono"
                      style={{ fontSize: 13, fontWeight: 700, color: "var(--t1)" }}
                    >
                      {pctText}
                    </div>
                  </div>
                  <div className="prog">
                    <div
                      className={`pf ${g.pfClass}`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 12,
              borderTop: "1px solid var(--bdr)",
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <span style={{ color: summaryColor, display: "inline-flex" }}>
              <Icon name="check" size={16} />
            </span>
            <div style={{ fontSize: 12.5, color: "var(--t2)" }}>
              You&apos;re on track to meet{" "}
              <span
                className="flux-mono"
                style={{ color: summaryColor, fontWeight: 700 }}
              >
                {onTrackCount}
              </span>{" "}
              of 4 goals
            </div>
          </div>
        </div>
      )}

      {/* ── Two-column grid ──────────────────────────────────────── */}
      <div className="g2">
        {/* ── LEFT stack ── */}
        <div className="stack">
          {/* Appearance — at top so the theme switcher is always visible */}
          <div className="card">
            <div className="card-t" style={{ marginBottom: 12 }}>Appearance</div>
            <div style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 10, lineHeight: 1.55 }}>
              Choose your workspace theme.
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {THEMES.map((t) => {
                const isActive = theme === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => setTheme(t.key)}
                    aria-pressed={isActive}
                    style={{
                      flex: 1,
                      position: "relative",
                      background: "var(--surf2)",
                      border: `2px solid ${isActive ? "var(--acc)" : "var(--bdr)"}`,
                      borderRadius: 10,
                      padding: 8,
                      cursor: "pointer",
                      transition: "border-color .15s, box-shadow .15s, transform .12s",
                      boxShadow: isActive ? "0 0 0 3px var(--accd)" : "none",
                      textAlign: "left",
                    }}
                  >
                    {/* Isolated theme preview: data-theme on the wrapper makes the
                        var(--bg/surf/acc) swatches resolve to THIS theme's palette. */}
                    <div data-theme={t.key} style={{ display: "flex", gap: 4, marginBottom: 7 }}>
                      <div style={{ flex: 1, height: 22, borderRadius: 4, background: "var(--bg)" }} />
                      <div style={{ flex: 1, height: 22, borderRadius: 4, background: "var(--surf)" }} />
                      <div style={{ flex: 1, height: 22, borderRadius: 4, background: "var(--acc)" }} />
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "var(--t1)" }}>{t.label}</div>
                    <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 1, letterSpacing: ".02em" }}>{t.desc}</div>

                    {isActive && (
                      <div
                        style={{
                          position: "absolute",
                          top: 5,
                          right: 5,
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          background: "var(--acc)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "var(--s1)",
                        }}
                      >
                        <Icon name="check" size={10} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="div" />

            <div className="sr" style={{ borderBottom: "none", padding: "4px 0 0" }}>
              <div className="sr-info">
                <div className="sr-icon"><Icon name="globe" size={15} /></div>
                <div>
                  <div className="sr-name">Language</div>
                  <div className="sr-desc">Interface translation</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {(["en", "hi"] as FluxLang[]).map((l) => (
                  <button
                    key={l}
                    className={`lang-btn${lang === l ? " active" : ""}`}
                    onClick={() => setLang(l)}
                  >
                    {l === "en" ? "EN" : "हिं"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Financial goals */}
          <div className="card">
            <div className="card-t" style={{ marginBottom: 13 }}>Financial goals</div>

            {(Object.keys(GOAL_META) as GoalKey[]).map((key) => {
              const meta = GOAL_META[key];
              return (
                <div className="sr" key={key}>
                  <div className="sr-info">
                    <div className="sr-icon"><Icon name={meta.icon} size={15} /></div>
                    <div>
                      <div className="sr-name">{meta.name}</div>
                      <div className="sr-desc">{meta.desc}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {editingGoal === key ? (
                      <>
                        <input
                          type="number"
                          className="flux-input flux-mono"
                          value={goalDraft}
                          onChange={(e) => setGoalDraft(e.target.value)}
                          step={meta.step}
                          min={meta.min}
                          style={{ ...inputStyle, width: 110, textAlign: "right" }}
                          autoFocus
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => saveGoal(key)}
                          disabled={savingGoal}
                        >
                          {savingGoal ? "…" : "Save"}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditingGoal(null)}
                          disabled={savingGoal}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flux-mono" style={{ fontSize: 13.5, fontWeight: 600, color: "var(--t1)" }}>
                          {formatGoal(key, profile)}
                        </span>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEditGoal(key)}
                        >
                          <Icon name="settings" size={11} /> Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Income profile */}
          <div className="card">
            <div className="card-t" style={{ marginBottom: 13 }}>Income profile</div>
            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon"><Icon name="briefcase" size={15} /></div>
                <div>
                  <div className="sr-name">Work type</div>
                  <div className="sr-desc">Freelance setup</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: "var(--t2)" }}>{profile.workType}</span>
            </div>
            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon"><Icon name="calendar" size={15} /></div>
                <div>
                  <div className="sr-name">Payment frequency</div>
                  <div className="sr-desc">Income cadence</div>
                </div>
              </div>
              <span style={{ fontSize: 13, color: "var(--t2)" }}>{profile.paymentFreq}</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT stack ── */}
        <div className="stack">
          {/* Notifications */}
          <div className="card">
            <div className="card-t" style={{ marginBottom: 12 }}>Notifications</div>
            {NOTIF_ROWS.map((row) => (
              <div className="sr" key={row.key}>
                <div className="sr-info">
                  <div className="sr-icon"><Icon name={row.icon} size={15} /></div>
                  <div>
                    <div className="sr-name">{row.name}</div>
                    <div className="sr-desc">{row.desc}</div>
                  </div>
                </div>
                <div
                  className={`toggle${notif[row.key] ? " on" : ""}`}
                  onClick={() => setNotif({ ...notif, [row.key]: !notif[row.key] })}
                  role="switch"
                  aria-checked={notif[row.key]}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setNotif({ ...notif, [row.key]: !notif[row.key] });
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Security */}
          <div className="card">
            <div className="card-t" style={{ marginBottom: 12 }}>Security</div>

            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon"><Icon name="lock" size={15} /></div>
                <div><div className="sr-name">Biometric lock</div></div>
              </div>
              <div
                className={`toggle${security.biometric ? " on" : ""}`}
                onClick={() => setSecurity({ ...security, biometric: !security.biometric })}
                role="switch"
                aria-checked={security.biometric}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSecurity({ ...security, biometric: !security.biometric });
                  }
                }}
              />
            </div>

            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon"><Icon name="shield" size={15} /></div>
                <div><div className="sr-name">Two-factor authentication</div></div>
              </div>
              <div
                className={`toggle${security.twoFactor ? " on" : ""}`}
                onClick={() => setSecurity({ ...security, twoFactor: !security.twoFactor })}
                role="switch"
                aria-checked={security.twoFactor}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSecurity({ ...security, twoFactor: !security.twoFactor });
                  }
                }}
              />
            </div>

            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon"><Icon name="download" size={15} /></div>
                <div><div className="sr-name">Export all data</div></div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={exportCsv}>Export CSV</button>
            </div>

            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon"><Icon name="refresh" size={15} /></div>
                <div>
                  <div className="sr-name">Reset app stats</div>
                  <div className="sr-desc">Restore the demo numbers and charts</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={resetApp} disabled={busy}>Reset</button>
            </div>

            <div className="sr">
              <div className="sr-info">
                <div className="sr-icon" style={{ color: "var(--red)" }}><Icon name="trash" size={15} /></div>
                <div>
                  <div className="sr-name" style={{ color: "var(--red)" }}>Delete account</div>
                  <div className="sr-desc">Reset local Flux data</div>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={deleteAccount} disabled={busy}>Delete</button>
            </div>
          </div>

          {/* Achievements */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
              <div className="card-t">Achievements</div>
              <span className="badge bl">{earnedCount} / {ACHIEVEMENTS.length} earned</span>
            </div>
            <div className="prog" style={{ marginBottom: 14 }}>
              <div
                className="pf pf-acc"
                style={{ width: `${(earnedCount / ACHIEVEMENTS.length) * 100}%` }}
              />
            </div>
            {ACHIEVEMENTS.map((a, i) => (
              <div
                className="li"
                key={a.name}
                style={{
                  opacity: a.earned ? 1 : 0.36,
                  borderBottom: i === ACHIEVEMENTS.length - 1 ? "none" : undefined,
                }}
              >
                <div className="li-icon" style={{ background: a.bg }}>
                  <Icon name={a.icon} size={15} />
                </div>
                <div className="li-body">
                  <div className="li-name">{a.name}</div>
                  <div className="li-meta">{a.desc}</div>
                </div>
                <span className={`badge ${a.earned ? "bg" : "bk"}`}>
                  {a.earned ? "Earned" : "Locked"}
                </span>
              </div>
            ))}
          </div>

          {/* Sign out */}
          <button
            className="btn btn-ghost btn-full"
            onClick={signOut}
            style={{ border: "1px solid var(--bdr)", color: "var(--red)" }}
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const inputStyle: React.CSSProperties = {
  background: "var(--bg2)",
  border: "1px solid var(--bdr)",
  borderRadius: 8,
  padding: "7px 10px",
  fontSize: 12.5,
  color: "var(--t1)",
  outline: "none",
  width: "100%",
};
