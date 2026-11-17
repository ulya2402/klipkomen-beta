export type Language = 'id' | 'en';

export type CardStyleId =
  | 'tiktok'
  | 'threads'
  | 'youtube'
  | 'social-x'
  | 'ig-story'
  | 'instagram-comment'
  | 'whatsapp'
  | 'chat-bubble'
  | 'editorial'
  | 'news-quote'
  | 'podcast-clip'
  | 'brutalist'
  | 'lower-third'
  | 'frosted'
  | 'polaroid-note'
  | 'retro-window';

export type CardStyleCategory = 'all' | 'social' | 'aesthetic';

export type LayoutModeId = 'stack' | 'thread' | 'zigzag' | 'collage';

export type DecorationId =
  | 'none'
  | 'tape'
  | 'tape-corners'
  | 'pin'
  | 'paperclip'
  | 'sparkle'
  | 'gloss'
  | 'stamp';

export type CardThemeId = 'light' | 'dark' | 'warm' | 'glass';

export type FontFamilyId = 'sans' | 'inter' | 'dm-sans' | 'serif' | 'lora' | 'mono';

export type BorderStyleId = 'none' | 'thin' | 'bold' | 'dashed';

export type ShadowStyleId = 'none' | 'soft' | 'deep' | 'hard' | 'glow';

export type TextAlignId = 'left' | 'center';

export type AvatarShapeId = 'circle' | 'squircle' | 'badge';

export type AttachmentAspectId = 'auto' | 'wide' | 'square';

export type StageBackdropId = 'checker' | 'dark' | 'paper' | 'chroma';

export type ExportBgTextureId = 'solid' | 'dots' | 'grid' | 'paper' | 'gradient' | 'mesh';

export type MobileStageMode = 'normal' | 'tall' | 'compact';

export type InspectorTabId = 'content' | 'style' | 'export';

export interface StudioConfig {
  cardStyle: CardStyleId;
  layoutMode: LayoutModeId;
  cardTheme: CardThemeId;
  accentColor: string;
  borderRadius: number;
  cardWidth: number;
  cardPadding: number;
  gap: number;
  fontScale: number;
  fontFamily: FontFamilyId;
  borderStyle: BorderStyleId;
  shadow: ShadowStyleId;
  textAlign: TextAlignId;
  tiltAngle: number;
  decoration: DecorationId;
  stackDepth: number;
  cardOpacity: number;
  avatarSize: number;
  avatarShape: AvatarShapeId;
  customBadgeText: string;
  showAvatar: boolean;
  showHandle: boolean;
  showMetrics: boolean;
  showTimestamp: boolean;
  showReplyTag: boolean;
  transparentExport: boolean;
  solidBgColor: string;
  exportBgTexture: ExportBgTextureId;
  exportScale: number;
  exportPadding: number;
}

export interface CommentItem {
  id: string;
  name: string;
  handle: string;
  text: string;
  time: string;
  likes: string;
  verified: boolean;
  isReply: boolean;
  replyTo: string;
  customTilt: number | null;
  avatarColor: string;
  avatarImage: string | null;
  attachmentImage: string | null;
  attachmentAspect: AttachmentAspectId;
}

export interface StudioData {
  config: StudioConfig;
  comments: CommentItem[];
}

export interface ToastItem {
  id: number;
  message: string;
}

export interface RichSegment {
  type: 'text' | 'bold' | 'italic' | 'underline' | 'highlight' | 'mention';
  value: string;
}
