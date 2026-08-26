"use client";

import { useState } from "react";
import { useFlux, formatINR, type FluxProfile } from "@/store/flux-store";
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

  const THEMES: { key: FluxTheme; label: string }[] = [
    { key: "dark",  label: "Dark" },
    { key: "light", label: "Light" },
    { key: "paper", label: "Paper" },
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

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div className="label-sm" style={{ marginBottom: 5 }}>Stability score</div>
          <div
            className="flux-mono"
            style={{
              fontSize: 52, fontWeight: 600, color: "var(--acc)",
              lineHeight: 1, letterSpacing: "-.035em",
            }}
          >
            {profile.stabilityScore}
          </div>
          <div style={{ fontSize: 11, color: "var(--t3)", marginTop: 2 }}>Good standing</div>
        </div>

        {!editingProfile && (
          <button className="btn btn-secondary btn-sm" onClick={startEditProfile}>
            Edit profile
          </button>
        )}
      </div>

      {/* ── Two-column grid ──────────────────────────────────────── */}
      <div className="g2">
        {/* ── LEFT stack ── */}
        <div className="stack">
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
                          className="btn btn-ghost btn-sm"
                          onClick={() => startEditGoal(key)}
                        >
                          Edit
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

          {/* Appearance */}
          <div className="card">
            <div className="card-t" style={{ marginBottom: 12 }}>Appearance</div>
            <div style={{ fontSize: 11.5, color: "var(--t3)", marginBottom: 10, lineHeight: 1.55 }}>
              Choose your workspace theme.
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {THEMES.map((t) => (
                <button
                  key={t.key}
                  className={`theme-btn${theme === t.key ? " active" : ""}`}
                  onClick={() => setTheme(t.key)}
                  style={{
                    flex: 1, height: 36, borderRadius: 8,
                    border: "1px solid var(--bdr)", fontSize: 12.5, fontWeight: 600,
                  }}
                >
                  {t.label}
                </button>
              ))}
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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
              <div className="card-t">Achievements</div>
              <span className="badge bl">{earnedCount} / {ACHIEVEMENTS.length}</span>
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
