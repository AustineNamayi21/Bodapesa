"use client";

import { useState } from "react";

export default function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex gap-2">
      <code
        className="flex-1 min-w-0 text-[0.74rem] px-2.5 py-2 rounded-lg overflow-x-auto whitespace-nowrap scroll-thin"
        style={{ background: "var(--surface-2)" }}
      >
        {value}
      </code>
      <button
        type="button"
        className="btn btn-ghost btn-sm shrink-0"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          } catch {
            // Clipboard can be unavailable on plain http; the text stays selectable.
          }
        }}
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}
