import type { ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, MessageSquareReply, Sparkles } from 'lucide-react';
import type { CommentItem, InspectorTabId, StudioConfig } from '../../types';
import { ContentTab } from './ContentTab';
import { StyleTab } from './StyleTab';
import { ExportTab } from './ExportTab';
import { useI18n } from '../../hooks/useI18n';

interface InspectorPanelProps {
  activeTab: InspectorTabId;
  onChangeTab: (tab: InspectorTabId) => void;
  config: StudioConfig;
  comments: CommentItem[];
  focusedCommentId: string;
  collapsedCardIds: Record<string, boolean>;
  liveDimensions: { w: number; h: number };
  onFocusComment: (id: string) => void;
  onOpenPaste: () => void;
  onOpenReset: () => void;
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
  onUpdateConfig: <K extends keyof StudioConfig>(key: K, value: StudioConfig[K]) => void;
  onApplyRandomTilt: () => void;
  onClearIndividualTilts: (angle: number) => void;
  onExportPng: (action: 'download' | 'copy') => void;
  onShowToast: (msg: string) => void;
}

export function InspectorPanel(props: InspectorPanelProps) {
  const { activeTab, onChangeTab } = props;
  const { t } = useI18n();

  const tabs: { id: InspectorTabId; labelKey: string; icon: typeof MessageSquareReply }[] = [
    { id: 'content', labelKey: 'tabs.content', icon: MessageSquareReply },
    { id: 'style', labelKey: 'tabs.style', icon: Sparkles },
    { id: 'export', labelKey: 'tabs.export', icon: Download }
  ];

  return (
    <aside className="order-2 lg:order-1 w-full lg:w-[415px] xl:w-[435px] shrink-0 bg-white dark:bg-[#161920] lg:border-r border-slate-200 dark:border-slate-800 flex flex-col lg:h-full pb-24 lg:pb-0">
      <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161920] z-20">
        <div className="grid grid-cols-3 bg-slate-100 dark:bg-[#0E1014] p-1 rounded-lg relative">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChangeTab(tab.id)}
                className={`relative z-10 h-8 rounded-md text-xs flex items-center justify-center gap-1.5 transition-colors ${
                  active
                    ? 'font-semibold text-slate-900 dark:text-white'
                    : 'font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="inspectorActiveTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-white dark:bg-[#1E222B] rounded-md shadow-2xs -z-10"
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{t(tab.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 lg:overflow-y-auto divide-y divide-slate-200 dark:divide-slate-800">
        <AnimatePresence mode="wait">
          {activeTab === 'content' && (
            <ContentTab
              config={props.config}
              comments={props.comments}
              focusedCommentId={props.focusedCommentId}
              collapsedCardIds={props.collapsedCardIds}
              onFocusComment={props.onFocusComment}
              onOpenPaste={props.onOpenPaste}
              onApplyPreset={props.onApplyPreset}
              onToggleAllCollapse={props.onToggleAllCollapse}
              onToggleCardCollapse={props.onToggleCardCollapse}
              onAddComment={props.onAddComment}
              onMoveComment={props.onMoveComment}
              onDuplicateComment={props.onDuplicateComment}
              onDeleteComment={props.onDeleteComment}
              onUpdateCommentField={props.onUpdateCommentField}
              onImageFile={props.onImageFile}
              onShowToast={props.onShowToast}
            />
          )}

          {activeTab === 'style' && (
            <StyleTab
              config={props.config}
              onUpdateConfig={props.onUpdateConfig}
              onApplyRandomTilt={props.onApplyRandomTilt}
              onClearIndividualTilts={props.onClearIndividualTilts}
            />
          )}

          {activeTab === 'export' && (
            <ExportTab
              config={props.config}
              liveDimensions={props.liveDimensions}
              onUpdateConfig={props.onUpdateConfig}
              onExportPng={props.onExportPng}
              onOpenReset={props.onOpenReset}
            />
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}
