"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Minimal, safe markdown renderer for AI chat responses.
 * Supports: headings, bold, italic, inline code, code blocks, unordered/ordered
 * lists, blockquotes, links, hr, paragraphs, and line breaks.
 * No external deps — parses line-by-line.
 *
 * Intentionally NOT a full markdown engine; sanitizes by rendering text via React
 * (so HTML in the AI response is shown literally, never executed).
 */
export function Markdown({ content }: { content: string }) {
  const blocks = parseBlocks(content);
  return <div className="flux-markdown">{blocks.map((b, i) => renderBlock(b, i))}</div>;
}

type Block =
  | { type: "h"; level: 1 | 2 | 3; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang: string; text: string }
  | { type: "quote"; text: string }
  | { type: "hr" };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // code block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push({ type: "code", lang, text: buf.join("\n") });
      continue;
    }
    // heading
    const hMatch = line.match(/^(#{1,3})\s+(.*)$/);
    if (hMatch) {
      blocks.push({ type: "h", level: hMatch[1].length as 1 | 2 | 3, text: hMatch[2] });
      i++;
      continue;
    }
    // hr
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    // blockquote
    if (line.trim().startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: buf.join(" ") });
      continue;
    }
    // unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    // blank line
    if (line.trim() === "") {
      i++;
      continue;
    }
    // paragraph (collect until blank or block-starter)
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3})\s/.test(lines[i]) &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("```") &&
      !/^\s*([-*_])\1{2,}\s*$/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", text: buf.join(" ") });
  }
  return blocks;
}

function renderInline(text: string): React.ReactNode[] {
  // order: code, bold, italic, links
  const nodes: React.ReactNode[] = [];
  // tokenize using a combined regex
  const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) {
      nodes.push(<code key={key++}>{tok.slice(1, -1)}</code>);
    } else if (tok.startsWith("**")) {
      nodes.push(<strong key={key++}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith("*")) {
      nodes.push(<em key={key++}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith("[")) {
      const mm = tok.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (mm) nodes.push(<a key={key++} href={mm[2]} target="_blank" rel="noopener noreferrer">{mm[1]}</a>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function renderBlock(b: Block, i: number): React.ReactNode {
  switch (b.type) {
    case "h":
      if (b.level === 1) return <h1 key={i}>{renderInline(b.text)}</h1>;
      if (b.level === 2) return <h2 key={i}>{renderInline(b.text)}</h2>;
      return <h3 key={i}>{renderInline(b.text)}</h3>;
    case "p":
      return <p key={i}>{renderInline(b.text)}</p>;
    case "ul":
      return <ul key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ul>;
    case "ol":
      return <ol key={i}>{b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>)}</ol>;
    case "code":
      return <pre key={i}><code>{b.text}</code></pre>;
    case "quote":
      return <blockquote key={i}>{renderInline(b.text)}</blockquote>;
    case "hr":
      return <hr key={i} />;
  }
}

/* ── Count-up number animation hook ── */
export function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const ref = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const from = ref.current;
    const delta = target - from;
    if (Math.abs(delta) < 0.5) {
      ref.current = target;
      // defer to next tick to avoid synchronous setState in effect
      const id = setTimeout(() => setVal(target), 0);
      return () => clearTimeout(id);
    }
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const v = from + delta * eased;
      setVal(v);
      ref.current = v;
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else { ref.current = target; setVal(target); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return val;
}

/** Count-up component that animates from 0 to the target value, formatted. */
export function CountUp({
  value, format, className, style,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const v = useCountUp(value);
  const display = format ? format(v) : Math.round(v).toLocaleString("en-IN");
  return <span className={`count-up ${className ?? ""}`} style={style}>{display}</span>;
}
