import { useMutation, useQuery } from "@tanstack/react-query";
import { API_BASE_URL, USE_MOCK_API } from "./client";

export type UserRole = "interviewer" | "candidate";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

const MOCK_INTERVIEWER: AuthUser = {
  id: "mock-interviewer-1",
  name: "Demo Interviewer",
  role: "interviewer",
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// --- Mock implementations ---

const mockLogin = async (email: string, _password: string): Promise<AuthUser> => {
  await delay(300);
  return {
    ...MOCK_INTERVIEWER,
    name: email || MOCK_INTERVIEWER.name,
  };
};

const mockCurrentUser = async (): Promise<AuthUser | null> => {
  await delay(100);
  return MOCK_INTERVIEWER;
};

const mockLogout = async (): Promise<void> => {
  await delay(100);
};

// --- Real HTTP implementations (for future FastAPI backend) ---

const realLogin = async (email: string, password: string): Promise<AuthUser> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  return (await response.json()) as AuthUser;
};

const realCurrentUser = async (): Promise<AuthUser | null> => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    credentials: "include",
  });

  if (response.status === 401) return null;

  if (!response.ok) {
    throw new Error("Failed to load current user");
  }

  return (await response.json()) as AuthUser;
};

const realLogout = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
};

// --- Public helpers ---

export const loginAsInterviewer = async (email: string, password: string): Promise<AuthUser> =>
  USE_MOCK_API ? mockLogin(email, password) : realLogin(email, password);

export const fetchCurrentUser = async (): Promise<AuthUser | null> =>
  USE_MOCK_API ? mockCurrentUser() : realCurrentUser();

export const logout = async (): Promise<void> =>
  USE_MOCK_API ? mockLogout() : realLogout();

// --- React Query hooks ---

export const useCurrentUser = () =>
  useQuery({
    queryKey: ["auth", "currentUser"],
    queryFn: fetchCurrentUser,
  });

export const useInterviewerLogin = () =>
  useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: ({ email, password }: { email: string; password: string }) => loginAsInterviewer(email, password),
  });

export const useLogout = () =>
  useMutation({
    mutationKey: ["auth", "logout"],
    mutationFn: logout,
  });
