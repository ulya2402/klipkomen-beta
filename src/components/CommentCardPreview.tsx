import type { CSSProperties } from 'react';
import { Pin, Heart, Play } from 'lucide-react';
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
    // 1. TIKTOK REPLY
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
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ backgroundColor: t.subBg, color: t.muted }}
              >
                <span>↩</span>
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
              {renderAuthorRow()}
              <p className="mt-1 leading-snug font-medium break-words" style={{ fontSize: bodySize }}>
                <RichTextRenderer text={comment.text} accentColor={t.accent} />
              </p>
              {renderAttachment()}
              {renderMetrics()}
            </div>
          </div>
        </div>
      );
    }

    // 2. INSTAGRAM / THREADS
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
                  style={{ backgroundColor: t.borderColor, minHeight: '14px' }}
                />
              </div>
            )}
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
    }

    // 3. YOUTUBE PINNED
    if (style === 'youtube') {
      const pinLabel = resolveBadgeText(tr('preview.pinnedByCreator'));
      return (
        <div style={baseCardStyle}>
          {pinLabel && (
            <div
              className={`mb-2 flex items-center gap-1.5 text-[11px] font-semibold ${
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
              {renderAuthorRow()}
              <p className="mt-1 leading-relaxed break-words" style={{ fontSize: bodySize }}>
                <RichTextRenderer text={comment.text} accentColor={t.accent} />
              </p>
              {renderAttachment()}
              {config.showMetrics && (
                <div
                  className={`mt-2.5 flex items-center gap-3.5 tabular-nums ${
                    isCenter ? 'justify-center' : 'justify-start'
                  }`}
                  style={{ fontSize: metaSize, color: t.muted }}
                >
                  <span>👍 {comment.likes}</span>
                  <span>👎</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: t.accent }}
                  >
                    {tr('preview.creatorHeart')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // 4. X / SOCIAL POST
    if (style === 'social-x') {
      const cornerMark = resolveBadgeText('𝕏');
      return (
        <div style={baseCardStyle}>
          <div
            className={`flex items-center gap-2 mb-2 ${
              isCenter ? 'flex-col justify-center' : 'justify-between'
            }`}
          >
            <div className={`flex items-center gap-2.5 min-w-0 ${isCenter ? 'flex-col' : ''}`}>
              {renderAvatar(Math.max(32, avatarSize + 2))}
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
              <span className="font-bold text-sm opacity-60 shrink-0">{cornerMark}</span>
            )}
          </div>
          <p className="leading-relaxed break-words" style={{ fontSize: bodySize }}>
            <RichTextRenderer text={comment.text} accentColor={t.accent} />
          </p>
          {renderAttachment()}
          {(config.showTimestamp || config.showMetrics) && (
            <div
              className={`mt-3 pt-2 border-t flex items-center tabular-nums ${
                isCenter ? 'justify-center gap-4' : 'justify-between'
              }`}
              style={{ borderColor: t.borderColor, fontSize: metaSize, color: t.muted }}
            >
              {config.showTimestamp && <span>{comment.time}</span>}
              {config.showMetrics && (
                <span>
                  ♥ {comment.likes} {tr('preview.likesSuffix')}
                </span>
              )}
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
              style={{ backgroundColor: t.accent, fontSize: nameSize }}
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
              {renderAuthorRow()}
            </div>
            <p className="leading-relaxed font-medium break-words" style={{ fontSize: bodySize }}>
              <RichTextRenderer text={comment.text} accentColor={t.accent} />
            </p>
            {renderAttachment()}
          </div>
        </div>
      );
    }

    // 6. CHAT BUBBLE
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

    // 7. EDITORIAL CARD
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

    // 8. NEWS QUOTE
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

    // 9. PODCAST CLIP
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

    // 10. BRUTALIST
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

    // 11. LOWER THIRD
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

    // 12. FROSTED OVERLAY
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

        {decoration === 'tape' && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rounded-xs shadow-2xs"
            style={{
              backgroundColor: `${t.accent}42`,
              borderLeft: `2px dashed ${t.accent}70`,
              borderRight: `2px dashed ${t.accent}70`,
              transform: 'translateX(-50%) rotate(-2deg)',
              backdropFilter: 'blur(2px)'
            }}
          />
        )}

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
      </div>
    </div>
  );
}
