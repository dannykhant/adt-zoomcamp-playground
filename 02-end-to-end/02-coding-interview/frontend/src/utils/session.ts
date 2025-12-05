export type SupportedLanguage = "javascript" | "python" | "rust";

export interface SessionState {
  sessionId: string;
  language: SupportedLanguage;
  code: string;
  updatedAt: number;
}

export const DEFAULT_SNIPPETS: Record<SupportedLanguage, string> = {
  javascript: `// JavaScript
function greet(name) {
  console.log("Hello, " + name + "!");
}

greet("candidate");`,
  python: `# Python
def greet(name: str) -> None:
    print(f"Hello, {name}!")


greet("candidate")`,
  rust: `// Rust
fn greet(name: &str) {
    println!("Hello, {}!", name);
}

fn main() {
    greet("candidate");
}`,
};

export const generateSessionId = () => {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const segments = [4, 4];
  const segment = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return segments.map(segment).join("-");
};

export const buildStorageKey = (sessionId: string) => `interview-session::${sessionId}`;

export const loadSessionState = (sessionId: string, language: SupportedLanguage): SessionState => {
  const key = buildStorageKey(sessionId);
  if (typeof window === "undefined") {
    return {
      sessionId,
      language,
      code: DEFAULT_SNIPPETS[language],
      updatedAt: Date.now(),
    };
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return {
        sessionId,
        language,
        code: DEFAULT_SNIPPETS[language],
        updatedAt: Date.now(),
      };
    }
    const parsed = JSON.parse(raw) as SessionState;
    return parsed;
  } catch {
    return {
      sessionId,
      language,
      code: DEFAULT_SNIPPETS[language],
      updatedAt: Date.now(),
    };
  }
};

export const persistSessionState = (state: SessionState) => {
  if (typeof window === "undefined") return;
  const key = buildStorageKey(state.sessionId);
  window.localStorage.setItem(key, JSON.stringify(state));
};

export const mergeRemoteUpdate = (local: SessionState, remote: SessionState): SessionState => {
  // Last-write-wins by timestamp; if equal, favor local to avoid flicker.
  if (remote.updatedAt > local.updatedAt) {
    return remote;
  }
  return local;
};
