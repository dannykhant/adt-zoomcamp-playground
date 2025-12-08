import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CodeEditor from "@/components/CodeEditor";
import { useCollaborativeSession } from "@/hooks/useCollaborativeSession";
import { runCode } from "@/utils/codeRunner";
import { endSession } from "@/utils/session";
import type { SupportedLanguage } from "@/utils/session";
import { toast } from "sonner";

const languageLabels: Record<SupportedLanguage, string> = {
  javascript: "JavaScript",
  python: "Python",
  rust: "Rust",
};

const InterviewSessionPage = () => {
  const navigate = useNavigate();
  const { sessionId: rawId } = useParams<{ sessionId: string }>();
  const sessionId = rawId ?? "demo";
  const { state, setLanguage, setCode } = useCollaborativeSession({ sessionId });
  const [isRunning, setIsRunning] = useState(false);
  const [stdout, setStdout] = useState<string[]>([]);
  const [stderr, setStderr] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | null>(null);

  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => `${window.location.origin}/session/${sessionId}`, [sessionId]);

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const result = await runCode({ code: state.code, language: state.language });
      setStdout(result.stdout);
      setStderr(result.stderr);
      setDuration(result.durationMs);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight md:text-xl">Interview room</h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              Session <span className="font-mono text-[11px]">{sessionId}</span> • Share this link with anyone who
              should join.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Button variant="outline" size="sm" className="h-8" onClick={handleCopy}>
              {copied ? "Copied" : "Copy room link"}
            </Button>
            {localStorage.getItem("isLoggedIn") === "true" && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/50"
                onClick={async () => {
                  if (window.confirm("Are you sure you want to end the interview?")) {
                    try {
                      const token = localStorage.getItem("token");
                      if (token) await endSession(sessionId, token);
                      toast.success("Session ended");
                      navigate("/");
                    } catch (error) {
                      toast.error("Failed to end session");
                    }
                  }
                }}
              >
                End Interview
              </Button>
            )}
            <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300">
              Live • all editors synced
            </span>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <Card className="flex min-h-[420px] flex-col border border-border/70 bg-card/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-3">
              <div>
                <CardTitle className="text-sm">Shared editor</CardTitle>
                <CardDescription className="text-xs">
                  Everyone in this room sees the same code and can type at the same time.
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="space-y-1 text-right">
                  <Label htmlFor="language" className="text-[11px]">
                    Language
                  </Label>
                  <Select value={state.language} onValueChange={(v) => setLanguage(v as SupportedLanguage)}>
                    <SelectTrigger id="language" className="h-8 w-32 text-xs">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(languageLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button size="sm" onClick={handleRun} disabled={isRunning}>
                  {isRunning ? "Running..." : "Run"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex min-h-[340px] flex-1 flex-col gap-3">
              <div className="h-[260px] flex-1">
                <CodeEditor language={state.language} code={state.code} onChange={setCode} />
              </div>
            </CardContent>
          </Card>

          <Card className="flex min-h-[420px] flex-col border border-border/70 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Output &amp; console</CardTitle>
              <CardDescription className="text-xs">
                JavaScript runs in a sandboxed worker. Python &amp; Rust show mocked output in this demo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <Tabs defaultValue="stdout" className="flex h-full flex-1 flex-col">
                <TabsList className="mb-2 w-full justify-start bg-secondary/60">
                  <TabsTrigger value="stdout" className="text-xs">
                    Stdout
                  </TabsTrigger>
                  <TabsTrigger value="stderr" className="text-xs">
                    Stderr
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="stdout" className="flex-1">
                  <div className="h-64 w-full overflow-auto rounded-lg border border-border/60 bg-[hsl(var(--bg-code-soft))] p-3 font-mono text-[11px] text-[hsl(var(--code-foreground))]">
                    {stdout.length === 0 ? (
                      <p className="text-muted-foreground">
                        No output yet. Write some code and press <span className="font-semibold">Run</span>.
                      </p>
                    ) : (
                      stdout.map((line, idx) => <div key={idx}>{line}</div>)
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="stderr" className="flex-1">
                  <div className="h-64 w-full overflow-auto rounded-lg border border-border/60 bg-[hsl(var(--bg-code-soft))] p-3 font-mono text-[11px] text-red-300">
                    {stderr.length === 0 ? (
                      <p className="text-muted-foreground">No errors captured.</p>
                    ) : (
                      stderr.map((line, idx) => <div key={idx}>{line}</div>)
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Language: {languageLabels[state.language]}</span>
                {duration != null && (
                  <span>Last run: {Math.round(duration)} ms</span>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
};

export default InterviewSessionPage;
