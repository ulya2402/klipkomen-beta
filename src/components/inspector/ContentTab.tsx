import type { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CopyPlus,
  ImagePlus,
  UserCircle2,
  ChevronDown,
  ChevronUp,
  ChevronsDownUp,
  ChevronsUpDown
} from 'lucide-react';
import type { AttachmentAspectId, CommentItem, StudioConfig } from '../../types';
import { AVATAR_COLORS, SAMPLE_ATTACHMENT_SVG } from '../../constants/presets';
import { RichCommentEditor } from '../RichCommentEditor';
import { useI18n } from '../../hooks/useI18n';

interface ContentTabProps {
  config: StudioConfig;
  comments: CommentItem[];
  focusedCommentId: string;
  collapsedCardIds: Record<string, boolean>;
  onFocusComment: (id: string) => void;
  onOpenPaste: () => void;
  onApplyPreset: (key: string) => void;
  onToggleAllCollapse: () => void;
  onToggleCardCollapse: (id: string) => void;
  onAddComment: () => void;
  onMoveComment: (index: number, dir: number) => void;
  onDuplicateComment: (id: string) => void;
  onDeleteComment: (id: string) => void;
  onUpdateCommentField: <K extends keyof CommentItem>(
    id: string,
    field: K,
    value: CommentItem[K],
    recordSnap?: boolean
  ) => void;
  onImageFile: (
    e: ChangeEvent<HTMLInputElement>,
    commentId: string,
    field: 'avatarImage' | 'attachmentImage'
  ) => void;
  onShowToast: (msg: string) => void;
}

