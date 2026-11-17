import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface BulkPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulkPasteText: string;
  onChangeText: (val: string) => void;
  autoReplyIndent: boolean;
  onChangeAutoReplyIndent: (val: boolean) => void;
  onProcess: (mode: 'append' | 'replace') => void;
}

export function BulkPasteModal({
  isOpen,
  onClose,
  bulkPasteText,
  onChangeText,
  autoReplyIndent,
  onChangeAutoReplyIndent,
  onProcess
}: BulkPasteModalProps) {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 360, damping: 28 }}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#161920] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-semibold text-sm">{t('modals.pasteTitle')}</h3>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('modals.pasteHintPrefix')}{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-200">
                  {t('modals.pasteHintFormat')}
                </span>
              </p>
              <textarea
                rows={5}
                value={bulkPasteText}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder={t('modals.pastePlaceholder')}
                className="w-full p-3 rounded-xl text-xs leading-relaxed bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
              />

              <div className="flex items-center justify-between text-xs text-slate-500">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoReplyIndent}
                    onChange={(e) => onChangeAutoReplyIndent(e.target.checked)}
                    className="accent-blue-600 rounded"
                  />
                  <span>{t('modals.autoReplyIndent')}</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    onChangeText(
                      '@nadia.dsgn: Kak, spill cara bikin layout poster yang rapi tapi tetep kelihatan dinamis dong!\n' +
                        '@studio.raka: Kunci utamanya di **grid 4 kolom** sama kontras ukuran font kak, nanti kita bedah di slide berikutnya.\n' +
                        '@dimas_kreatif: Setuju banget, sejak pakai ==hierarki tipografi== desainku jauh lebih kebaca.'
                    )
                  }
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {t('modals.fillSample')}
                </button>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-3.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                {t('modals.cancel')}
              </button>
              <button
                type="button"
                onClick={() => onProcess('append')}
                className="h-9 px-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:border-slate-400"
              >
                {t('modals.append')}
              </button>
              <button
                type="button"
                onClick={() => onProcess('replace')}
                className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {t('modals.createNew')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResetModal({ isOpen, onClose, onConfirm }: ResetModalProps) {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#161920] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden"
          >
            <div className="p-5 space-y-2">
              <h3 className="font-semibold text-sm">{t('modals.resetTitle')}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('modals.resetDesc')}
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="h-8 px-3 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900"
              >
                {t('modals.cancel')}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="h-8 px-3.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
              >
                {t('modals.confirmReset')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
