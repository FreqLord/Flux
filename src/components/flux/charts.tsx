"use client";

import { useEffect, useRef, useState } from "react";

/* ── Theme-aware color reader ── */
function readVar(name: string, fallback = "#888"): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

function useThemeColors() {
  const [colors, setColors] = useState({
    acc: "#6d8cff", grn: "#2db976", red: "#e85555", amb: "#f59c2a",
    teal: "#22c4af", t1: "#eef2fb", t2: "#a1abc2", t3: "#6f7a95",
    bdr: "#2b3447", bg2: "#161b24", bg3: "#1d2330", ctxt: "#6f7a95",
  });
  useEffect(() => {
    const read = () => setColors({
      acc: readVar("--acc"), grn: readVar("--grn"), red: readVar("--red"),
      amb: readVar("--amb"), teal: readVar("--teal"), t1: readVar("--t1"),
      t2: readVar("--t2"), t3: readVar("--t3"), bdr: readVar("--bdr"),
      bg2: readVar("--bg2"), bg3: readVar("--bg3"), ctxt: readVar("--ctxt"),
    });
    read();
    const obs = new MutationObserver(read);
    if (typeof document !== "undefined") {
      obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }
    return () => obs.disconnect();
  }, []);
  return colors;
}

/* ── Bar chart (income vs spending etc.) ── */
export function BarChart({
  series, labels, height = 180, formatVal,
}: {
  series: { data: number[]; color: "acc" | "red" | "grn" | "amb" | "teal"; label?: string }[];
  labels: string[];
  height?: number;
  formatVal?: (n: number) => string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useThemeColors();
  const [hover, setHover] = useState<{ i: number; x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const pad = { t: 14, r: 12, b: 28, l: 44 };
    const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
    const allVals = series.flatMap((s) => s.data);
    const maxV = Math.max(1, ...allVals);
    const minV = 0;
    const range = maxV - minV || 1;

    // grid
    ctx.strokeStyle = colors.bdr; ctx.lineWidth = 1;
    ctx.font = "500 9px Inter, sans-serif"; ctx.fillStyle = colors.ctxt;
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let g = 0; g <= 4; g++) {
      const y = pad.t + (ch * g) / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      const v = maxV - (range * g) / 4;
      ctx.fillText(formatVal ? formatVal(v) : Math.round(v).toString(), pad.l - 6, y);
    }

    const n = labels.length;
    const groupW = cw / n;
    const barGap = 3;
    const barW = (groupW - barGap * (series.length + 1)) / series.length;

    series.forEach((s, si) => {
      const colorMap: any = { acc: colors.acc, red: colors.red, grn: colors.grn, amb: colors.amb, teal: colors.teal };
      s.data.forEach((v, i) => {
        const x = pad.l + i * groupW + barGap + si * (barW + barGap);
        const h = (v / range) * ch;
        const y = pad.t + ch - h;
        ctx.fillStyle = colorMap[s.color];
        if (hover && hover.i === i) {
          ctx.fillStyle = colorMap[s.color];
          ctx.shadowColor = colorMap[s.color]; ctx.shadowBlur = 8;
        }
        roundRect(ctx, x, y, barW, Math.max(1, h), 3);
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    });

    // x labels
    ctx.fillStyle = colors.ctxt; ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.font = "600 9px Inter, sans-serif";
    labels.forEach((l, i) => {
      const x = pad.l + i * groupW + groupW / 2;
      ctx.fillText(l, x, H - pad.b + 6);
    });
  }, [series, labels, colors, hover, height, formatVal]);

  function onMove(e: React.MouseEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pad = { l: 44, r: 12 };
    const cw = canvas.clientWidth - pad.l - pad.r;
    const n = labels.length;
    const groupW = cw / n;
    const i = Math.floor((x - pad.l) / groupW);
    if (i >= 0 && i < n) setHover({ i, x, y: e.clientY - rect.top });
    else setHover(null);
  }

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height, cursor: "pointer" }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      />
      {hover && (
        <div
          style={{
            position: "absolute", left: hover.x, top: 6, transform: "translateX(-50%)",
            background: "var(--surf3)", border: "1px solid var(--bdr2)",
            borderRadius: 8, padding: "6px 9px", fontSize: 10.5, color: "var(--t1)",
            pointerEvents: "none", whiteSpace: "nowrap", boxShadow: "var(--s2)", zIndex: 5,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{labels[hover.i]}</div>
          {series.map((s, si) => (
            <div key={si} className="flex items-center gap-1.5">
              <span style={{ width: 8, height: 8, borderRadius: 2, background: s.color === "acc" ? colors.acc : s.color === "red" ? colors.red : s.color === "grn" ? colors.grn : s.color === "amb" ? colors.amb : colors.teal }} />
              <span style={{ color: "var(--t3)" }}>{s.label || s.color}:</span>
              <span className="flux-mono" style={{ fontWeight: 600 }}>
                {formatVal ? formatVal(s.data[hover.i]) : s.data[hover.i]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Line chart with optional CI band ── */
export function LineChart({
  lines, labels, height = 180, formatVal, band,
}: {
  lines: { data: number[]; color: "acc" | "red" | "grn" | "amb" | "teal" | "t1"; label?: string; dashed?: boolean }[];
  labels: string[];
  height?: number;
  formatVal?: (n: number) => string;
  band?: { low: number[]; high: number[] };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useThemeColors();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);
    const pad = { t: 14, r: 12, b: 24, l: 44 };
    const cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
    const all = [...lines.flatMap((l) => l.data), ...(band ? [...band.low, ...band.high] : [])];
    const maxV = Math.max(...all), minV = Math.min(0, ...all);
    const range = maxV - minV || 1;

    ctx.strokeStyle = colors.bdr; ctx.lineWidth = 1;
    ctx.font = "500 9px Inter, sans-serif"; ctx.fillStyle = colors.ctxt;
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    for (let g = 0; g <= 4; g++) {
      const y = pad.t + (ch * g) / 4;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
      const v = maxV - (range * g) / 4;
      ctx.fillText(formatVal ? formatVal(v) : Math.round(v).toString(), pad.l - 6, y);
    }

    const n = labels.length;
    const xAt = (i: number) => pad.l + (cw * i) / Math.max(1, n - 1);
    const yAt = (v: number) => pad.t + ch - ((v - minV) / range) * ch;

    // band
    if (band) {
      ctx.beginPath();
      band.high.forEach((v, i) => { const x = xAt(i), y = yAt(v); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      for (let i = band.low.length - 1; i >= 0; i--) { ctx.lineTo(xAt(i), yAt(band.low[i])); }
      ctx.closePath();
      ctx.fillStyle = colors.acc + "22";
      ctx.fill();
    }

    const colorMap: any = { acc: colors.acc, red: colors.red, grn: colors.grn, amb: colors.amb, teal: colors.teal, t1: colors.t1 };

    lines.forEach((l) => {
      ctx.strokeStyle = colorMap[l.color];
      ctx.lineWidth = l.dashed ? 1.6 : 2.2;
      ctx.setLineDash(l.dashed ? [4, 4] : []);
      ctx.beginPath();
      l.data.forEach((v, i) => { const x = xAt(i), y = yAt(v); if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
      ctx.stroke();
      ctx.setLineDash([]);
    });

    ctx.fillStyle = colors.ctxt; ctx.textAlign = "center"; ctx.textBaseline = "top";
    ctx.font = "600 9px Inter, sans-serif";
    const step = Math.ceil(n / 8);
    labels.forEach((l, i) => { if (i % step === 0 || i === n - 1) ctx.fillText(l, xAt(i), H - pad.b + 6); });
  }, [lines, labels, colors, band, height, formatVal]);

  return <canvas ref={canvasRef} style={{ width: "100%", height }} />;
}

/* ── Donut chart ── */
export function Donut({
  segments, size = 120, thickness = 14, centerLabel, centerValue,
}: {
  segments: { value: number; color: "acc" | "red" | "grn" | "amb" | "teal" | "t2" | "indigo"; label: string }[];
  size?: number; thickness?: number; centerLabel?: string; centerValue?: string;
}) {
  const colors = useThemeColors();
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  const colorMap: any = { acc: colors.acc, red: colors.red, grn: colors.grn, amb: colors.amb, teal: colors.teal, t2: colors.t2, indigo: "#7c6cf4" };

  // Precompute cumulative offsets functionally (no mutation during render)
  const segMeta = segments.reduce<{ len: number; off: number }[]>((acc, s) => {
    const len = (s.value / total) * circ;
    const off = acc.length ? acc[acc.length - 1].off + acc[acc.length - 1].len : 0;
    acc.push({ len, off });
    return acc;
  }, []);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={colors.bg3} strokeWidth={thickness} />
      {segments.map((s, i) => {
        const { len, off } = segMeta[i];
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r} fill="none"
            stroke={colorMap[s.color]} strokeWidth={thickness}
            strokeDasharray={`${len} ${circ - len}`}
            strokeDashoffset={-off}
            strokeLinecap="butt"
          />
        );
      })}
      {centerValue && (
        <text x={cx} y={cy - 2} textAnchor="middle" dominantBaseline="middle"
          style={{ transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px`, fill: "var(--t1)", font: "600 16px JetBrains Mono, monospace" }}>
          {centerValue}
        </text>
      )}
      {centerLabel && (
        <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="middle"
          style={{ transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px`, fill: "var(--t3)", font: "700 8px Inter, sans-serif", textTransform: "uppercase", letterSpacing: ".08em" }}>
          {centerLabel}
        </text>
      )}
    </svg>
  );
}

/* ── Sparkline ── */
export function Sparkline({ data, color = "acc", height = 34 }: { data: number[]; color?: "acc" | "red" | "grn" | "teal"; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colors = useThemeColors();
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth, H = height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    const ctx = canvas.getContext("2d")!; ctx.scale(dpr, dpr); ctx.clearRect(0, 0, W, H);
    if (data.length < 2) return;
    const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
    const colorMap: any = { acc: colors.acc, red: colors.red, grn: colors.grn, teal: colors.teal };
    ctx.strokeStyle = colorMap[color]; ctx.lineWidth = 1.6; ctx.beginPath();
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * W;
      const y = H - 2 - ((v - min) / range) * (H - 4);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
    // fill
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fillStyle = colorMap[color] + "1f"; ctx.fill();
  }, [data, colors, height]);
  return <canvas ref={canvasRef} style={{ width: "100%", height }} />;
}

/* ── Progress ring (SVG) ── */
export function ProgressRing({
  value, size = 120, thickness = 12, color = "amb", label, sublabel,
}: {
  value: number; size?: number; thickness?: number; color?: "acc" | "grn" | "amb" | "red" | "teal"; label?: string; sublabel?: string;
}) {
  const colors = useThemeColors();
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circ - (pct / 100) * circ;
  const colorMap: any = { acc: colors.acc, grn: colors.grn, amb: colors.amb, red: colors.red, teal: colors.teal };
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={colors.bg3} strokeWidth={thickness} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={colorMap[color]} strokeWidth={thickness}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(.4,0,.2,1), stroke .4s" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div className="flux-mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--t1)", lineHeight: 1 }}>{label ?? `${Math.round(pct)}%`}</div>
        {sublabel && <div style={{ fontSize: 9, color: "var(--t3)", marginTop: 3, textTransform: "uppercase", letterSpacing: ".08em", fontWeight: 700 }}>{sublabel}</div>}
      </div>
    </div>
  );
}

/* ── helper ── */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
