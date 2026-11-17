import { useRef } from 'react';
import { Bold, Italic, Underline, Highlighter } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface RichCommentEditorProps {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
}

export function RichCommentEditor({ value, onChange, onFocus }: RichCommentEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useI18n();

  const applyWrapFormat = (prefix: string, suffix = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const current = String(value || '');
    const selected = current.slice(start, end);

    const isAlreadyWrapped =
      start >= prefix.length &&
      current.slice(start - prefix.length, start) === prefix &&
      current.slice(end, end + suffix.length) === suffix;

    let nextText: string;
    let nextStart: number;
    let nextEnd: number;

    if (isAlreadyWrapped) {
      nextText =
        current.slice(0, start - prefix.length) + selected + current.slice(end + suffix.length);
      nextStart = start - prefix.length;
      nextEnd = end - prefix.length;
    } else if (selected.length > 0) {
      nextText = current.slice(0, start) + prefix + selected + suffix + current.slice(end);
      nextStart = start + prefix.length;
      nextEnd = end + prefix.length;
    } else {
      const placeholder = t('editor.sampleWord');
      nextText = current.slice(0, start) + prefix + placeholder + suffix + current.slice(end);
      nextStart = start + prefix.length;
      nextEnd = nextStart + placeholder.length;
    }

    onChange(nextText);
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(nextStart, nextEnd);
      }
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 overflow-hidden focus-within:border-blue-500 transition-colors">
      <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => applyWrapFormat('**')}
            title={t('editor.boldTitle')}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyWrapFormat('*')}
            title={t('editor.italicTitle')}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyWrapFormat('__')}
            title={t('editor.underlineTitle')}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => applyWrapFormat('==')}
            title={t('editor.highlightTitle')}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {t('editor.mentionHint')}
        </span>
      </div>
      <textarea
        ref={textareaRef}
        rows={2}
        value={value}
        onFocus={onFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('editor.placeholder')}
        className="w-full p-2.5 text-[13px] leading-relaxed bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none resize-y"
      />
    </div>
  );
}
