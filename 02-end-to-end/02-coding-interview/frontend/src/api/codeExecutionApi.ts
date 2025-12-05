import { useMutation } from "@tanstack/react-query";
import type { SupportedLanguage } from "@/utils/session";
import { runCode, type RunResult } from "@/utils/codeRunner";
import { API_BASE_URL, USE_MOCK_API } from "./client";

export interface ExecuteCodePayload {
  code: string;
  language: SupportedLanguage;
  sessionId?: string;
}

export type ExecuteCodeResponse = RunResult & { sessionId?: string };

// --- Mock implementation (delegates to in-browser runner) ---

const mockExecuteCode = async (payload: ExecuteCodePayload): Promise<ExecuteCodeResponse> => {
  const { sessionId, code, language } = payload;
  const result = await runCode({ code, language });
  return { ...result, sessionId };
};

// --- Real HTTP implementation (FastAPI-ready) ---

const realExecuteCode = async (payload: ExecuteCodePayload): Promise<ExecuteCodeResponse> => {
  const response = await fetch(`${API_BASE_URL}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to execute code");
  }

  return (await response.json()) as ExecuteCodeResponse;
};

// --- Public helpers ---

export const executeCode = async (payload: ExecuteCodePayload): Promise<ExecuteCodeResponse> =>
  USE_MOCK_API ? mockExecuteCode(payload) : realExecuteCode(payload);

export const useExecuteCode = () =>
  useMutation({
    mutationKey: ["executeCode"],
    mutationFn: executeCode,
  });
