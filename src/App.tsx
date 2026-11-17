import { useState, useEffect, useRef, useCallback, type ChangeEvent } from 'react';
import { Copy, Download } from 'lucide-react';
import type {
  CommentItem,
  InspectorTabId,
  MobileStageMode,
  StageBackdropId,
  StudioConfig,
  ToastItem
} from './types';
import { AVATAR_COLORS, getDefaultData, getPresetByKey, STORAGE_KEY } from './constants/presets';
import {
  captureLiveDomToPngDataUrl,
  renderArtboardToPngDataUrl,
  triggerDownload,
  type CanvasExportLabels
} from './utils/canvasExport';
import { HeaderBar } from './components/HeaderBar';
import { StageViewport } from './components/StageViewport';
import { InspectorPanel } from './components/inspector/InspectorPanel';
import { BulkPasteModal, ResetModal } from './components/Modals';
import { ToastStack } from './components/ToastStack';
import { useI18n } from './hooks/useI18n';

export default function App() {
  const { t } = useI18n();

  const [config, setConfig] = useState<StudioConfig>(() => getDefaultData().config);
  const [comments, setComments] = useState<CommentItem[]>(() => getDefaultData().comments);
  const [activeTab, setActiveTab] = useState<InspectorTabId>('content');
  const [darkUi, setDarkUi] = useState(false);
  const [stageBackdrop, setStageBackdrop] = useState<StageBackdropId>('checker');
  const [zoom, setZoom] = useState(1);
  const [mobileStageMode, setMobileStageMode] = useState<MobileStageMode>('normal');
  const [focusedCommentId, setFocusedCommentId] = useState('c-1');

  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [bulkPasteText, setBulkPasteText] = useState('');
  const [autoReplyIndent, setAutoReplyIndent] = useState(true);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [collapsedCardIds, setCollapsedCardIds] = useState<Record<string, boolean>>({});

  const [pastHistory, setPastHistory] = useState<string[]>([]);
  const [futureHistory, setFutureHistory] = useState<string[]>([]);

  const captureTargetRef = useRef<HTMLDivElement | null>(null);
  const [liveDimensions, setLiveDimensions] = useState({ w: 828, h: 620 });

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 2400);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.config && Array.isArray(parsed?.comments) && parsed.comments.length > 0) {
        setConfig((prev) => ({ ...prev, ...parsed.config }));
        setComments(parsed.comments);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, comments }));
      } catch {
        // Ignore quota exceeded
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [config, comments]);

  useEffect(() => {
    const el = captureTargetRef.current;
    if (!el) return;
    const updateSize = () => {
      const s = config.exportScale || 2;
      setLiveDimensions({
        w: Math.round(el.offsetWidth * s),
        h: Math.round(el.offsetHeight * s)
      });
    };
    updateSize();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateSize);
      ro.observe(el);
      return () => ro.disconnect();
    }
  }, [config, comments]);

  const pushHistory = useCallback(() => {
    const snapshot = JSON.stringify({ config, comments });
    setPastHistory((prev) => {
      if (prev[prev.length - 1] === snapshot) return prev;
      const next = [...prev, snapshot];
      return next.length > 35 ? next.slice(1) : next;
    });
    setFutureHistory([]);
  }, [config, comments]);

  const handleUndo = useCallback(() => {
    if (pastHistory.length === 0) return;
    const current = JSON.stringify({ config, comments });
    const previous = JSON.parse(pastHistory[pastHistory.length - 1]);
    setPastHistory((prev) => prev.slice(0, -1));
    setFutureHistory((prev) => [...prev, current]);
    setConfig(previous.config);
    setComments(previous.comments);
    showToast(t('toasts.undone'));
  }, [pastHistory, config, comments, showToast, t]);

  const handleRedo = useCallback(() => {
    if (futureHistory.length === 0) return;
    const current = JSON.stringify({ config, comments });
    const nextState = JSON.parse(futureHistory[futureHistory.length - 1]);
    setFutureHistory((prev) => prev.slice(0, -1));
    setPastHistory((prev) => [...prev, current]);
    setConfig(nextState.config);
    setComments(nextState.comments);
    showToast(t('toasts.redone'));
  }, [futureHistory, config, comments, showToast, t]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(
        document.activeElement?.tagName || ''
      );
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !isTyping) {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y' && !isTyping) {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Escape') {
        setIsPasteModalOpen(false);
        setIsResetModalOpen(false);
      }
    };

    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type?.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const result = ev.target?.result as string | undefined;
            if (!result) return;
            pushHistory();
            setComments((prev) => {
              const targetId = focusedCommentId || prev[0]?.id;
              return prev.map((c) =>
                c.id === targetId ? { ...c, attachmentImage: result } : c
              );
            });
            showToast(t('toasts.pastedImage'));
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('paste', onPaste);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('paste', onPaste);
    };
  }, [handleUndo, handleRedo, focusedCommentId, pushHistory, showToast, t]);

  const updateConfig = <K extends keyof StudioConfig>(key: K, value: StudioConfig[K]) => {
    pushHistory();
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const applyRandomAestheticTilt = () => {
    pushHistory();
    const organicAngles = [-3.5, 2.8, -2.2, 3.6, -1.8, 2.4];
    setComments((prev) =>
      prev.map((c, i) => ({
        ...c,
        customTilt: organicAngles[(i + Math.floor(Math.random() * 3)) % organicAngles.length]
      }))
    );
    showToast(t('toasts.randomTilt'));
  };

  const clearIndividualTilts = (angle = 0) => {
    pushHistory();
    setConfig((prev) => ({ ...prev, tiltAngle: angle }));
    setComments((prev) => prev.map((c) => ({ ...c, customTilt: null })));
  };

  const updateCommentField = <K extends keyof CommentItem>(
    id: string,
    field: K,
    value: CommentItem[K],
    recordSnap = true
  ) => {
    if (recordSnap) pushHistory();
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const addComment = () => {
    pushHistory();
    const idx = comments.length;
    const prevComment = comments[idx - 1];
    const newId = `c-${Date.now()}`;
    setComments((prev) => [
      ...prev,
      {
        id: newId,
        name: t('content.defaultCommentName', { index: idx + 1 }),
        handle: t('content.defaultCommentHandle', { index: idx + 1 }),
        text: t('content.defaultCommentText'),
        time: t('content.justNow'),
        likes: '88',
        verified: false,
        isReply: idx > 0,
        replyTo: prevComment ? prevComment.handle : '',
        customTilt: null,
        avatarColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
        avatarImage: null,
        attachmentImage: null,
        attachmentAspect: 'auto'
      }
    ]);
    setFocusedCommentId(newId);
    showToast(t('toasts.cardAdded'));
  };

  const moveComment = (index: number, dir: number) => {
    const target = index + dir;
    if (target < 0 || target >= comments.length) return;
    pushHistory();
    setComments((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      return copy;
    });
  };

  const duplicateComment = (id: string) => {
    const idx = comments.findIndex((c) => c.id === id);
    if (idx === -1) return;
    pushHistory();
    const clone: CommentItem = { ...comments[idx], id: `c-${Date.now()}`, isReply: true };
    setComments((prev) => {
      const copy = [...prev];
      copy.splice(idx + 1, 0, clone);
      return copy;
    });
    showToast(t('toasts.cardDuplicated'));
  };

  const deleteComment = (id: string) => {
    if (comments.length <= 1) return;
    pushHistory();
    setComments((prev) => prev.filter((c) => c.id !== id));
    showToast(t('toasts.cardDeleted'));
  };

  const handleImageFile = (
    e: ChangeEvent<HTMLInputElement>,
    commentId: string,
    field: 'avatarImage' | 'attachmentImage'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string | undefined;
      if (!result) return;
      updateCommentField(commentId, field, result, true);
      showToast(field === 'avatarImage' ? t('toasts.avatarUpdated') : t('toasts.attachmentAdded'));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const applyPreset = (key: string) => {
    const chosen = getPresetByKey(key);
    if (!chosen) return;
    pushHistory();
    setConfig((prev) => ({ ...prev, ...chosen.cfg }));
    setComments(chosen.list);
    showToast(t('toasts.templateApplied'));
  };

  const processBulkPaste = (mode: 'append' | 'replace') => {
    const raw = bulkPasteText.trim();
    if (!raw) {
      showToast(t('toasts.pasteEmpty'));
      return;
    }
    pushHistory();
    const lines = raw
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: CommentItem[] = lines.map((line, i) => {
      const match = line.match(/^@?([a-zA-Z0-9._-]+)\s*:\s*(.+)$/);
      const handle = match ? match[1] : `komentator_${i + 1}`;
      const name = match
        ? match[1].replace(/[._]/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
        : `User ${i + 1}`;
      const text = match ? match[2] : line;

      return {
        id: `c-${Date.now()}-${i}`,
        name,
        handle,
        text,
        time: `${i + 1}j`,
        likes: String(125 + i * 43),
        verified: i === 1,
        isReply: autoReplyIndent && i > 0,
        replyTo:
          autoReplyIndent && i > 0
            ? (lines[0].match(/^@?([a-zA-Z0-9._-]+)\s*:/) || [null, 'komentator_1'])[1] || ''
            : '',
        customTilt: null,
        avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
        avatarImage: null,
        attachmentImage: null,
        attachmentAspect: 'auto'
      };
    });

    setComments((prev) => (mode === 'replace' ? parsed : [...prev, ...parsed]));
    setIsPasteModalOpen(false);
    setBulkPasteText('');
    showToast(t('toasts.bulkCreated', { count: parsed.length }));
  };

  const handleConfirmReset = () => {
    pushHistory();
    const fresh = getDefaultData();
    setConfig(fresh.config);
    setComments(fresh.comments);
    setCollapsedCardIds({});
    localStorage.removeItem(STORAGE_KEY);
    setIsResetModalOpen(false);
    showToast(t('toasts.canvasReset'));
  };

  const toggleCardCollapse = (id: string) => {
    setCollapsedCardIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAllCardsCollapse = () => {
    const allCollapsed = comments.length > 0 && comments.every((c) => collapsedCardIds[c.id]);
    if (allCollapsed) {
      setCollapsedCardIds({});
    } else {
      const next: Record<string, boolean> = {};
      comments.forEach((c) => {
        next[c.id] = true;
      });
      setCollapsedCardIds(next);
    }
  };

  const handleExportPng = async (action: 'download' | 'copy' = 'download') => {
    const labels: CanvasExportLabels = {
      replyAction: t('preview.replyAction'),
      pinnedByCreator: t('preview.pinnedByCreator'),
      askMeAnything: t('preview.askMeAnything'),
      brutalistTag: t('preview.brutalistTag'),
      podcastTag: t('preview.podcastTag'),
      replyingToHandle: (handle) => t('preview.replyingToHandle', { handle }),
      replyingToName: (name) => t('preview.replyingToName', { name })
    };

    try {
      showToast(t('toasts.renderingPng'));
      let dataUrl: string;
      try {
        dataUrl = await captureLiveDomToPngDataUrl(
          captureTargetRef.current,
          zoom,
          config,
          comments,
          labels
        );
      } catch {
        dataUrl = await renderArtboardToPngDataUrl(config, comments, labels);
      }

      if (action === 'copy') {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          if (navigator.clipboard && window.ClipboardItem) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showToast(t('toasts.copiedPng'));
            return;
          }
        } catch {
          // Fallback to download
        }
        triggerDownload(dataUrl, config.cardStyle);
        showToast(t('toasts.clipboardFallback'));
      } else {
        triggerDownload(dataUrl, config.cardStyle);
        showToast(t('toasts.downloadedPng'));
      }
    } catch {
      showToast(t('toasts.exportFailed'));
    }
  };

  return (
    <div className={darkUi ? 'dark' : ''}>
      <div className="min-h-screen bg-[#F4F5F7] dark:bg-[#0E1014] text-[#111318] dark:text-[#F3F4F6] font-sans antialiased selection:bg-blue-500/20 selection:text-blue-600">
        <HeaderBar
          canUndo={pastHistory.length > 0}
          canRedo={futureHistory.length > 0}
          darkUi={darkUi}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onOpenPaste={() => setIsPasteModalOpen(true)}
          onOpenReset={() => setIsResetModalOpen(true)}
          onToggleDark={() => setDarkUi((d) => !d)}
          onDownloadPng={() => handleExportPng('download')}
        />

        <main className="flex flex-col lg:flex-row lg:h-[calc(100dvh-3rem)] lg:overflow-hidden">
          <StageViewport
            config={config}
            comments={comments}
            darkUi={darkUi}
            stageBackdrop={stageBackdrop}
            onChangeBackdrop={setStageBackdrop}
            zoom={zoom}
            onChangeZoom={setZoom}
            onResetZoom={() => setZoom(1)}
            mobileStageMode={mobileStageMode}
            onCycleMobileMode={() =>
              setMobileStageMode((m) =>
                m === 'normal' ? 'tall' : m === 'tall' ? 'compact' : 'normal'
              )
            }
            captureTargetRef={captureTargetRef}
            liveDimensions={liveDimensions}
            onExportPng={handleExportPng}
          />

          <InspectorPanel
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            config={config}
            comments={comments}
            focusedCommentId={focusedCommentId}
            collapsedCardIds={collapsedCardIds}
            liveDimensions={liveDimensions}
            onFocusComment={setFocusedCommentId}
            onOpenPaste={() => setIsPasteModalOpen(true)}
            onOpenReset={() => setIsResetModalOpen(true)}
            onApplyPreset={applyPreset}
            onToggleAllCollapse={toggleAllCardsCollapse}
            onToggleCardCollapse={toggleCardCollapse}
            onAddComment={addComment}
            onMoveComment={moveComment}
            onDuplicateComment={duplicateComment}
            onDeleteComment={deleteComment}
            onUpdateCommentField={updateCommentField}
            onImageFile={handleImageFile}
            onUpdateConfig={updateConfig}
            onApplyRandomTilt={applyRandomAestheticTilt}
            onClearIndividualTilts={clearIndividualTilts}
            onExportPng={handleExportPng}
            onShowToast={showToast}
          />
        </main>

        {/* Mobile Sticky Bottom Action Dock */}
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#161920]/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportPng('copy')}
            className="flex-1 h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <Copy className="w-4 h-4 text-slate-500" />
            <span>{t('stage.copyPng')}</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportPng('download')}
            className="flex-[1.4] h-10 px-4 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.98]"
          >
            <Download className="w-4 h-4" />
            <span>{t('header.downloadPng')}</span>
          </button>
        </div>

        <BulkPasteModal
          isOpen={isPasteModalOpen}
          onClose={() => setIsPasteModalOpen(false)}
          bulkPasteText={bulkPasteText}
          onChangeText={setBulkPasteText}
          autoReplyIndent={autoReplyIndent}
          onChangeAutoReplyIndent={setAutoReplyIndent}
          onProcess={processBulkPaste}
        />

        <ResetModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmReset}
        />

        <ToastStack toasts={toasts} />
      </div>
    </div>
  );
}
