"use client";

import { useMemo, useState } from "react";
import { cn } from "@/utils/helpers/shadcn/index";

interface CollapsibleTextProps {
  text: string;
  className?: string;
  clampLines?: number;
  maxCharsBeforeCollapse?: number;
}

export function CollapsibleText({
  text,
  className,
  clampLines = 3,
  maxCharsBeforeCollapse = 180,
}: CollapsibleTextProps) {
  const [expanded, setExpanded] = useState(false);

  const shouldCollapse = useMemo(() => {
    const lineCount = text.split(/\r?\n/).length;
    return text.length > maxCharsBeforeCollapse || lineCount > clampLines;
  }, [clampLines, maxCharsBeforeCollapse, text]);

  if (!shouldCollapse) {
    return <p className={cn("whitespace-pre-line leading-relaxed", className)}>{text}</p>;
  }

  return (
    <div className="space-y-2">
      <p
        className={cn(
          "whitespace-pre-line leading-relaxed",
          !expanded && "line-clamp-3",
          className
        )}
      >
        {text}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="text-xs font-bold uppercase tracking-wide text-primary transition-opacity hover:opacity-80"
      >
        {expanded ? "Ver menos" : "Ver más"}
      </button>
    </div>
  );
}
