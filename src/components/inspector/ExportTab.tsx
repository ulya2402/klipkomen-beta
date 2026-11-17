import { motion } from 'framer-motion';
import { Copy, Download } from 'lucide-react';
import type { StudioConfig } from '../../types';
import { useI18n } from '../../hooks/useI18n';

interface ExportTabProps {
  config: StudioConfig;
  liveDimensions: { w: number; h: number };
  onUpdateConfig: <K extends keyof StudioConfig>(key: K, value: StudioConfig[K]) => void;
  onExportPng: (action: 'download' | 'copy') => void;
  onOpenReset: () => void;
}

export function ExportTab({
  config,
  liveDimensions,
  onUpdateConfig,
  onExportPng,
  onOpenReset
}: ExportTabProps) {
  const { t } = useI18n();

  return (
    <motion.div
      key="tab-export"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16 }}
      className="divide-y divide-slate-200 dark:divide-slate-800"
    >
      <section className="p-4 sm:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">{t('export.alphaTitle')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {t('export.alphaDesc')}
            </p>
          </div>
          <input
            type="checkbox"
            checked={config.transparentExport}
            onChange={(e) => onUpdateConfig('transparentExport', e.target.checked)}
            className="accent-blue-600 w-4 h-4 mt-1 rounded cursor-pointer"
          />
        </div>

        {!config.transparentExport && (
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs font-medium">{t('export.solidBgColor')}</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.solidBgColor}
                onChange={(e) => onUpdateConfig('solidBgColor', e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="tabular-nums text-xs text-slate-500">
                {config.solidBgColor.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="p-4 sm:p-5 space-y-3.5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {t('export.resolutionTitle')}
        </h2>

        <div className="grid grid-cols-3 gap-2">
          {[
            { val: 1, labelKey: 'export.scale1x' },
            { val: 2, labelKey: 'export.scale2x' },
            { val: 3, labelKey: 'export.scale3x' }
          ].map((sc) => {
            const active = config.exportScale === sc.val;
            return (
              <button
                key={sc.val}
                type="button"
                onClick={() => onUpdateConfig('exportScale', sc.val)}
                className={`h-9 px-2 rounded-lg border text-xs transition-all ${
                  active
                    ? 'border-blue-600 bg-blue-600/10 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'border-slate-200 dark:border-slate-700 font-medium'
                }`}
              >
                {t(sc.labelKey)}
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">
            {t('export.exportPaddingLabel')}
          </label>
          <select
            value={config.exportPadding}
            onChange={(e) => onUpdateConfig('exportPadding', parseInt(e.target.value, 10))}
            className="w-full h-9 px-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value={12}>{t('export.paddingTight')}</option>
            <option value={28}>{t('export.paddingBalanced')}</option>
            <option value={48}>{t('export.paddingSpacious')}</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>{t('export.estimatedDim')}</span>
          <span className="font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {liveDimensions.w} × {liveDimensions.h} px
          </span>
        </div>
      </section>

      <section className="p-4 sm:p-5 space-y-2.5">
        <button
          type="button"
          onClick={() => onExportPng('download')}
          className="w-full h-11 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Download className="w-4 h-4" />
          <span>{t('export.downloadTransparent')}</span>
        </button>

        <button
          type="button"
          onClick={() => onExportPng('copy')}
          className="w-full h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <Copy className="w-4 h-4 text-slate-500" />
          <span>{t('export.copyClipboard')}</span>
        </button>

        <button
          type="button"
          onClick={onOpenReset}
          className="w-full h-9 px-4 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
        >
          {t('export.resetAll')}
        </button>
      </section>
    </motion.div>
  );
}
