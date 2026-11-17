import {
  Undo2,
  Redo2,
  ClipboardPaste,
  RotateCcw,
  Sun,
  Moon,
  Download,
  Languages
} from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface HeaderBarProps {
  canUndo: boolean;
  canRedo: boolean;
  darkUi: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenPaste: () => void;
  onOpenReset: () => void;
  onToggleDark: () => void;
  onDownloadPng: () => void;
}

export function HeaderBar({
  canUndo,
  canRedo,
  darkUi,
  onUndo,
  onRedo,
  onOpenPaste,
  onOpenReset,
  onToggleDark,
  onDownloadPng
}: HeaderBarProps) {
  const { lang, toggleLang, t } = useI18n();
  const isBeta = import.meta.env.VITE_APP_CHANNEL === 'beta';

  return (
    <header className="h-12 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#161920]/95 backdrop-blur-md px-3 sm:px-5 flex items-center justify-between gap-2 sticky top-0 z-40">
      {/* Brand */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-7 h-7 rounded-lg bg-[#111318] dark:bg-white text-white dark:text-[#111318] flex items-center justify-center font-serif font-bold text-sm shrink-0">
          K
        </div>
        <h1 className="font-semibold text-sm tracking-tight truncate">{t('brand.name')}</h1>
        {isBeta && (
          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold tracking-wider shrink-0">
            {t('brand.betaBadge')}
          </span>
        )}
      </div>

      {/* Center History & Quick Tools */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title={t('header.undo')}
          className="w-8 h-8 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-35 transition-all"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title={t('header.redo')}
          className="w-8 h-8 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-35 transition-all"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        <button
          type="button"
          onClick={onOpenPaste}
          className="h-8 px-2.5 sm:px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-400 dark:hover:border-slate-500 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-[0.98]"
        >
          <ClipboardPaste className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="hidden xs:inline sm:inline">{t('header.pasteText')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenReset}
          title={t('header.resetTitle')}
          className="hidden md:flex h-8 px-2.5 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 items-center gap-1 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t('header.reset')}</span>
        </button>
      </div>

      {/* Right Language, Theme & Export */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={toggleLang}
          title={t('header.language')}
          className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-all"
        >
          <Languages className="w-3.5 h-3.5 text-slate-500" />
          <span className="uppercase">{lang}</span>
        </button>

        <button
          type="button"
          onClick={onToggleDark}
          title={t('header.toggleTheme')}
          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:border-slate-400 transition-all"
        >
          {darkUi ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={onDownloadPng}
          className="hidden sm:flex h-8 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold items-center gap-1.5 shadow-xs transition-all active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t('header.downloadPng')}</span>
        </button>
      </div>
    </header>
  );
}
