export type SupportedLanguage = "javascript" | "python" | "rust";

export interface RunRequest {
  code: string;
  language: SupportedLanguage;
}

export interface RunResult {
  language: SupportedLanguage;
  stdout: string[];
  stderr: string[];
  durationMs: number;
  didTimeout: boolean;
}

export const isBrowserWorkerEnvAvailable = () =>
  typeof window !== "undefined" && typeof Worker !== "undefined" && typeof Blob !== "undefined";

const JS_TIMEOUT_MS = 3000;

const buildWorkerScript = () => {
  return `self.onmessage = async (event) => {
    const { code } = event.data;
    const logs = [];
    const errors = [];

    const originalConsoleLog = console.log;
    console.log = (...args) => {
      logs.push(args.map(String).join(' '));
      originalConsoleLog(...args);
    };

    let start = Date.now();
    try {
      // Execute user code in an isolated scope
      const fn = new Function(code);
      const result = fn();
      if (result instanceof Promise) {
        await result;
      }
    } catch (err) {
      errors.push(String(err));
    } finally {
      console.log = originalConsoleLog;
    }

    self.postMessage({ logs, errors, durationMs: Date.now() - start });
  };`;
};

const runJavaScriptSafely = async (code: string): Promise<Omit<RunResult, "language">> => {
  if (!isBrowserWorkerEnvAvailable()) {
    // Fallback for non-browser/test environments
    try {
      // Extremely limited eval used only in tests / non-worker env
      // eslint-disable-next-line no-new-func
      const fn = new Function(code);
      const start = performance.now();
      fn();
      const durationMs = performance.now() - start;
      return { stdout: [], stderr: [], durationMs, didTimeout: false };
    } catch (error) {
      return { stdout: [], stderr: [String(error)], durationMs: 0, didTimeout: false };
    }
  }

  return new Promise((resolve) => {
    const blob = new Blob([buildWorkerScript()], { type: "application/javascript" });
    const worker = new Worker(URL.createObjectURL(blob));
    const start = performance.now();
    let settled = false;

    const cleanup = () => {
      if (settled) return;
      settled = true;
      worker.terminate();
    };

    const timeoutId = window.setTimeout(() => {
      cleanup();
      resolve({ stdout: [], stderr: ["Execution timed out"], durationMs: JS_TIMEOUT_MS, didTimeout: true });
    }, JS_TIMEOUT_MS);

    worker.onmessage = (event) => {
      if (settled) return;
      window.clearTimeout(timeoutId);
      settled = true;
      const { logs, errors, durationMs } = event.data as {
        logs: string[];
        errors: string[];
        durationMs: number;
      };
      cleanup();
      resolve({ stdout: logs, stderr: errors, durationMs, didTimeout: false });
    };

    worker.onerror = (err) => {
      if (settled) return;
      window.clearTimeout(timeoutId);
      settled = true;
      cleanup();
      resolve({
        stdout: [],
        stderr: [String(err.message || err)],
        durationMs: performance.now() - start,
        didTimeout: false,
      });
    };

    worker.postMessage({ code });
  });
};

const runMockLanguage = async (language: Exclude<SupportedLanguage, "javascript">, code: string) => {
  const start = performance.now();
  // In a real system we would load a WASM runtime; for this front-end demo we surface a clear mocked execution.
  const info = `Mock execution for ${language} (no runtime loaded). Code length: ${code.length} chars.`;
  return {
    stdout: [info],
    stderr: [] as string[],
    durationMs: performance.now() - start,
    didTimeout: false,
  } satisfies Omit<RunResult, "language">;
};

export const runCode = async ({ code, language }: RunRequest): Promise<RunResult> => {
  const trimmed = code.trim();
  if (!trimmed) {
    return {
      language,
      stdout: [],
      stderr: ["Nothing to execute: editor is empty."],
      durationMs: 0,
      didTimeout: false,
    };
  }

  if (language === "javascript") {
    const result = await runJavaScriptSafely(code);
    return { language, ...result };
  }

  const result = await runMockLanguage(language, code);
  return { language, ...result };
};
