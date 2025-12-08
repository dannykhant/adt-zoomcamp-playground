import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSession } from "@/utils/session";
import { cn } from "@/lib/utils";
import { LogOut, RefreshCw } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [joinId, setJoinId] = useState("");
  const [copied, setCopied] = useState(false);
  const [createdId, setCreatedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const hasCreated = useRef(false);

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    if (isLoggedIn && !createdId && !hasCreated.current) {
      hasCreated.current = true;
      handleCreateSession();
    }
  }, [isLoggedIn]);

  const handleCreateSession = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const session = await createSession(token);
      setCreatedId(session.id);
    } catch (error) {
      console.error("Failed to create session", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sessionUrl = createdId ? `${window.location.origin}/session/${createdId}` : "Generating...";

  const handleStartInterview = () => {
    if (createdId) {
      navigate(`/session/${createdId}`);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sessionUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  const handleRegenerate = () => {
    handleCreateSession();
    setCopied(false);
  };

  const handleJoin = () => {
    const trimmed = joinId.trim();
    if (!trimmed) return;
    const id = trimmed.includes("/") ? trimmed.split("/").pop()! : trimmed;
    navigate(`/session/${id}`);
  };

  return (
    <main className="min-h-screen px-4 py-10 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:items-center">
        <section className="flex-1 space-y-8">
          <header className="space-y-4">
            <p className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              Live coding interviews • Browser-based • Zero setup
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Run collaborative coding interviews
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> in minutes.</span>
            </h1>
            <p className="max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
              Spin up a shared coding room, watch candidates type in real time, and run code safely in the browser—no
              logins, no IDE installs.
            </p>
          </header>

          <Tabs defaultValue="interviewer" className="w-full max-w-xl">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/60">
              <TabsTrigger value="interviewer">I&apos;m an interviewer</TabsTrigger>
              <TabsTrigger value="candidate">I&apos;m a candidate</TabsTrigger>
            </TabsList>
            <TabsContent value="interviewer" className="pt-4">
              {isLoggedIn ? (
                <Card className="border border-border/70 bg-card/70 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Create an interview room</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          localStorage.removeItem("isLoggedIn");
                          localStorage.removeItem("token");
                          navigate(0); // Refresh to update state
                        }}
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Logout
                      </Button>
                    </div>
                    <CardDescription>
                      Share a single link with your candidate to start a collaborative coding session.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="created-link">Interview link</Label>
                      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                          <Input
                            id="created-link"
                            value={sessionUrl}
                            readOnly
                            className="pr-10 text-xs sm:text-sm"
                            disabled={isLoading}
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={handleRegenerate}
                            title="Generate new link"
                            disabled={isLoading}
                          >
                            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
                          </Button>
                        </div>
                        <Button variant="outline" onClick={handleCopy} className="whitespace-nowrap" disabled={!createdId}>
                          {copied ? "Copied" : "Copy link"}
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="hero" size="lg" onClick={handleStartInterview} disabled={!createdId || isLoading}>
                        Start interview room
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Share the link above with your candidate.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-border/70 bg-card/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Interviewer Access</CardTitle>
                    <CardDescription>
                      Please log in to create and manage interview sessions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => navigate("/login")} className="w-full sm:w-auto">
                      Login as Interviewer
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            <TabsContent value="candidate" className="pt-4">
              <Card className="border border-border/70 bg-card/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Join an interview</CardTitle>
                  <CardDescription>Paste the link or room id your interviewer shared with you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="join-id">Link or room id</Label>
                    <Input
                      id="join-id"
                      placeholder="e.g. https://.../session/abcd-1234 or abcd-1234"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleJoin} className={cn("w-full sm:w-auto")}
                  >
                    Join room
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <dl className="grid max-w-xl grid-cols-2 gap-4 text-xs text-muted-foreground sm:text-sm">
            <div>
              <dt className="font-medium text-foreground">Realtime updates</dt>
              <dd>Every keystroke is broadcast to all connected browsers in the room.</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">Safe execution</dt>
              <dd>Run JavaScript in an isolated worker. Python &amp; Rust use mocked results in this demo.</dd>
            </div>
          </dl>
        </section>

        <section className="relative flex-1">
          <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-gradient-to-tr from-primary/40 via-accent/30 to-transparent opacity-70 blur-3xl" />
          <div className="relative rounded-3xl border border-border/80 bg-[hsl(var(--bg-elevated))]/90 p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl sm:p-6">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-400" />
              Live room preview
            </div>
            <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="flex flex-col rounded-2xl border border-border/60 bg-[hsl(var(--bg-code-soft))] p-3">
                <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>main.py</span>
                  <span>python • readonly preview</span>
                </div>
                <pre className="flex-1 overflow-hidden text-[11px] leading-relaxed text-[hsl(var(--code-foreground))]"><code>{`def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return [seen[target - n], i]
        seen[n] = i

print(two_sum([2,7,11,15], 9))`}</code></pre>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/80 p-3 text-xs">
                <div>
                  <p className="mb-1 text-[11px] font-medium text-foreground">Participants</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>
                      <span className="mr-1 inline-block size-2 rounded-full bg-emerald-400" />
                      You (interviewer)
                    </li>
                    <li>
                      <span className="mr-1 inline-block size-2 rounded-full bg-emerald-400" />
                      Candidate
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-[11px] font-medium text-foreground">Session details</p>
                  <p className="text-muted-foreground">Shared editor • Multi-language syntax • In-browser run</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Index;
