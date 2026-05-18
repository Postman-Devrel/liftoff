"use client";

import { useState, ReactNode } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-mono transition-all bg-white/10 hover:bg-white/20 text-[var(--text-tertiary)] hover:text-white"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

export function CopyableCodeBlock({
  children,
  ...props
}: { children?: ReactNode } & React.HTMLAttributes<HTMLPreElement>) {
  const text =
    typeof children === "string"
      ? children
      : extractText(children);

  return (
    <div className="relative group">
      <CopyButton text={text} />
      <pre {...props}>{children}</pre>
    </div>
  );
}

export function CopyableBlockquote({
  children,
  ...props
}: { children?: ReactNode } & React.HTMLAttributes<HTMLQuoteElement>) {
  const text = extractText(children);

  return (
    <div className="relative group">
      <button
        onClick={async () => {
          await navigator.clipboard.writeText(text);
          const btn = document.activeElement as HTMLButtonElement;
          const original = btn.textContent;
          btn.textContent = "Copied!";
          setTimeout(() => {
            btn.textContent = original;
          }, 2000);
        }}
        className="absolute top-2 right-2 px-2 py-1 rounded-md text-[10px] font-mono transition-all bg-white/10 hover:bg-white/20 text-[var(--text-tertiary)] hover:text-white opacity-0 group-hover:opacity-100"
      >
        Copy prompt
      </button>
      <blockquote {...props}>{children}</blockquote>
    </div>
  );
}

function extractText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const el = node as React.ReactElement<{ children?: ReactNode }>;
    return extractText(el.props.children);
  }
  return "";
}
