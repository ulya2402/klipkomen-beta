import { useMemo, type CSSProperties, type RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react';
import type {
  CommentItem,
  MobileStageMode,
  StageBackdropId,
  StudioConfig
} from '../types';
import { getEffectiveTilt } from '../utils/surfaceTokens';
import { CommentCardPreview } from './CommentCardPreview';
import { useI18n } from '../hooks/useI18n';

interface StageViewportProps {
  config: StudioConfig;
  comments: CommentItem[];
  darkUi: boolean;
  stageBackdrop: StageBackdropId;
  onChangeBackdrop: (id: StageBackdropId) => void;
  zoom: number;
  onChangeZoom: (updater: (z: number) => number) => void;
  onResetZoom: () => void;
  mobileStageMode: MobileStageMode;
  onCycleMobileMode: () => void;
  captureTargetRef: RefObject<HTMLDivElement | null>;
  liveDimensions: { w: number; h: number };
  onExportPng: (action: 'download' | 'copy') => void;
}

export function StageViewport({
  config,
  comments,
  darkUi,
  stageBackdrop,
  onChangeBackdrop,
  zoom,
  onChangeZoom,
  onResetZoom,
  mobileStageMode,
  onCycleMobileMode,
  captureTargetRef,
  liveDimensions,
  onExportPng
}: StageViewportProps) {
  const { t } = useI18n();

  const stageBackdropStyle = useMemo<CSSProperties>(() => {
    if (stageBackdrop === 'dark') {
      return {
        backgroundColor: '#0F1117',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)',
        backgroundSize: '22px 22px'
      };
    }
    if (stageBackdrop === 'paper') {
      return {
        backgroundColor: '#F7F5F0',
        backgroundImage: 'radial-gradient(rgba(17,19,24,0.07) 1px, transparent 1px)',
        backgroundSize: '22px 22px'
      };
    }
    if (stageBackdrop === 'chroma') {
      return {
        backgroundColor: '#00B140'
      };
    }
    return darkUi
      ? {
          backgroundColor: '#13161C',
          backgroundImage:
            'linear-gradient(45deg, #1B1F28 25%, transparent 25%), linear-gradient(-45deg, #1B1F28 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1B1F28 75%), linear-gradient(-45deg, transparent 75%, #1B1F28 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0'
        }
      : {
          backgroundColor: '#EBEDF0',
          backgroundImage:
            'linear-gradient(45deg, #DFE2E7 25%, transparent 25%), linear-gradient(-45deg, #DFE2E7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #DFE2E7 75%), linear-gradient(-45deg, transparent 75%, #DFE2E7 75%)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0'
        };
  }, [stageBackdrop, darkUi]);

  const mobileStageHeightClass =
    mobileStageMode === 'tall'
      ? 'min-h-[320px] max-h-[58dvh]'
      : mobileStageMode === 'compact'
      ? 'min-h-[165px] max-h-[26dvh]'
      : 'min-h-[245px] max-h-[41dvh]';

  const backdropIds: StageBackdropId[] = ['checker', 'dark', 'paper', 'chroma'];

  return (
    <section className="order-1 lg:order-2 flex-1 flex flex-col min-w-0 min-h-0 sticky top-12 lg:static z-30 border-b lg:border-b-0 border-slate-200 dark:border-slate-800">
      {/* Stage Control Ribbon */}
      <div className="h-11 px-3 sm:px-5 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#161920]/95 backdrop-blur-sm flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400 mr-1.5">
            {t('stage.backdropLabel')}
          </span>
          {backdropIds.map((id) => {
            const active = stageBackdrop === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeBackdrop(id)}
                className={`h-7 px-2.5 rounded-md text-xs font-medium border transition-all ${
                  active
                    ? 'bg-[#111318] text-white border-[#111318] dark:bg-white dark:text-[#111318] dark:border-white'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {t(`stage.backdrops.${id}`)}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onCycleMobileMode}
            className="lg:hidden h-7 px-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium flex items-center gap-1"
          >
            {mobileStageMode === 'tall' ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
            <span>{t(`stage.mobileMode.${mobileStageMode}`)}</span>
          </button>

          <div className="hidden sm:flex items-center h-7 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-1">
            <button
              type="button"
              onClick={() => onChangeZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(2)))}
              className="w-6 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              title={t('stage.zoomOut')}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onResetZoom}
              className="px-1.5 text-xs font-medium tabular-nums hover:text-blue-600"
              title={t('stage.zoomReset')}
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => onChangeZoom((z) => Math.min(1.6, +(z + 0.1).toFixed(2)))}
              className="w-6 h-5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
              title={t('stage.zoomIn')}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Canvas Stage Wrapper */}
      <div className="relative flex-1 min-h-0 flex flex-col overflow-hidden">
        <div
          onWheel={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.preventDefault();
              onChangeZoom((z) =>
                Math.min(1.6, Math.max(0.5, +(z + (e.deltaY < 0 ? 0.08 : -0.08)).toFixed(2)))
              );
            }
          }}
          style={stageBackdropStyle}
          className={`flex-1 ${mobileStageHeightClass} lg:min-h-0 lg:max-h-none overflow-auto overscroll-contain transition-all duration-200`}
        >
          <div className="min-h-full min-w-full flex p-6 sm:p-10 lg:p-14 lg:pb-20">
            <div className="m-auto">
              <motion.div
                animate={{ scale: zoom }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="inline-block origin-center"
              >
                <div
                  ref={captureTargetRef}
                  style={{
                    padding: `${config.exportPadding}px`,
                    backgroundColor: config.transparentExport
                      ? 'transparent'
                      : config.solidBgColor
                  }}
                  className="inline-block transition-colors duration-200"
                >
                  <div
                    className="flex flex-col"
                    style={{
                      gap: config.layoutMode === 'collage' ? '0px' : `${config.gap}px`
                    }}
                  >
                    <AnimatePresence initial={false}>
                      {comments.map((comment, idx) => {
                        const effectiveTilt = getEffectiveTilt(config, comment, idx);
                        let indentMarginLeft = 0;
                        let indentMarginRight = 0;
                        let overlapTop = 0;

                        if (config.layoutMode === 'thread' && (comment.isReply || idx > 0)) {
                          indentMarginLeft = 28;
                        } else if (config.layoutMode === 'zigzag') {
                          if (idx % 2 === 1) indentMarginLeft = 34;
                          else indentMarginRight = 34;
                        } else if (config.layoutMode === 'collage') {
                          if (idx % 2 === 1) indentMarginLeft = 22;
                          if (idx > 0) overlapTop = -10;
                        }

                        return (
                          <motion.div
                            key={comment.id}
                            layout
                            initial={{ opacity: 0, y: 12, scale: 0.97 }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              scale: 1,
                              rotate: effectiveTilt
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.94,
                              transition: { duration: 0.16 }
                            }}
                            transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                            style={{
                              marginLeft: `${indentMarginLeft}px`,
                              marginRight: `${indentMarginRight}px`,
                              marginTop: `${overlapTop}px`,
                              zIndex: comments.length - idx,
                              position: 'relative'
                            }}
                          >
                            <CommentCardPreview comment={comment} index={idx} config={config} />
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Pinned Desktop Bottom Telemetry Pill */}
        <div className="hidden lg:flex items-center gap-2.5 absolute bottom-4 left-5 z-20 h-8 px-3 rounded-lg bg-white/95 dark:bg-[#161920]/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 shadow-sm pointer-events-none">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {config.transparentExport ? t('stage.alphaPng') : t('stage.solidPng')}
          </span>
          <span className="opacity-40">•</span>
          <span className="tabular-nums">
            {liveDimensions.w} × {liveDimensions.h} px
          </span>
          <span className="opacity-40">•</span>
          <span className="tabular-nums">{t('stage.cardCount', { count: comments.length })}</span>
        </div>

        {/* Pinned Desktop Floating Export Actions */}
        <div className="hidden lg:flex items-center gap-2 absolute bottom-4 right-5 z-20">
          <button
            type="button"
            onClick={() => onExportPng('copy')}
            className="h-9 px-3.5 rounded-lg bg-white/95 dark:bg-[#161920]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 hover:border-slate-400 text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Copy className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('stage.copyPng')}</span>
          </button>
          <button
            type="button"
            onClick={() => onExportPng('download')}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('stage.savePng')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
