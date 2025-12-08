export type SupportedLanguage = "javascript" | "python" | "rust";

export interface SessionState {
  language: SupportedLanguage;
  code: string;
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


export const createSession = async (token: string) => {
  const response = await fetch("http://127.0.0.1:8000/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to create session");
  return response.json();
};

export const getSession = async (sessionId: string) => {
  const response = await fetch(`http://127.0.0.1:8000/sessions/${sessionId}`);
  if (!response.ok) throw new Error("Session not found");
  return response.json();
};

export const getSessionState = async (sessionId: string) => {
  const response = await fetch(`http://127.0.0.1:8000/sessions/${sessionId}/state`);
  if (!response.ok) throw new Error("Failed to fetch session state");
  return response.json();
};

export const updateSessionState = async (sessionId: string, state: { code: string; language: string }, token?: string) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`http://127.0.0.1:8000/sessions/${sessionId}/state`, {
    method: "POST",
    headers,
    body: JSON.stringify(state),
  });
  if (!response.ok) throw new Error("Failed to update session state");
  return response.json();
};

export const endSession = async (sessionId: string, token: string) => {
  const response = await fetch(`http://127.0.0.1:8000/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to end session");
  return response.json();
};

