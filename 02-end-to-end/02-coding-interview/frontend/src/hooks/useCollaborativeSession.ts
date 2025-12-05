import { useEffect, useMemo, useState } from "react";
import type { SessionState, SupportedLanguage } from "@/utils/session";
import { loadSessionState, mergeRemoteUpdate, persistSessionState } from "@/utils/session";

const buildChannelName = (sessionId: string) => `code-interview-room::${sessionId}`;

export interface UseCollaborativeSessionOptions {
  sessionId: string;
  initialLanguage?: SupportedLanguage;
}

export interface UseCollaborativeSessionResult {
  state: SessionState;
  setLanguage: (language: SupportedLanguage) => void;
  setCode: (code: string) => void;
}

export const useCollaborativeSession = (
  options: UseCollaborativeSessionOptions,
): UseCollaborativeSessionResult => {
  const { sessionId, initialLanguage = "javascript" } = options;
  const [state, setState] = useState<SessionState>(() =>
    loadSessionState(sessionId, initialLanguage),
  );

  const channel = useMemo(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
    return new BroadcastChannel(buildChannelName(sessionId));
  }, [sessionId]);

  // Listen for remote updates
  useEffect(() => {
    if (!channel) return;

    const handler = (event: MessageEvent<SessionState>) => {
      setState((current) => mergeRemoteUpdate(current, event.data));
    };

    channel.addEventListener("message", handler as EventListener);
    return () => {
      channel.removeEventListener("message", handler as EventListener);
    };
  }, [channel]);

  // Persist changes locally & broadcast
  useEffect(() => {
    persistSessionState(state);
    if (!channel) return;
    channel.postMessage(state);
  }, [state, channel]);

  const setLanguage = (language: SupportedLanguage) => {
    setState((prev) => ({ ...prev, language, updatedAt: Date.now() }));
  };

  const setCode = (code: string) => {
    setState((prev) => ({ ...prev, code, updatedAt: Date.now() }));
  };

  return { state, setLanguage, setCode };
};
