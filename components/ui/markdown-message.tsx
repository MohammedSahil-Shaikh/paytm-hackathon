import { Fragment, type ReactNode } from "react";

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-semibold text-ink-50">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

/** Lightweight markdown for HR chat: headings, bullets, paragraphs. */
export function MarkdownMessage({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  function flushList() {
    if (!listItems.length) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="my-2 list-disc space-y-1.5 pl-5 text-ink-100">
        {listItems.map((item, index) => (
          <li key={index}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    listItems = [];
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      listItems.push(trimmed.replace(/^[-*•]\s+/, ""));
      continue;
    }

    flushList();

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h4 key={`h4-${key++}`} className="mb-1 mt-3 text-sm font-semibold text-ink-50">
          {renderInline(trimmed.slice(4))}
        </h4>,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h3 key={`h3-${key++}`} className="mb-1 mt-3 text-[15px] font-semibold text-ink-50">
          {renderInline(trimmed.slice(3))}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h2 key={`h2-${key++}`} className="mb-1 mt-3 text-base font-semibold text-ink-50">
          {renderInline(trimmed.slice(2))}
        </h2>,
      );
      continue;
    }

    blocks.push(
      <p key={`p-${key++}`} className="my-1.5 leading-relaxed text-ink-100">
        {renderInline(trimmed)}
      </p>,
    );
  }

  flushList();

  return <div className="space-y-0.5 text-sm">{blocks}</div>;
}
