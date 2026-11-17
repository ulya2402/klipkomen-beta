import { useRef, useEffect, useState, useCallback, type ClipboardEvent } from 'react';
import { Bold, Italic, Underline, Highlighter } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';
import { parseRichSegments } from '../utils/richText';

interface RichCommentEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownToEditorHtml(raw: string): string {
  const lines = String(raw || '').split('\n');
  return lines
    .map((line) => {
      if (!line) return '';
      const segments = parseRichSegments(line);
      return segments
        .map((seg) => {
          const safe = escapeHtml(seg.value);
          if (seg.type === 'bold') return `<strong>${safe}</strong>`;
          if (seg.type === 'italic') return `<em>${safe}</em>`;
          if (seg.type === 'underline') return `<u>${safe}</u>`;
          if (seg.type === 'highlight') return `<mark>${safe}</mark>`;
          return safe;
        })
        .join('');
    })
    .join('<br>');
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || '').replace(/\u00A0/g, ' ');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();

  if (tag === 'br') return '\n';

  let inner = '';
  el.childNodes.forEach((child) => {
    inner += serializeNode(child);
  });

  if (!inner) {
    return tag === 'div' || tag === 'p' ? '\n' : '';
  }

  if (tag === 'strong' || tag === 'b') return `**${inner}**`;
  if (tag === 'em' || tag === 'i') return `*${inner}*`;
  if (tag === 'u') return `__${inner}__`;
  if (tag === 'mark') return `==${inner}==`;
  if (tag === 'div' || tag === 'p') return `\n${inner}`;

  return inner;
}

function serializeEditorHtml(root: HTMLElement): string {
  let out = '';
  root.childNodes.forEach((child, idx) => {
    const chunk = serializeNode(child);
    if (idx === 0 && chunk.startsWith('\n') && child.nodeName.toLowerCase() === 'div') {
      out += chunk.slice(1);
    } else {
      out += chunk;
    }
  });
  return out.replace(/\n$/, '');
}

export function RichCommentEditor({ value, onChange, onFocus }: RichCommentEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastEmittedRef = useRef<string>(value);
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    highlight: false
  });
  const { t } = useI18n();

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (value !== lastEmittedRef.current || el.innerHTML === '') {
      lastEmittedRef.current = value;
      el.innerHTML = markdownToEditorHtml(value);
    }
  }, [value]);

  const refreshFormatState = useCallback(() => {
    try {
      const sel = window.getSelection();
      let inMark = false;
      if (sel && sel.anchorNode) {
        let cur: Node | null = sel.anchorNode;
        while (cur && cur !== editorRef.current) {
          if (cur.nodeType === Node.ELEMENT_NODE && (cur as HTMLElement).tagName.toLowerCase() === 'mark') {
            inMark = true;
            break;
          }
          cur = cur.parentNode;
        }
      }
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        highlight: inMark
      });
    } catch {
      // Ignore selection query errors
    }
  }, []);

  const syncToParent = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const serialized = serializeEditorHtml(el);
    lastEmittedRef.current = serialized;
    onChange(serialized);
    refreshFormatState();
  }, [onChange, refreshFormatState]);

  const execFormat = (cmd: 'bold' | 'italic' | 'underline') => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    document.execCommand(cmd, false);
    syncToParent();
  };

  const toggleHighlight = () => {
    const el = editorRef.current;
    if (!el) return;
    el.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;

    let markAncestor: HTMLElement | null = null;
    let cur: Node | null = range.commonAncestorContainer;
    while (cur && cur !== el) {
      if (cur.nodeType === Node.ELEMENT_NODE && (cur as HTMLElement).tagName.toLowerCase() === 'mark') {
        markAncestor = cur as HTMLElement;
        break;
      }
      cur = cur.parentNode;
    }

    if (markAncestor) {
      const parent = markAncestor.parentNode;
      if (parent) {
        while (markAncestor.firstChild) {
          parent.insertBefore(markAncestor.firstChild, markAncestor);
        }
        parent.removeChild(markAncestor);
      }
    } else if (!range.collapsed) {
      const mark = document.createElement('mark');
      try {
        range.surroundContents(mark);
      } catch {
        const fragment = range.extractContents();
        mark.appendChild(fragment);
        range.insertNode(mark);
      }
      sel.removeAllRanges();
      const newRange = document.createRange();
      newRange.selectNodeContents(mark);
      sel.addRange(newRange);
    }

    syncToParent();
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const plain = e.clipboardData.getData('text/plain');
    if (plain) {
      document.execCommand('insertText', false, plain);
      syncToParent();
    }
  };

  const isEmpty = !value || value.trim() === '';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-blue-500 transition-colors">
      <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('bold');
            }}
            title={t('editor.boldTitle')}
            className={`w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center transition-colors ${
              activeFormats.bold
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('italic');
            }}
            title={t('editor.italicTitle')}
            className={`w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center transition-colors ${
              activeFormats.italic
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              execFormat('underline');
            }}
            title={t('editor.underlineTitle')}
            className={`w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center transition-colors ${
              activeFormats.underline
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            }`}
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleHighlight();
            }}
            title={t('editor.highlightTitle')}
            className={`w-7 h-7 sm:w-6 sm:h-6 rounded flex items-center justify-center transition-colors ${
              activeFormats.highlight
                ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700'
            }`}
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {t('editor.mentionHint')}
        </span>
      </div>

      <div className="relative">
        {isEmpty && (
          <div className="pointer-events-none absolute top-2.5 left-2.5 text-[13px] text-slate-400 dark:text-slate-500">
            {t('editor.placeholder')}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => {
            onFocus?.();
            refreshFormatState();
          }}
          onInput={syncToParent}
          onKeyUp={refreshFormatState}
          onMouseUp={refreshFormatState}
          onPaste={handlePaste}
          className="kk-wysiwyg w-full min-h-[64px] max-h-[180px] overflow-y-auto p-2.5 text-[13px] leading-relaxed bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none break-words"
        />
      </div>
    </div>
  );
}