export function ContentTab({
  config,
  comments,
  focusedCommentId,
  collapsedCardIds,
  onFocusComment,
  onOpenPaste,
  onApplyPreset,
  onToggleAllCollapse,
  onToggleCardCollapse,
  onAddComment,
  onMoveComment,
  onDuplicateComment,
  onDeleteComment,
  onUpdateCommentField,
  onImageFile,
  onShowToast
}: ContentTabProps) {
  const { t } = useI18n();

  const templateList = [
    { id: 'tiktok-qa', labelKey: 'content.templates.tiktokQa' },
    { id: 'aesthetic-sticker', labelKey: 'content.templates.aestheticSticker' },
    { id: 'threads-debate', labelKey: 'content.templates.threadsDebate' },
    { id: 'visual-review', labelKey: 'content.templates.visualReview' },
    { id: 'editorial-quote', labelKey: 'content.templates.editorialQuote' }
  ];

  return (
    <motion.div
      key="tab-content"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.16 }}
      className="divide-y divide-slate-200 dark:divide-slate-800"
    >
      {/* Quick Templates */}
      <section className="p-4 sm:p-5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t('content.quickTemplates')}
          </h2>
          <button
            type="button"
            onClick={onOpenPaste}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t('content.bulkPasteLink')}
          </button>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {templateList.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onApplyPreset(p.id)}
              className="shrink-0 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-blue-500 text-xs font-medium transition-all active:scale-[0.98]"
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </section>

      {/* Card List */}
      <section className="p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('content.cardListTitle', { count: comments.length })}
            </h2>
            {comments.length > 1 && (
              <button
                type="button"
                onClick={onToggleAllCollapse}
                title={t('content.toggleAllTitle')}
                className="h-6 px-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:border-slate-400 text-[11px] font-medium text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors"
              >
                {comments.every((c) => collapsedCardIds[c.id]) ? (
                  <>
                    <ChevronsUpDown className="w-3 h-3" />
                    <span>{t('content.expandAll')}</span>
                  </>
                ) : (
                  <>
                    <ChevronsDownUp className="w-3 h-3" />
                    <span>{t('content.collapseAll')}</span>
                  </>
                )}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onAddComment}
            className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-2xs transition-all active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('content.addCard')}</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {comments.map((c, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === comments.length - 1;
            const isCollapsed = Boolean(collapsedCardIds[c.id]);
            const isFocused = focusedCommentId === c.id;
            const showReplyField =
              c.isReply || config.cardStyle === 'tiktok' || config.cardStyle === 'ig-story';
            const plainSnippet = String(c.text || '')
              .replace(/(\*\*|__|==|\*)/g, '')
              .trim();

            return (
              <motion.div
                layout
                key={c.id}
                onClick={() => onFocusComment(c.id)}
                className={`rounded-2xl border transition-colors overflow-hidden ${
                  isFocused
                    ? 'border-blue-500/70 bg-white dark:bg-[#1A1E27] shadow-xs'
                    : 'border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/45 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Collapsible Card Header */}
                <div className="px-3 py-2.5 flex items-center justify-between gap-2 select-none">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFocusComment(c.id);
                      onToggleCardCollapse(c.id);
                    }}
                    className="flex items-center gap-2.5 min-w-0 flex-1 text-left group"
                  >
                    <div className="relative shrink-0">
                      {c.avatarImage ? (
                        <img
                          src={c.avatarImage}
                          alt=""
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-2xs"
                          style={{ backgroundColor: c.avatarColor || '#2563EB' }}
                        >
                          {(c.name || 'K').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-bold tabular-nums flex items-center justify-center ring-2 ring-white dark:ring-[#1A1E27]">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {c.name || 'KlipKomen'}
                        </span>
                        {c.isReply && (
                          <span className="px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400 shrink-0">
                            {t('content.replyBadge')}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {plainSnippet || t('content.emptySnippet')}
                      </p>
                    </div>
                  </button>

                  {/* Compact Card Toolbar */}
                  <div
                    className="flex items-center gap-0.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onMoveComment(idx, -1)}
                      disabled={isFirst}
                      title={t('content.moveUp')}
                      className="w-6 h-6 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-25 transition-colors"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveComment(idx, 1)}
                      disabled={isLast}
                      title={t('content.moveDown')}
                      className="w-6 h-6 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 disabled:opacity-25 transition-colors"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateComment(c.id)}
                      title={t('content.duplicateCard')}
                      className="w-6 h-6 rounded-md hover:bg-slate-200/70 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                    >
                      <CopyPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteComment(c.id)}
                      disabled={comments.length <= 1}
                      title={t('content.deleteCard')}
                      className="w-6 h-6 rounded-md hover:bg-red-500/10 text-slate-400 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center disabled:opacity-25 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleCardCollapse(c.id)}
                      title={isCollapsed ? t('content.expandCard') : t('content.collapseCard')}
                      className="w-6 h-6 ml-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      {isCollapsed ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronUp className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Collapsible Card Editor Body */}
                <AnimatePresence initial={false}>
                  {!isCollapsed && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-3.5 pb-3.5 pt-2.5 border-t border-slate-200/70 dark:border-slate-800/80 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              {t('content.displayName')}
                            </label>
                            <input
                              type="text"
                              value={c.name}
                              onFocus={() => onFocusComment(c.id)}
                              onChange={(e) =>
                                onUpdateCommentField(c.id, 'name', e.target.value, false)
                              }
                              className="w-full h-8 px-2.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              {t('content.username')}
                            </label>
                            <input
                              type="text"
                              value={c.handle}
                              onFocus={() => onFocusComment(c.id)}
                              onChange={(e) =>
                                onUpdateCommentField(c.id, 'handle', e.target.value, false)
                              }
                              className="w-full h-8 px-2.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {t('content.commentTextLabel')}
                          </label>
                          <RichCommentEditor
                            value={c.text}
                            onFocus={() => onFocusComment(c.id)}
                            onChange={(val) => onUpdateCommentField(c.id, 'text', val, false)}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              {t('content.time')}
                            </label>
                            <input
                              type="text"
                              value={c.time}
                              onChange={(e) =>
                                onUpdateCommentField(c.id, 'time', e.target.value, false)
                              }
                              className="w-full h-8 px-2.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              {t('content.likes')}
                            </label>
                            <input
                              type="text"
                              value={c.likes}
                              onChange={(e) =>
                                onUpdateCommentField(c.id, 'likes', e.target.value, false)
                              }
                              className="w-full h-8 px-2.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              {t('content.tiltDeg')}
                            </label>
                            <input
                              type="number"
                              min={-15}
                              max={15}
                              step={0.5}
                              placeholder={t('content.autoPlaceholder')}
                              value={c.customTilt ?? ''}
                              onChange={(e) => {
                                const v = e.target.value;
                                onUpdateCommentField(
                                  c.id,
                                  'customTilt',
                                  v === '' ? null : parseFloat(v),
                                  true
                                );
                              }}
                              className="w-full h-8 px-2 rounded-lg text-xs tabular-nums bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                          <div className="flex items-center gap-3 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={c.verified}
                                onChange={(e) =>
                                  onUpdateCommentField(c.id, 'verified', e.target.checked, true)
                                }
                                className="accent-blue-600 rounded"
                              />
                              <span>{t('content.verified')}</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={c.isReply}
                                onChange={(e) =>
                                  onUpdateCommentField(c.id, 'isReply', e.target.checked, true)
                                }
                                className="accent-blue-600 rounded"
                              />
                              <span>{t('content.reply')}</span>
                            </label>
                          </div>

                          <div
                            className="flex items-center gap-1"
                            title={t('content.avatarColorTitle')}
                          >
                            {AVATAR_COLORS.slice(0, 6).map((col) => (
                              <button
                                key={col}
                                type="button"
                                onClick={() =>
                                  onUpdateCommentField(c.id, 'avatarColor', col, true)
                                }
                                className={`w-4 h-4 rounded-full border transition-transform ${
                                  c.avatarColor === col
                                    ? 'ring-2 ring-offset-1 ring-blue-500 scale-110 border-white'
                                    : 'border-black/15'
                                }`}
                                style={{ backgroundColor: col }}
                              />
                            ))}
                          </div>
                        </div>

                        {showReplyField && (
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              {t('content.replyPromptLabel')}
                            </label>
                            <input
                              type="text"
                              value={c.replyTo || ''}
                              placeholder={t('content.replyPromptPlaceholder')}
                              onChange={(e) =>
                                onUpdateCommentField(c.id, 'replyTo', e.target.value, false)
                              }
                              className="w-full h-8 px-2.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                            />
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <label className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium cursor-pointer hover:border-blue-500 flex items-center gap-1.5 transition-colors">
                              <UserCircle2 className="w-3.5 h-3.5 text-slate-500" />
                              <span>{t('content.profilePhoto')}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => onImageFile(e, c.id, 'avatarImage')}
                                className="hidden"
                              />
                            </label>
                            {c.avatarImage && (
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateCommentField(c.id, 'avatarImage', null, true)
                                }
                                className="h-8 px-2 rounded-lg text-xs text-red-600 hover:bg-red-500/10"
                              >
                                {t('content.resetPhoto')}
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <label className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium cursor-pointer hover:border-blue-500 flex items-center gap-1.5 transition-colors">
                              <ImagePlus className="w-3.5 h-3.5 text-slate-500" />
                              <span>{t('content.addAttachment')}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => onImageFile(e, c.id, 'attachmentImage')}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateCommentField(
                                  c.id,
                                  'attachmentImage',
                                  SAMPLE_ATTACHMENT_SVG,
                                  true
                                );
                                onShowToast(t('toasts.sampleAdded'));
                              }}
                              className="h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                            >
                              {t('content.sampleAttachment')}
                            </button>
                          </div>
                        </div>

                        {c.attachmentImage && (
                          <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">{t('content.aspectRatio')}</span>
                              <select
                                value={c.attachmentAspect}
                                onChange={(e) =>
                                  onUpdateCommentField(
                                    c.id,
                                    'attachmentAspect',
                                    e.target.value as AttachmentAspectId,
                                    true
                                  )
                                }
                                className="h-7 px-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                              >
                                <option value="auto">{t('content.aspectAuto')}</option>
                                <option value="wide">{t('content.aspectWide')}</option>
                                <option value="square">{t('content.aspectSquare')}</option>
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateCommentField(c.id, 'attachmentImage', null, true)
                              }
                              className="text-red-600 font-medium hover:underline"
                            >
                              {t('content.removePhoto')}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
}
