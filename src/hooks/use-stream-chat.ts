"use client";

import { useState, useCallback, useRef } from "react";

interface UseStreamChatOptions {
  onToken: (token: string) => void;
  onDone: (fullContent: string) => void;
  onError?: (err: string) => void;
}

/**
 * Streams an AI chat response from /api/chat/stream via Server-Sent Events.
 * Returns { send, streaming, abort }.
 */
export function useStreamChat({ onToken, onDone, onError }: UseStreamChatOptions) {
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (message: string) => {
    if (streaming) return;
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Parse SSE lines
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const data = JSON.parse(jsonStr);
            if (data.token) {
              fullContent += data.token;
              onToken(data.token);
            }
            if (data.done) {
              fullContent = data.content || fullContent;
              onDone(fullContent);
            }
            if (data.error) {
              onError?.(data.error);
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      onError?.(err?.message ?? "Stream failed");
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [streaming, onToken, onDone, onError]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  return { send, streaming, abort };
}
