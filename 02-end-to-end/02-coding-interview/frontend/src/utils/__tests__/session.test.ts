import { describe, expect, it } from "vitest";
import {
  DEFAULT_SNIPPETS,
  buildStorageKey,
  generateSessionId,
  loadSessionState,
  mergeRemoteUpdate,
  type SessionState,
} from "@/utils/session";

describe("session utils", () => {
  it("generates a human-readable session id", () => {
    const id = generateSessionId();
    expect(id).toMatch(/^[a-z0-9]{4}-[a-z0-9]{4}$/);
  });

  it("builds a stable storage key", () => {
    expect(buildStorageKey("abcd-1234")).toBe("interview-session::abcd-1234");
  });

  it("falls back to default snippet when localStorage is unavailable", () => {
    const state = loadSessionState("room", "javascript");
    expect(state.code).toBe(DEFAULT_SNIPPETS.javascript);
  });

  it("prefers newer remote updates when merging", () => {
    const base: SessionState = {
      sessionId: "room",
      language: "javascript",
      code: "console.log('a')",
      updatedAt: 1,
    };
    const remote: SessionState = { ...base, code: "console.log('b')", updatedAt: 2 };
    expect(mergeRemoteUpdate(base, remote)).toEqual(remote);
  });
});
