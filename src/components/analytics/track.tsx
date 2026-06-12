"use client";

import { useEffect } from "react";

function sessionId(): string {
  try {
    let id = sessionStorage.getItem("rmx_session");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("rmx_session", id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/** Dispara um evento de analytics (fire-and-forget, nunca quebra a UX). */
export function track(event: string, metadata?: Record<string, unknown>) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event,
        path: window.location.pathname,
        sessionId: sessionId(),
        metadata,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // tracking é melhor-esforço
  }
}

interface TrackViewProps {
  event: string;
  /** evita duplicar o evento na mesma sessão do navegador */
  oncePerSession?: boolean;
}

/** Componente invisível que registra uma visualização ao montar. */
export function TrackView({ event, oncePerSession = true }: TrackViewProps) {
  useEffect(() => {
    if (oncePerSession) {
      const key = `rmx_tracked_${event}`;
      try {
        if (sessionStorage.getItem(key)) return;
        sessionStorage.setItem(key, "1");
      } catch {
        // sem sessionStorage, registra mesmo assim
      }
    }
    track(event);
  }, [event, oncePerSession]);

  return null;
}
