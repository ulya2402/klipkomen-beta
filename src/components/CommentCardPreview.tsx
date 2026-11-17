import type { CSSProperties } from 'react';
import { Pin, Heart, Play, MessageCircle, Repeat2, Share, Bookmark, ThumbsUp, ThumbsDown, MoreHorizontal } from 'lucide-react';
import type { CommentItem, StudioConfig } from '../types';
import { getAvatarRadius, getSurfaceTokens } from '../utils/surfaceTokens';
import { RichTextRenderer } from './RichTextRenderer';
import { useI18n } from '../hooks/useI18n';

interface CommentCardPreviewProps {
  comment: CommentItem;
  index: number;
  config: StudioConfig;
}

export function CommentCardPreview({ comment, index, config }: CommentCardPreviewProps) {
  const { t: tr } = useI18n();
  const t = getSurfaceTokens(config);
  const scale = (config.fontScale || 100) / 100;
  const isCenter = config.textAlign === 'center';
  const style = config.cardStyle;

  const w = `${config.cardWidth}px`;
  const pad = `${config.cardPadding}px`;
  const rad = `${config.borderRadius}px`;
  const bodySize = `${(14.5 * scale).toFixed(1)}px`;
  const nameSize = `${(13 * scale).toFixed(1)}px`;
  const metaSize = `${(11.5 * scale).toFixed(1)}px`;

  const avatarSize = config.avatarSize || 36;

  const renderAvatar = (customSize = avatarSize) => {
    if (!config.showAvatar) return null;
    const radPx = getAvatarRadius(config.avatarShape, customSize);
    const initial = (comment.name || 'K').trim().charAt(0).toUpperCase();

    if (comment.avatarImage) {
      return (
        <img
          src={comment.avatarImage}
          alt=""
          className="shrink-0 object-cover"
          style={{ width: `${customSize}px`, height: `${customSize}px`, borderRadius: radPx }}
        />
      );
    }
    return (
      <div
        className="shrink-0 flex items-center justify-center font-bold text-white select-none"
        style={{
          width: `${customSize}px`,
          height: `${customSize}px`,
          borderRadius: radPx,
          backgroundColor: comment.avatarColor || config.accentColor,
          fontSize: `${Math.round(customSize * 0.42)}px`
        }}
      >
        {initial}
      </div>
    );
  };

  const renderVerified = (color = t.accent) => {
    if (!comment.verified) return null;
    return (
      <svg className="inline-block shrink-0" width="14" height="14" viewBox="0 0 24 24" fill={color}>
        <path d="M12 2L14.8 4.2L18.4 4.1L19.6 7.5L22.5 9.6L21.5 13.1L22.5 16.6L19.6 18.7L18.4 22.1L14.8 22L12 24.2L9.2 22L5.6 22.1L4.4 18.7L1.5 16.6L2.5 13.1L1.5 9.6L4.4 7.5L5.6 4.1L9.2 4.2L12 2ZM10.4 16.2L17.1 9.5L15.7 8.1L10.4 13.4L8.1 11.1L6.7 12.5L10.4 16.2Z" />
      </svg>
    );
  };

  const renderAttachment = () => {
    if (!comment.attachmentImage) return null;
    let aspectClass = 'max-h-[260px] object-cover';
    if (comment.attachmentAspect === 'wide') aspectClass = 'aspect-video object-cover';
    if (comment.attachmentAspect === 'square') aspectClass = 'aspect-square object-cover';

    const innerRadius = Math.max(6, config.borderRadius - 6);
    return (
      <div className="mt-2.5 overflow-hidden w-full" style={{ borderRadius: `${innerRadius}px` }}>
        <img
          src={comment.attachmentImage}
          alt={tr('preview.attachmentAlt')}
          className={`w-full ${aspectClass} block`}
        />
      </div>
    );
  };

  const renderAuthorRow = (badgeColor = t.accent) => (
    <div
      className={`flex items-center gap-1.5 flex-wrap ${
        isCenter ? 'justify-center' : 'justify-start'
      }`}
    >
      <span className="font-bold leading-tight" style={{ fontSize: nameSize }}>
        {comment.name}
      </span>
      {renderVerified(badgeColor)}
      {config.showHandle && (
        <span style={{ fontSize: metaSize, color: t.muted }}>
          @{String(comment.handle || '').replace(/^@/, '')}
        </span>
      )}
      {config.showTimestamp && (
        <span style={{ fontSize: metaSize, color: t.muted }}>• {comment.time}</span>
      )}
    </div>
  );

  const renderMetrics = () => {
    if (!config.showMetrics) return null;
    return (
      <div
        className={`mt-2.5 flex items-center gap-4 tabular-nums ${
          isCenter ? 'justify-center' : 'justify-start'
        }`}
        style={{ fontSize: metaSize, color: t.muted }}
      >
        <span className="inline-flex items-center gap-1 font-medium">
          <Heart className="w-3.5 h-3.5" />
          {comment.likes}
        </span>
        <span className="font-medium">{tr('preview.replyAction')}</span>
      </div>
    );
  };

  const resolveBadgeText = (fallbackText: string) => {
    if (!config.showReplyTag) return null;
    const custom = (config.customBadgeText || '').trim();
    return custom || fallbackText;
  };

  const baseCardStyle: CSSProperties = {
    width: w,
    maxWidth: '100%',
    backgroundColor: t.bg,
    color: t.ink,
    borderRadius: rad,
    padding: pad,
    fontFamily: t.fontFamilyCss,
    textAlign: config.textAlign,
    borderTop: t.borderCss,
    borderRight: t.borderCss,
    borderBottom: t.borderCss,
    borderLeft: style === 'news-quote' ? `5px solid ${t.accent}` : t.borderCss,
    boxShadow: t.boxShadow,
    backdropFilter: t.backdropFilter,
    WebkitBackdropFilter: t.backdropFilter
  };

  const renderCardInterior = () => {
    // 1. TIKTOK REPLY (Authentic TikTok sticker)
    if (style === 'tiktok') {
      const defaultTag = comment.replyTo
        ? tr('preview.replyingToHandle', { handle: comment.replyTo.replace(/^@/, '') })
        : tr('preview.replyingToName', { name: comment.name });
      const tagText = resolveBadgeText(defaultTag);

      return (
        <div style={baseCardStyle}>
          {tagText && (
            <div className={`mb-2 flex ${isCenter ? 'justify-center' : 'justify-start'}`}>
              <div
                className="inline-flex items-center gap-1.5 text-[11px] font-medium"
                style={{ color: t.muted }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 14 4 9 9 4" />
                  <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                </svg>
                <span>{tagText}</span>
              </div>
            </div>
          )}
          <div
            className={`flex ${
              isCenter ? 'flex-col items-center gap-2' : 'items-start gap-2.5'
            }`}
          >
            {renderAvatar()}
            <div className="flex-1 min-w-0 w-full">
              {renderAuthorRow('#20D5EC')}
              <p className="mt-1 leading-snug font-medium break-words" style={{ fontSize: bodySize }}>
                <RichTextRenderer text={comment.text} accentColor={t.accent} />
              </p>
              {renderAttachment()}
              {config.showMetrics && (
                <div
                  className={`mt-2 flex items-center gap-4 tabular-nums ${
                    isCenter ? 'justify-center' : 'justify-start'
                  }`}
                  style={{ fontSize: metaSize, color: t.muted }}
                >
                  <span className="font-medium">{tr('preview.replyAction')}</span>
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Heart className="w-3.5 h-3.5" />
                    {comment.likes}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 2. THREADS (Authentic Meta Threads UI)
    if (style === 'threads') {
      return (
        <div style={baseCardStyle}>
          <div
            className={`flex ${
              isCenter ? 'flex-col items-center gap-2' : 'items-start gap-3'
            }`}
          >
            {isCenter ? (
              renderAvatar()
            ) : (
              <div className="flex flex-col items-center self-stretch">
                {renderAvatar()}
                <div
                  className="w-[2px] flex-1 mt-1.5 rounded-full"
                  style={{ backgroundColor: t.borderColor, minHeight: '16px' }}
                />
              </div>
            )}
            <div className="flex-1 min-w-0 w-full">
              <div className={`flex items-center gap-2 ${isCenter ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold truncate" style={{ fontSize: nameSize }}>
                    {config.showHandle
                      ? String(comment.handle || comment.name).replace(/^@/, '')
                      : comment.name}
                  </span>
                  {renderVerified('#0095F6')}
                </div>
                {!isCenter && (
                  <div className="flex items-center gap-2 shrink-0" style={{ color: t.muted }}>
                    {config.showTimestamp && (
                      <span style={{ fontSize: metaSize }}>{comment.time}</span>
                    )}
                    <MoreHorizontal className="w-4 h-4" />
                  </div>
                )}
              </div>
              <p className="mt-1 leading-relaxed break-words" style={{ fontSize: bodySize }}>
                <RichTextRenderer text={comment.text} accentColor={t.accent} />
              </p>
              {renderAttachment()}
              {config.showMetrics && (
                <div
                  className={`mt-2.5 flex items-center gap-4 ${
                    isCenter ? 'justify-center' : 'justify-start'
                  }`}
                  style={{ color: t.ink }}
                >
                  <Heart className="w-4 h-4 opacity-80" />
                  <MessageCircle className="w-4 h-4 opacity-80" />
                  <Repeat2 className="w-4 h-4 opacity-80" />
                  <Share className="w-4 h-4 opacity-80" />
                  <span className="text-[11px] tabular-nums ml-auto" style={{ color: t.muted }}>
                    {comment.likes} {tr('preview.likesSuffix')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 3. YOUTUBE PINNED (Authentic YouTube Pinned Comment + Creator Heart)
    if (style === 'youtube') {
      const pinLabel = resolveBadgeText(
        tr('preview.pinnedByCreator', { name: comment.name })
      );
      return (
        <div style={baseCardStyle}>
          {pinLabel && (
            <div
              className={`mb-2 flex items-center gap-1.5 text-[11px] font-medium ${
                isCenter ? 'justify-center' : 'justify-start'
              }`}
              style={{ color: t.muted }}
            >
              <Pin className="w-3 h-3" />
              <span>{pinLabel}</span>
            </div>
          )}
          <div
            className={`flex ${
              isCenter ? 'flex-col items-center gap-2' : 'items-start gap-3'
            }`}
          >
            {renderAvatar()}
            <div className="flex-1 min-w-0 w-full">
              <div
                className={`flex items-center gap-1.5 flex-wrap ${
                  isCenter ? 'justify-center' : 'justify-start'
                }`}
              >
                <span
                  className="font-semibold px-2 py-0.5 rounded-full text-[12px]"
                  style={{ backgroundColor: t.subBg }}
                >
                  @{String(comment.handle || comment.name).replace(/^@/, '')}
                </span>
                {renderVerified(t.muted)}
                {config.showTimestamp && (
                  <span style={{ fontSize: metaSize, color: t.muted }}>{comment.time}</span>
                )}
              </div>
              <p className="mt-1.5 leading-relaxed break-words" style={{ fontSize: bodySize }}>
                <RichTextRenderer text={comment.text} accentColor={t.accent} />
              </p>
              {renderAttachment()}
              {config.showMetrics && (
                <div
                  className={`mt-2.5 flex items-center gap-4 tabular-nums ${
                    isCenter ? 'justify-center' : 'justify-start'
                  }`}
                  style={{ fontSize: metaSize, color: t.muted }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{comment.likes}</span>
                  </span>
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span className="relative inline-flex items-center">
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                      style={{ backgroundColor: comment.avatarColor || t.accent }}
                    >
                      {(comment.name || 'K').charAt(0).toUpperCase()}
                    </span>
                    <span className=" -ml-1.5 mt-1.5 w-3 h-3 rounded-full bg-[#FF0033] text-white text-[7px] flex items-center justify-center ring-1 ring-white">
                      ♥
                    </span>
                  </span>
                  <span className="font-semibold text-[11px]">{tr('preview.replyAction')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 4. X (TWITTER) (Authentic X post card)
    if (style === 'social-x') {
      const cornerMark = resolveBadgeText('𝕏');
      return (
        <div style={baseCardStyle}>
          <div
            className={`flex items-center gap-2 mb-2.5 ${
              isCenter ? 'flex-col justify-center' : 'justify-between'
            }`}
          >
            <div className={`flex items-center gap-2.5 min-w-0 ${isCenter ? 'flex-col' : ''}`}>
              {renderAvatar(Math.max(34, avatarSize + 2))}
              <div className="min-w-0">
                <div className={`flex items-center gap-1 ${isCenter ? 'justify-center' : ''}`}>
                  <span className="font-bold truncate" style={{ fontSize: nameSize }}>
                    {comment.name}
                  </span>
                  {renderVerified('#1D9BF0')}
                </div>
                {config.showHandle && (
                  <div className="truncate" style={{ fontSize: metaSize, color: t.muted }}>
                    @{String(comment.handle || '').replace(/^@/, '')}
                  </div>
                )}
              </div>
            </div>
            {cornerMark && !isCenter && (
              <span className="font-bold text-base opacity-80 shrink-0">{cornerMark}</span>
            )}
          </div>
          <p className="leading-relaxed break-words" style={{ fontSize: bodySize }}>
            <RichTextRenderer text={comment.text} accentColor="#1D9BF0" />
          </p>
          {renderAttachment()}
          {config.showTimestamp && (
            <div className="mt-2.5 text-[11px]" style={{ color: t.muted }}>
              {comment.time} · <strong style={{ color: t.ink }}>14.2K</strong> Views
            </div>
          )}
          {config.showMetrics && (
            <div
              className={`mt-2.5 pt-2.5 border-t flex items-center tabular-nums ${
                isCenter ? 'justify-center gap-5' : 'justify-between'
              }`}
              style={{ borderColor: t.borderColor, fontSize: metaSize, color: t.muted }}
            >
              <span className="inline-flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5" /> 24
              </span>
              <span className="inline-flex items-center gap-1">
                <Repeat2 className="w-3.5 h-3.5" /> 18
              </span>
              <span className="inline-flex items-center gap-1 text-rose-500">
                <Heart className="w-3.5 h-3.5 fill-current" /> {comment.likes}
              </span>
              <Bookmark className="w-3.5 h-3.5" />
              <Share className="w-3.5 h-3.5" />
            </div>
          )}
        </div>
      );
    }

    // 5. IG STORY Q&A
    if (style === 'ig-story') {
      const promptTitle = resolveBadgeText(comment.replyTo || tr('preview.askMeAnything'));
      return (
        <div style={{ ...baseCardStyle, padding: 0, overflow: 'hidden' }}>
          {promptTitle && (
            <div
              className="px-4 py-2.5 text-white font-semibold text-center"
              style={{
                background: `linear-gradient(135deg, ${t.accent}, #EC4899)`,
                fontSize: nameSize
              }}
            >
              {promptTitle}
            </div>
          )}
          <div style={{ padding: pad }}>
            <div
              className={`flex items-center gap-2 mb-2 ${
                isCenter ? 'justify-center flex-col' : 'justify-start'
              }`}
            >
              {renderAvatar(Math.max(26, avatarSize - 6))}
              {renderAuthorRow('#0095F6')}
            </div>
            <p className="leading-relaxed font-medium break-words" style={{ fontSize: bodySize }}>
              <RichTextRenderer text={comment.text} accentColor={t.accent} />
            </p>
            {renderAttachment()}
          </div>
        </div>
      );
    }

    // 6. INSTAGRAM COMMENT (Authentic IG Comment Row)
    if (style === 'instagram-comment') {
      return (
        <div style={baseCardStyle}>
          <div className="flex items-start gap-2.5">
            {renderAvatar()}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-bold" style={{ fontSize: nameSize }}>
                  {String(comment.handle || comment.name).replace(/^@/, '')}
                </span>
                {renderVerified('#0095F6')}
                {config.showTimestamp && (
                  <span className="ml-1" style={{ fontSize: metaSize, color: t.muted }}>
                    {comment.time}
                  </span>
                )}
              </div>
              <p className="mt-0.5 leading-snug break-words" style={{ fontSize: bodySize }}>
                <RichTextRenderer text={comment.text} accentColor="#0095F6" />
              </p>
              {renderAttachment()}
              {config.showMetrics && (
                <div className="mt-1.5 flex items-center gap-3 text-[11px] font-semibold" style={{ color: t.muted }}>
                  <span>{tr('preview.replyAction')}</span>
                </div>
              )}
            </div>
            {config.showMetrics && (
              <div className="flex flex-col items-center gap-0.5 pt-1 shrink-0" style={{ color: t.muted }}>
                <Heart className="w-3.5 h-3.5" />
                <span className="text-[10px] tabular-nums">{comment.likes}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 7. WHATSAPP CHAT (Authentic WA Bubble with blue double-check)
    if (style === 'whatsapp') {
      const isRight = comment.isReply || index % 2 === 1;
      const waBg = isRight
        ? t.isDark
          ? '#005C4B'
          : '#D9FDD3'
        : t.isDark
        ? '#202C33'
        : '#FFFFFF';
      const waInk = t.isDark ? '#E9EDEF' : '#111B21';
      const waMuted = t.isDark ? '#8696A0' : '#667781';
      const r = config.borderRadius;
      const waRadius = isRight ? `${r}px 4px ${r}px ${r}px` : `4px ${r}px ${r}px ${r}px`;

      return (
        <div
          className={`flex items-start gap-2 ${isRight ? 'flex-row-reverse' : 'flex-row'}`}
          style={{ width: w, maxWidth: '100%' }}
        >
          {renderAvatar(Math.max(28, avatarSize - 4))}
          <div
            className="flex-1 min-w-0"
            style={{
              backgroundColor: waBg,
              color: waInk,
              borderRadius: waRadius,
              padding: pad,
              fontFamily: t.fontFamilyCss,
              textAlign: config.textAlign,
              border: t.borderCss,
              boxShadow: t.boxShadow
            }}
          >
            {!isRight && (
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[12px] font-semibold" style={{ color: t.accent }}>
                  {comment.name}
                </span>
                {config.showHandle && (
                  <span className="text-[11px]" style={{ color: waMuted }}>
                    ~@{String(comment.handle || '').replace(/^@/, '')}
                  </span>
                )}
              </div>
            )}
            <p className="leading-snug break-words" style={{ fontSize: bodySize }}>
              <RichTextRenderer text={comment.text} accentColor={t.accent} />
            </p>
            {renderAttachment()}
            {config.showTimestamp && (
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] tabular-nums" style={{ color: waMuted }}>
                <span>{comment.time}</span>
                <svg width="14" height="10" viewBox="0 0 16 11" fill="none">
                  <path d="M1 5.5L4.5 9L11 2" stroke="#53BDEB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5.5 5.5L9 9L15 2" stroke="#53BDEB" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        </div>
      );
    }

    // 8. CHAT BUBBLE (Modern iMessage / Messenger)
    if (style === 'chat-bubble') {
      const isRightBubble = comment.isReply || index % 2 === 1;
      const bubbleBg = isRightBubble ? t.accent : t.bg;
      const bubbleInk = isRightBubble ? '#FFFFFF' : t.ink;
      const mentionColor = isRightBubble ? '#FDE047' : t.accent;
      const r = config.borderRadius;
      const bubbleRadius = isRightBubble
        ? `${r}px ${r}px 4px ${r}px`
        : `${r}px ${r}px ${r}px 4px`;

      return (
        <div
          className={`flex items-end gap-2.5 ${isRightBubble ? 'flex-row-reverse' : 'flex-row'}`}
          style={{ width: w, maxWidth: '100%' }}
        >
          {renderAvatar(Math.max(28, avatarSize - 4))}
          <div
            className="flex-1 min-w-0"
            style={{
              backgroundColor: bubbleBg,
              color: bubbleInk,
              borderRadius: bubbleRadius,
              padding: pad,
              fontFamily: t.fontFamilyCss,
              textAlign: config.textAlign,
              borderTop: t.borderCss,
              borderRight: t.borderCss,
              borderBottom: t.borderCss,
              borderLeft: t.borderCss,
              boxShadow: t.boxShadow,
              backdropFilter: t.backdropFilter,
              WebkitBackdropFilter: t.backdropFilter
            }}
          >
            <div
              className={`flex items-center gap-1.5 mb-1 ${
                isCenter ? 'justify-center' : 'justify-start'
              }`}
            >
              <span className="text-[11px] font-bold opacity-90">{comment.name}</span>
              {renderVerified(isRightBubble ? '#FFFFFF' : t.accent)}
              {config.showHandle && (
                <span className="text-[10px] opacity-75">
                  @{String(comment.handle || '').replace(/^@/, '')}
                </span>
              )}
            </div>
            <p className="leading-snug break-words" style={{ fontSize: bodySize }}>
              <RichTextRenderer text={comment.text} accentColor={mentionColor} />
            </p>
            {renderAttachment()}
            {config.showTimestamp && (
              <div
                className={`mt-1.5 text-[10px] opacity-80 tabular-nums ${
                  isCenter ? 'text-center' : 'text-right'
                }`}
              >
                {comment.time} ✓✓
              </div>
            )}
          </div>
        </div>
      );
    }

    // 9. EDITORIAL CARD
    if (style === 'editorial') {
      const quoteGlyph = resolveBadgeText('“');
      return (
        <div style={baseCardStyle}>
          {quoteGlyph && (
            <div className="text-3xl font-serif leading-none mb-1" style={{ color: t.accent }}>
              {quoteGlyph}
            </div>
          )}
          <p
            className="font-serif leading-snug font-semibold break-words"
            style={{ fontSize: `${(16.5 * scale).toFixed(1)}px` }}
          >
            <RichTextRenderer text={comment.text} accentColor={t.accent} />
          </p>
          {renderAttachment()}
          <div
            className={`mt-3.5 pt-3 border-t flex items-center gap-2.5 ${
              isCenter ? 'justify-center flex-col' : 'justify-start'
            }`}
            style={{ borderColor: t.borderColor }}
          >
            {renderAvatar(Math.max(28, avatarSize - 4))}
            <div>
              <div
                className={`font-bold flex items-center gap-1 ${
                  isCenter ? 'justify-center' : ''
                }`}
                style={{ fontSize: nameSize }}
              >
                <span>{comment.name}</span>
                {renderVerified(t.accent)}
              </div>
              {config.showHandle && (
                <div style={{ fontSize: metaSize, color: t.muted }}>
                  @{String(comment.handle || '').replace(/^@/, '')}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 10. NEWS QUOTE
    if (style === 'news-quote') {
      return (
        <div style={baseCardStyle}>
          <div
            className={`flex items-center gap-2.5 mb-2 ${
              isCenter ? 'justify-center flex-col' : 'justify-start'
            }`}
          >
            {renderAvatar(Math.max(28, avatarSize - 4))}
            {renderAuthorRow()}
          </div>
          <p className="leading-relaxed font-medium break-words" style={{ fontSize: bodySize }}>
            <RichTextRenderer text={comment.text} accentColor={t.accent} />
          </p>
          {renderAttachment()}
          {renderMetrics()}
        </div>
      );
    }

    // 11. PODCAST CLIP
    if (style === 'podcast-clip') {
      const bars = [35, 70, 50, 95, 60, 85, 40, 75, 90, 55, 65, 45, 80, 50, 70, 35];
      const audioPill = resolveBadgeText(tr('preview.podcastTag'));
      return (
        <div style={baseCardStyle}>
          <div
            className={`flex items-center gap-2 mb-2.5 ${
              isCenter ? 'flex-col justify-center' : 'justify-between'
            }`}
          >
            <div className={`flex items-center gap-2.5 ${isCenter ? 'flex-col' : ''}`}>
              {renderAvatar(Math.max(30, avatarSize - 2))}
              {renderAuthorRow()}
            </div>
            {audioPill && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white shrink-0"
                style={{ backgroundColor: t.accent }}
              >
                {audioPill}
              </span>
            )}
          </div>
          <p className="leading-relaxed break-words" style={{ fontSize: bodySize }}>
            “<RichTextRenderer text={comment.text} accentColor={t.accent} />”
          </p>
          {renderAttachment()}
          <div
            className="mt-3 px-3 py-2 rounded-lg flex items-center gap-2.5"
            style={{ backgroundColor: t.subBg }}
          >
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
              style={{ backgroundColor: t.accent }}
            >
              <Play className="w-3 h-3 fill-current ml-0.5" />
            </span>
            <div className="flex-1 flex items-center gap-[3px] h-5">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-full"
                  style={{ height: `${h}%`, backgroundColor: t.accent, opacity: 0.85 }}
                />
              ))}
            </div>
            <span className="tabular-nums text-[10px]" style={{ color: t.muted }}>
              0:24
            </span>
          </div>
        </div>
      );
    }

    // 12. BRUTALIST
    if (style === 'brutalist') {
      const popTag = resolveBadgeText(tr('preview.brutalistTag'));
      return (
        <div style={baseCardStyle}>
          <div
            className={`flex items-center gap-2 mb-2 pb-2 border-b ${
              isCenter ? 'flex-col justify-center' : 'justify-between'
            }`}
            style={{ borderColor: t.borderColor }}
          >
            <div className={`flex items-center gap-2 ${isCenter ? 'flex-col' : ''}`}>
              {renderAvatar(Math.max(28, avatarSize - 4))}
              {renderAuthorRow()}
            </div>
            {popTag && (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-white shrink-0"
                style={{ backgroundColor: t.accent }}
              >
                {popTag}
              </span>
            )}
          </div>
          <p className="leading-snug font-semibold break-words" style={{ fontSize: bodySize }}>
            <RichTextRenderer text={comment.text} accentColor={t.accent} />
          </p>
          {renderAttachment()}
          {renderMetrics()}
        </div>
      );
    }

    // 13. LOWER THIRD
    if (style === 'lower-third') {
      return (
        <div style={{ ...baseCardStyle, padding: '12px 16px' }}>
          <div
            className={`flex items-center gap-3 ${
              isCenter ? 'flex-col justify-center' : 'justify-start'
            }`}
          >
            {renderAvatar(Math.max(34, avatarSize + 4))}
            <div className="flex-1 min-w-0 w-full">
              <div
                className={`flex items-center gap-1.5 flex-wrap ${
                  isCenter ? 'justify-center' : 'justify-start'
                }`}
              >
                <span
                  className="font-bold text-xs px-2.5 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: t.accent }}
                >
                  {comment.name}
                </span>
                {config.showHandle && (
                  <span style={{ fontSize: metaSize, color: t.muted }}>
                    @{String(comment.handle || '').replace(/^@/, '')}
                  </span>
                )}
                {config.showTimestamp && (
                  <span style={{ fontSize: metaSize, color: t.muted }}>• {comment.time}</span>
                )}
              </div>
              <p
                className="mt-1.5 font-medium leading-snug break-words"
                style={{ fontSize: bodySize }}
              >
                <RichTextRenderer text={comment.text} accentColor={t.accent} />
              </p>
              {renderAttachment()}
            </div>
          </div>
        </div>
      );
    }

    // 14. POLAROID NOTE (Creative Aesthetic Card)
    if (style === 'polaroid-note') {
      return (
        <div style={{ ...baseCardStyle, padding: '14px 14px 18px 14px' }}>
          <div
            className="p-3.5 rounded-lg"
            style={{
              backgroundColor: t.subBg,
              border: `1px solid ${t.borderColor}`
            }}
          >
            <div
              className={`flex items-center gap-2 mb-2 ${
                isCenter ? 'justify-center flex-col' : 'justify-start'
              }`}
            >
              {renderAvatar(Math.max(26, avatarSize - 6))}
              {renderAuthorRow()}
            </div>
            <p className="leading-relaxed break-words" style={{ fontSize: bodySize }}>
              <RichTextRenderer text={comment.text} accentColor={t.accent} />
            </p>
            {renderAttachment()}
          </div>
          <div
            className={`mt-2.5 flex items-center justify-between text-[11px] font-medium px-1`}
            style={{ color: t.muted }}
          >
            <span>#{String(comment.handle || 'note').replace(/^@/, '')}</span>
            {config.showMetrics && <span>♥ {comment.likes}</span>}
          </div>
        </div>
      );
    }

    // 15. RETRO OS WINDOW (Minimalist Y2K / macOS Card)
    if (style === 'retro-window') {
      const winTitle = resolveBadgeText(`@${String(comment.handle || 'klipkomen').replace(/^@/, '')}`);
      return (
        <div style={{ ...baseCardStyle, padding: 0, overflow: 'hidden' }}>
          <div
            className="px-3.5 py-2 flex items-center justify-between border-b"
            style={{ backgroundColor: t.subBg, borderColor: t.borderColor }}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
            </div>
            {winTitle && (
              <span className="text-[11px] font-medium truncate max-w-[180px]" style={{ color: t.muted }}>
                {winTitle}
              </span>
            )}
            <div className="w-8" />
          </div>
          <div style={{ padding: pad }}>
            <div
              className={`flex ${
                isCenter ? 'flex-col items-center gap-2' : 'items-start gap-2.5'
              }`}
            >
              {renderAvatar()}
              <div className="flex-1 min-w-0 w-full">
                {renderAuthorRow()}
                <p className="mt-1 leading-relaxed break-words" style={{ fontSize: bodySize }}>
                  <RichTextRenderer text={comment.text} accentColor={t.accent} />
                </p>
                {renderAttachment()}
                {renderMetrics()}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // 16. FROSTED OVERLAY
    return (
      <div style={baseCardStyle}>
        <div
          className={`flex ${
            isCenter ? 'flex-col items-center gap-2' : 'items-start gap-3'
          }`}
        >
          {renderAvatar()}
          <div className="flex-1 min-w-0 w-full">
            {renderAuthorRow()}
            <p className="mt-1 leading-relaxed break-words" style={{ fontSize: bodySize }}>
              <RichTextRenderer text={comment.text} accentColor={t.accent} />
            </p>
            {renderAttachment()}
            {renderMetrics()}
          </div>
        </div>
      </div>
    );
  };

  const stackDepth = config.stackDepth || 0;
  const decoration = config.decoration || 'none';

  return (
    <div className="relative inline-block max-w-full">
      {stackDepth >= 2 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: t.bg,
            borderRadius: rad,
            border: t.borderCss,
            opacity: 0.55,
            transform: 'translate(10px, 10px) rotate(2deg)',
            zIndex: 0
          }}
        />
      )}

      {stackDepth >= 1 && (
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: t.bg,
            borderRadius: rad,
            border: t.borderCss,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            opacity: 0.82,
            transform: 'translate(5px, 5px) rotate(1deg)',
            zIndex: 1
          }}
        />
      )}

      <div className="relative" style={{ zIndex: 2 }}>
        {renderCardInterior()}

        {/* 1. Top Washi Tape */}
        {decoration === 'tape' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 left-1/2 w-24 h-6 rounded-xs shadow-2xs"
            style={{
              backgroundColor: `${t.accent}42`,
              borderLeft: `2px dashed ${t.accent}70`,
              borderRight: `2px dashed ${t.accent}70`,
              transform: 'translateX(-50%) rotate(-2deg)',
              backdropFilter: 'blur(2px)'
            }}
          />
        )}

        {/* 2. Corner Washi Tapes */}
        {decoration === 'tape-corners' && (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-2 -left-4 w-14 h-5 rounded-xs shadow-2xs"
              style={{
                backgroundColor: `${t.accent}45`,
                transform: 'rotate(-32deg)',
                backdropFilter: 'blur(2px)'
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2 -right-4 w-14 h-5 rounded-xs shadow-2xs"
              style={{
                backgroundColor: `${t.accent}45`,
                transform: 'rotate(-32deg)',
                backdropFilter: 'blur(2px)'
              }}
            />
          </>
        )}

        {/* 3. Pushpin */}
        {decoration === 'pin' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-2.5 right-6 w-5 h-5 rounded-full shadow-md flex items-center justify-center"
            style={{
              backgroundColor: t.accent,
              border: '2px solid #FFFFFF'
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
          </div>
        )}

        {/* 4. Metallic Paperclip */}
        {decoration === 'paperclip' && (
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute -top-4 left-5 drop-shadow-sm"
            width="22"
            height="36"
            viewBox="0 0 24 40"
            fill="none"
          >
            <path
              d="M7 14V30C7 33.866 10.134 37 14 37C17.866 37 21 33.866 21 30V10C21 5.02944 16.9706 1 12 1C7.02944 1 3 5.02944 3 10V27"
              stroke={t.isDark ? '#CBD5E1' : '#475569'}
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        )}

        {/* 5. Aesthetic Sparkles */}
        {decoration === 'sparkle' && (
          <>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -top-3 -right-2.5 drop-shadow-xs"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={t.accent}
            >
              <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" />
            </svg>
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2 -left-2 drop-shadow-xs"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill={t.accent}
              opacity="0.8"
            >
              <path d="M12 1L14.5 9.5L23 12L14.5 14.5L12 23L9.5 14.5L1 12L9.5 9.5L12 1Z" />
            </svg>
          </>
        )}

        {/* 6. Glass Corner Gloss */}
        {decoration === 'gloss' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              borderRadius: rad,
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.38) 0%, rgba(255,255,255,0.05) 38%, transparent 65%)'
            }}
          />
        )}

        {/* 7. Aesthetic Corner Stamp */}
        {decoration === 'stamp' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-2.5 right-4 px-2 py-0.5 rounded border-2 text-[9px] font-bold tracking-widest uppercase"
            style={{
              borderColor: t.accent,
              color: t.accent,
              backgroundColor: t.bg,
              transform: 'rotate(-6deg)'
            }}
          >
            {tr('preview.stampText')}
          </div>
        )}
      </div>
    </div>
  );
}
