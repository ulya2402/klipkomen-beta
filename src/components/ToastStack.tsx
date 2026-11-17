import { motion, AnimatePresence } from 'framer-motion';
import type { ToastItem } from '../types';

interface ToastStackProps {
  toasts: ToastItem[];
}

export function ToastStack({ toasts }: ToastStackProps) {
  return (
    <div className="fixed top-14 right-4 z-50 pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            className="px-3.5 py-2.5 rounded-xl bg-[#111318] dark:bg-white text-white dark:text-[#111318] text-xs font-medium shadow-lg"
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
