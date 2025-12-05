import { describe, expect, it, vi } from "vitest";
import { isBrowserWorkerEnvAvailable, runCode } from "@/utils/codeRunner";

describe("codeRunner", () => {
  it("returns an error when code is empty", async () => {
    const result = await runCode({ code: "   ", language: "javascript" });
    expect(result.stderr[0]).toContain("Nothing to execute");
  });

  it("supports mocked execution for python", async () => {
    const result = await runCode({ code: "print('hi')", language: "python" });
    expect(result.language).toBe("python");
    expect(result.stdout[0]).toContain("Mock execution for python");
  });

  it("exposes worker environment detection", () => {
    const originalWindow = globalThis.window;
    // @ts-ignore - override for test
    (globalThis as any).window = undefined;
    expect(isBrowserWorkerEnvAvailable()).toBe(false);
    globalThis.window = originalWindow!;
  });
});
