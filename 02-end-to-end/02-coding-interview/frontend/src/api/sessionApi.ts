import { useMutation, useQuery } from "@tanstack/react-query";
import { generateSessionId } from "@/utils/session";
import { API_BASE_URL, USE_MOCK_API } from "./client";

export interface SessionSummary {
  id: string;
  shareUrl: string;
  createdAt: string;
}

const buildShareUrl = (id: string) => `${window.location.origin}/session/${id}`;

// --- Mock implementations (used while there is no real backend) ---

const mockCreateSession = async (): Promise<SessionSummary> => {
  const id = generateSessionId();
  return {
    id,
    shareUrl: buildShareUrl(id),
    createdAt: new Date().toISOString(),
  };
};

const mockGetSession = async (id: string): Promise<SessionSummary> => ({
  id,
  shareUrl: buildShareUrl(id),
  createdAt: new Date().toISOString(),
});

// --- Real HTTP implementations (for future FastAPI backend) ---

const realCreateSession = async (): Promise<SessionSummary> => {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error("Failed to create session");
  }

  return (await response.json()) as SessionSummary;
};

const realGetSession = async (id: string): Promise<SessionSummary> => {
  const response = await fetch(`${API_BASE_URL}/sessions/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw new Error("Failed to load session");
  }

  return (await response.json()) as SessionSummary;
};

// --- Public helpers ---

export const createSession = async (): Promise<SessionSummary> =>
  USE_MOCK_API ? mockCreateSession() : realCreateSession();

export const fetchSession = async (id: string): Promise<SessionSummary> =>
  USE_MOCK_API ? mockGetSession(id) : realGetSession(id);

// --- React Query hooks ---

export const useCreateSession = () =>
  useMutation({
    mutationKey: ["session", "create"],
    mutationFn: createSession,
  });

export const useSession = (id: string | undefined) =>
  useQuery({
    queryKey: ["session", id],
    enabled: !!id,
    queryFn: () => fetchSession(id!),
  });
