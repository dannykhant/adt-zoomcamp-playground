import { useEffect, useState, useRef } from "react";
import type { SessionState, SupportedLanguage } from "@/utils/session";
import { getSessionState, updateSessionState, DEFAULT_SNIPPETS } from "@/utils/session";
import { toast } from "sonner";

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
  const [state, setState] = useState<SessionState>({
    code: DEFAULT_SNIPPETS[initialLanguage],
    language: initialLanguage,
  });

  const isLocalChange = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const fetchState = async () => {
      try {
        const remoteState = await getSessionState(sessionId);
        if (isMounted && !isLocalChange.current) {
          setState({
            code: remoteState.code || DEFAULT_SNIPPETS[remoteState.language as SupportedLanguage] || "",
            language: remoteState.language as SupportedLanguage
          });
        }
      } catch (error) {
        // console.error("Failed to fetch session state", error);
      }
    };

    fetchState();
    const interval = setInterval(fetchState, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [sessionId]);

  const setLanguage = async (language: SupportedLanguage) => {
    const newState = { ...state, language, code: DEFAULT_SNIPPETS[language] };
    setState(newState);
    isLocalChange.current = true;
    try {
      const token = localStorage.getItem("token") || undefined;
      await updateSessionState(sessionId, newState, token);
    } catch (error) {
      toast.error("Failed to sync language change");
    } finally {
      setTimeout(() => { isLocalChange.current = false; }, 1000);
    }
  };

  const setCode = (code: string) => {
    const newState = { ...state, code };
    setState(newState);
    isLocalChange.current = true;
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isLocalChange.current) {
        try {
          const token = localStorage.getItem("token") || undefined;
          await updateSessionState(sessionId, state, token);
        } catch (error) {
          console.error("Failed to sync code", error);
        } finally {
          isLocalChange.current = false;
        }
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [state, sessionId]);

  return { state, setLanguage, setCode };
};
