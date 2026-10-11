import { useRef } from 'react';

import { highlightJson } from '@/lib/jsonHighlight';

type JsonEditorProps = {
  id: string;
  // The name read by a screen reader. Only needed where no <label> points at the id.
  label?: string;
  value: string;
  onChange?: (nextValue: string) => void;
  readOnly?: boolean;
  // The smallest height, in lines of text. Left out: 6 lines to type in, or just the text when read-only.
  // The editor grows when there are more lines.
  rows?: number;
};

// A textarea with a coloured copy of its text behind it. The textarea's own text is transparent,
// so what you see is the coloured layer and what you edit is the real control.
export function JsonEditor({ id, label, value, onChange, readOnly = false, rows }: JsonEditorProps) {
  const overlayRef = useRef<HTMLPreElement | null>(null);
  const lineCount = value.split('\n').length;
  const shownRows = Math.max(rows ?? (readOnly ? 1 : 6), lineCount);

  return (
    <div
      className="relative overflow-hidden rounded-md border border-sidebar bg-sidebar"
      style={{ minHeight: `calc(${shownRows} * 1.25rem + 1.5rem)` }}
    >
      <pre
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none m-0 h-full overflow-auto p-3 font-mono text-xs leading-5 whitespace-pre text-sidebar-foreground"
        dangerouslySetInnerHTML={{ __html: highlightJson(value) || '&nbsp;' }}
      />
      <textarea
        id={id}
        aria-label={label}
        wrap="off"
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        onScroll={(event) => {
          if (overlayRef.current) {
            overlayRef.current.scrollTop = event.currentTarget.scrollTop;
            overlayRef.current.scrollLeft = event.currentTarget.scrollLeft;
          }
        }}
        spellCheck={false}
        className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-3 font-mono text-xs leading-5 whitespace-pre text-transparent caret-signal outline-none selection:bg-white/20"
      />
    </div>
  );
}
