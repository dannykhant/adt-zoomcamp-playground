import { useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import type { SupportedLanguage } from "@/utils/session";
import { cn } from "@/lib/utils";

export interface CodeEditorProps {
  language: SupportedLanguage;
  code: string;
  onChange: (value: string) => void;
}

const languageExtensions: Record<SupportedLanguage, any[]> = {
  javascript: [javascript({ jsx: true, typescript: true })],
  python: [python()],
  rust: [rust()],
};

export const CodeEditor = ({ language, code, onChange }: CodeEditorProps) => {
  const handleChange = useCallback(
    (value: string) => {
      onChange(value);
    },
    [onChange],
  );

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-xl border border-border/60 bg-[hsl(var(--bg-code))]",
        "shadow-[var(--shadow-soft)]",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white/5 to-transparent" />
      <CodeMirror
        value={code}
        height="100%"
        theme={"dark"}
        extensions={languageExtensions[language]}
        onChange={handleChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          highlightActiveLineGutter: true,
          foldGutter: true,
          bracketMatching: true,
        }}
        className="h-full text-sm [color:hsl(var(--code-foreground))] [&_.cm-content]:py-4 [&_.cm-gutters]:bg-transparent [&_.cm-scroller]:!font-mono [&_.cm-line]::selection:bg-accent/40"
      />
    </div>
  );
};

export default CodeEditor;
