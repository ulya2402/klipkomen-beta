import type { CommentItem, StudioConfig } from '../types';
import { parseRichSegments } from './richText';
import { getEffectiveTilt, getSurfaceTokens } from './surfaceTokens';

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function loadCanvasImage(src: string | null): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

interface WrappedToken {
  type: string;
  text: string;
  width: number;
}

function wrapRichLines(
  ctx: CanvasRenderingContext2D,
  rawText: string,
  maxWidth: number,
  baseFontSize: number,
  fontFamily: string
): WrappedToken[][] {
  const paragraphs = String(rawText || '').split('\n');
  const wrappedLines: WrappedToken[][] = [];

  paragraphs.forEach((para) => {
    const segments = parseRichSegments(para);
    const wordTokens: { type: string; text: string }[] = [];

    segments.forEach((seg) => {
      const parts = seg.value.split(/(\s+)/);
      parts.forEach((part) => {
        if (part.length > 0) {
          wordTokens.push({ type: seg.type, text: part });
        }
      });
    });

    let currentLine: WrappedToken[] = [];
    let currentWidth = 0;

    wordTokens.forEach((tok) => {
      const isBold = tok.type === 'bold' || tok.type === 'highlight' || tok.type === 'mention';
      const isItalic = tok.type === 'italic';
      ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? '700' : '500'} ${baseFontSize}px ${fontFamily}`;
      const padExtra = tok.type === 'highlight' ? 8 : 0;
      const tokWidth = ctx.measureText(tok.text).width + padExtra;

      if (currentWidth + tokWidth > maxWidth && currentLine.length > 0 && tok.text.trim() !== '') {
        wrappedLines.push(currentLine);
        currentLine = [];
        currentWidth = 0;
        if (tok.text.trim() === '') return;
      }
      currentLine.push({ ...tok, width: tokWidth });
      currentWidth += tokWidth;
    });

    wrappedLines.push(currentLine);
  });

  return wrappedLines.length ? wrappedLines : [[]];
}

export interface CanvasExportLabels {
  replyAction: string;
  pinnedByCreator: string;
  askMeAnything: string;
  brutalistTag: string;
  podcastTag: string;
  replyingToHandle: (handle: string) => string;
  replyingToName: (name: string) => string;
}

export async function renderArtboardToPngDataUrl(
  config: StudioConfig,
  comments: CommentItem[],
  labels: CanvasExportLabels
): Promise<string> {
  const t = getSurfaceTokens(config);
  const dpr = config.exportScale || 2;
  const exportPad = config.exportPadding || 28;
  const cardPad = config.cardPadding || 16;
  const cardW = config.cardWidth || 390;
  const gap = config.gap || 14;
  const scale = (config.fontScale || 100) / 100;
  const isCenter = config.textAlign === 'center';
  const style = config.cardStyle;
  const fontName = t.fontFamilyCss;

  const measureCanvas = document.createElement('canvas');
  const mCtx = measureCanvas.getContext('2d')!;

  const bodyFontPx = Math.round((style === 'editorial' ? 16.5 : 14.5) * scale);
  const lineHeight = Math.round(bodyFontPx * 1.44);
  const avatarSize = config.showAvatar ? config.avatarSize || 36 : 0;

  const isSideAvatarStyle =
    !isCenter &&
    config.showAvatar &&
    ['tiktok', 'threads', 'youtube', 'chat-bubble', 'lower-third', 'frosted'].includes(style);

  const textOffsetX = isSideAvatarStyle ? avatarSize + 12 : 0;
  const innerTextWidth = Math.max(140, cardW - cardPad * 2 - textOffsetX);

  const preparedItems = [];

  for (let i = 0; i < comments.length; i++) {
    const c = comments[i];
    const richLines = wrapRichLines(
      mCtx,
      c.text,
      innerTextWidth,
      bodyFontPx,
      style === 'editorial' ? '"Fraunces", Georgia, serif' : fontName
    );
    const attImg = await loadCanvasImage(c.attachmentImage);
    const avImg = await loadCanvasImage(c.avatarImage);

    let attH = 0;
    if (attImg && attImg.width > 0) {
      const ratio =
        c.attachmentAspect === 'square'
          ? 1
          : c.attachmentAspect === 'wide'
          ? 9 / 16
          : attImg.height / attImg.width;
      attH = Math.min(260, Math.round(innerTextWidth * ratio)) + 12;
    }

    const customBadge = (config.customBadgeText || '').trim();
    const hasTopBanner = style === 'ig-story' && config.showReplyTag;
    const hasTopTag =
      config.showReplyTag && (style === 'tiktok' || style === 'youtube' || style === 'editorial');
    const headerH = hasTopBanner ? 36 : hasTopTag ? 26 : 0;

    const stackedAvatarH = config.showAvatar && !isSideAvatarStyle ? avatarSize + 10 : 0;
    const showPodcastBar = style === 'podcast-clip';
    const podcastH = showPodcastBar ? 38 : 0;
    const metaH = config.showMetrics || (style === 'social-x' && config.showTimestamp) ? 26 : 0;

    const cardH =
      cardPad * 2 +
      headerH +
      stackedAvatarH +
      24 +
      richLines.length * lineHeight +
      attH +
      podcastH +
      metaH;

    let indentX = 0;
    if (config.layoutMode === 'thread' && (c.isReply || i > 0)) indentX = 28;
    if (config.layoutMode === 'zigzag' && i % 2 === 1) indentX = 34;
    if (config.layoutMode === 'collage' && i % 2 === 1) indentX = 22;

    const angleDeg = getEffectiveTilt(config, c, i);
    const radAngle = (angleDeg * Math.PI) / 180;
    const absCos = Math.abs(Math.cos(radAngle));
    const absSin = Math.abs(Math.sin(radAngle));

    const stackExtra = (config.stackDepth || 0) * 6;
    const rotW = (cardW + stackExtra) * absCos + (cardH + stackExtra) * absSin;
    const rotH = (cardW + stackExtra) * absSin + (cardH + stackExtra) * absCos;

    preparedItems.push({
      c,
      richLines,
      attImg,
      avImg,
      cardW,
      cardH,
      rotW,
      rotH,
      indentX,
      radAngle,
      headerH,
      hasTopBanner,
      customBadge,
      attH,
      podcastH
    });
  }

  const shadowSafety =
    config.shadow === 'deep' || config.shadow === 'glow'
      ? 26
      : config.shadow === 'soft'
      ? 16
      : 10;
  const totalPad = exportPad + shadowSafety;

  const contentMaxW = preparedItems.reduce(
    (max, item) => Math.max(max, item.indentX + item.rotW),
    0
  );
  const overlapOffset = config.layoutMode === 'collage' ? -10 : 0;
  const contentTotalH =
    preparedItems.reduce((sum, item) => sum + item.rotH, 0) +
    Math.max(0, preparedItems.length - 1) * (gap + overlapOffset);

  const canvasW = Math.ceil(totalPad * 2 + contentMaxW);
  const canvasH = Math.ceil(totalPad * 2 + contentTotalH);

  const out = document.createElement('canvas');
  out.width = Math.round(canvasW * dpr);
  out.height = Math.round(canvasH * dpr);
  const ctx = out.getContext('2d')!;
  ctx.scale(dpr, dpr);

  if (!config.transparentExport) {
    ctx.fillStyle = config.solidBgColor;
    ctx.fillRect(0, 0, canvasW, canvasH);
  }

  let cursorY = totalPad;

  preparedItems.forEach((item, idx) => {
    const {
      c,
      richLines,
      attImg,
      avImg,
      cardH,
      rotW,
      rotH,
      indentX,
      radAngle,
      headerH,
      hasTopBanner,
      customBadge,
      attH,
      podcastH
    } = item;

    const centerX = totalPad + indentX + rotW / 2;
    const centerY = cursorY + rotH / 2;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(radAngle);

    const x = -cardW / 2;
    const y = -cardH / 2;

    if ((config.stackDepth || 0) >= 2) {
      ctx.save();
      ctx.translate(10, 10);
      ctx.rotate((2 * Math.PI) / 180);
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = t.bg;
      drawRoundedRectPath(ctx, x, y, cardW, cardH, config.borderRadius);
      ctx.fill();
      ctx.restore();
    }
    if ((config.stackDepth || 0) >= 1) {
      ctx.save();
      ctx.translate(5, 5);
      ctx.rotate((1 * Math.PI) / 180);
      ctx.globalAlpha = 0.82;
      ctx.fillStyle = t.bg;
      drawRoundedRectPath(ctx, x, y, cardW, cardH, config.borderRadius);
      ctx.fill();
      ctx.restore();
    }

    const isRightBubble = style === 'chat-bubble' && (c.isReply || idx % 2 === 1);
    const surfaceBg = isRightBubble ? t.accent : t.bg;
    const surfaceInk = isRightBubble ? '#FFFFFF' : t.ink;
    const surfaceMuted = isRightBubble ? 'rgba(255,255,255,0.8)' : t.muted;
    const mentionColor = isRightBubble ? '#FDE047' : t.accent;

    ctx.save();
    if (config.shadow === 'soft') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
    } else if (config.shadow === 'deep') {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
      ctx.shadowBlur = 38;
      ctx.shadowOffsetY = 14;
    } else if (config.shadow === 'glow') {
      ctx.shadowColor = `${t.accent}66`;
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 8;
    } else if (config.shadow === 'hard') {
      ctx.fillStyle = t.isDark ? t.accent : '#111318';
      drawRoundedRectPath(ctx, x + 5, y + 5, cardW, cardH, config.borderRadius);
      ctx.fill();
    }

    ctx.fillStyle = surfaceBg;
    drawRoundedRectPath(ctx, x, y, cardW, cardH, config.borderRadius);
    ctx.fill();
    ctx.restore();

    if (hasTopBanner) {
      ctx.save();
      drawRoundedRectPath(ctx, x, y, cardW, cardH, config.borderRadius);
      ctx.clip();
      ctx.fillStyle = t.accent;
      ctx.fillRect(x, y, cardW, headerH);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `600 13px ${fontName}`;
      ctx.textAlign = 'center';
      ctx.fillText(customBadge || c.replyTo || labels.askMeAnything, x + cardW / 2, y + 23);
      ctx.restore();
    }

    if (config.borderStyle !== 'none' || style === 'brutalist') {
      ctx.save();
      if (config.borderStyle === 'dashed') {
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = t.isDark ? 'rgba(255,255,255,0.35)' : 'rgba(17,19,24,0.3)';
      } else {
        ctx.lineWidth =
          config.borderStyle === 'bold' || (style === 'brutalist' && config.borderStyle === 'none')
            ? 2
            : 1;
        ctx.strokeStyle =
          config.borderStyle === 'bold' || (style === 'brutalist' && config.borderStyle === 'none')
            ? t.isDark
              ? '#F3F4F6'
              : '#111318'
            : t.borderColor;
      }
      drawRoundedRectPath(ctx, x, y, cardW, cardH, config.borderRadius);
      ctx.stroke();
      ctx.restore();
    }

    if (style === 'news-quote') {
      ctx.save();
      drawRoundedRectPath(ctx, x, y, cardW, cardH, config.borderRadius);
      ctx.clip();
      ctx.fillStyle = t.accent;
      ctx.fillRect(x, y, 5, cardH);
      ctx.restore();
    }

    let innerY = y + cardPad + (hasTopBanner ? headerH : 0);

    if (!hasTopBanner && headerH > 0) {
      ctx.fillStyle = style === 'editorial' ? t.accent : surfaceMuted;
      ctx.font =
        style === 'editorial'
          ? '700 24px "Fraunces", Georgia, serif'
          : `600 11px ${fontName}`;
      ctx.textAlign = isCenter ? 'center' : 'left';
      const labelStr =
        style === 'editorial'
          ? customBadge || '“'
          : style === 'youtube'
          ? customBadge || labels.pinnedByCreator
          : customBadge ||
            (c.replyTo
              ? labels.replyingToHandle(c.replyTo.replace(/^@/, ''))
              : labels.replyingToName(c.name));
      ctx.fillText(labelStr, isCenter ? x + cardW / 2 : x + cardPad, innerY + 14);
      innerY += headerH;
    }

    if (config.showAvatar) {
      const avX = isSideAvatarStyle
        ? x + cardPad
        : isCenter
        ? x + cardW / 2 - avatarSize / 2
        : x + cardPad;
      const avY = innerY;
      const avRad =
        config.avatarShape === 'squircle'
          ? avatarSize * 0.28
          : config.avatarShape === 'badge'
          ? avatarSize * 0.16
          : avatarSize / 2;

      ctx.save();
      drawRoundedRectPath(ctx, avX, avY, avatarSize, avatarSize, avRad);
      ctx.clip();
      if (avImg) {
        ctx.drawImage(avImg, avX, avY, avatarSize, avatarSize);
      } else {
        ctx.fillStyle = c.avatarColor || config.accentColor;
        ctx.fillRect(avX, avY, avatarSize, avatarSize);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 ${Math.round(avatarSize * 0.42)}px ${fontName}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          (c.name || 'K').charAt(0).toUpperCase(),
          avX + avatarSize / 2,
          avY + avatarSize / 2 + 1
        );
      }
      ctx.restore();

      if (!isSideAvatarStyle) {
        innerY += avatarSize + 10;
      }
    }

    const contentX = isCenter ? x + cardW / 2 : x + cardPad + textOffsetX;
    ctx.textAlign = isCenter ? 'center' : 'left';
    ctx.textBaseline = 'alphabetic';

    const verifiedPart = c.verified ? ' ✓' : '';
    const handlePart = config.showHandle ? ` @${String(c.handle || '').replace(/^@/, '')}` : '';
    const timePart = config.showTimestamp ? ` • ${c.time}` : '';

    ctx.fillStyle = surfaceInk;
    ctx.font = `700 ${Math.round(13 * scale)}px ${fontName}`;

    if (isCenter) {
      ctx.fillText(`${c.name}${verifiedPart}${handlePart}${timePart}`, contentX, innerY + 14);
    } else {
      ctx.fillText(`${c.name}${verifiedPart}`, contentX, innerY + 14);
      const nameW = ctx.measureText(`${c.name}${verifiedPart}`).width;
      if (handlePart || timePart) {
        ctx.fillStyle = surfaceMuted;
        ctx.font = `400 ${Math.round(11.5 * scale)}px ${fontName}`;
        ctx.fillText(`${handlePart}${timePart}`, contentX + nameW + 4, innerY + 14);
      }
    }

    if (
      !isCenter &&
      config.showReplyTag &&
      (style === 'brutalist' || style === 'podcast-clip')
    ) {
      const pillText =
        customBadge || (style === 'brutalist' ? labels.brutalistTag : labels.podcastTag);
      if (pillText) {
        ctx.font = `700 10px ${fontName}`;
        const pillW = ctx.measureText(pillText).width + 14;
        const pillX = x + cardW - cardPad - pillW;
        ctx.fillStyle = t.accent;
        drawRoundedRectPath(ctx, pillX, innerY + 2, pillW, 18, 5);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.fillText(pillText, pillX + pillW / 2, innerY + 14);
        ctx.textAlign = 'left';
      }
    }

    let textY = innerY + 34;
    const activeBodyFont = style === 'editorial' ? '"Fraunces", Georgia, serif' : fontName;

    richLines.forEach((lineTokens) => {
      const lineTotalW = lineTokens.reduce((sum, tok) => sum + tok.width, 0);
      let drawCursorX = isCenter ? contentX - lineTotalW / 2 : contentX;

      ctx.textAlign = 'left';
      lineTokens.forEach((tok) => {
        const isBold = tok.type === 'bold' || tok.type === 'highlight' || tok.type === 'mention';
        const isItalic = tok.type === 'italic';
        ctx.font = `${isItalic ? 'italic ' : ''}${isBold ? '700' : '500'} ${bodyFontPx}px ${activeBodyFont}`;

        if (tok.type === 'highlight') {
          ctx.fillStyle = `${t.accent}33`;
          drawRoundedRectPath(
            ctx,
            drawCursorX,
            textY - bodyFontPx + 2,
            tok.width,
            bodyFontPx + 5,
            5
          );
          ctx.fill();
          ctx.fillStyle = surfaceInk;
          ctx.fillText(tok.text, drawCursorX + 4, textY);
        } else if (tok.type === 'mention') {
          ctx.fillStyle = mentionColor;
          ctx.fillText(tok.text, drawCursorX, textY);
        } else {
          ctx.fillStyle = surfaceInk;
          ctx.fillText(tok.text, drawCursorX, textY);
          if (tok.type === 'underline') {
            ctx.strokeStyle = mentionColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(drawCursorX, textY + 3);
            ctx.lineTo(drawCursorX + tok.width, textY + 3);
            ctx.stroke();
          }
        }
        drawCursorX += tok.width;
      });

      textY += lineHeight;
    });

    if (attImg && attH > 0) {
      const drawH = attH - 12;
      const drawX = isCenter ? x + cardPad : contentX;
      ctx.save();
      drawRoundedRectPath(
        ctx,
        drawX,
        textY - 2,
        innerTextWidth,
        drawH,
        Math.max(6, config.borderRadius - 6)
      );
      ctx.clip();
      const scaleCover = Math.max(innerTextWidth / attImg.width, drawH / attImg.height);
      const sw = innerTextWidth / scaleCover;
      const sh = drawH / scaleCover;
      const sx = (attImg.width - sw) / 2;
      const sy = (attImg.height - sh) / 2;
      ctx.drawImage(attImg, sx, sy, sw, sh, drawX, textY - 2, innerTextWidth, drawH);
      ctx.restore();
      textY += attH;
    }

    if (podcastH > 0) {
      const barX = isCenter ? x + cardPad : contentX;
      ctx.fillStyle = t.subBg;
      drawRoundedRectPath(ctx, barX, textY, innerTextWidth, 28, 8);
      ctx.fill();
      ctx.fillStyle = t.accent;
      ctx.beginPath();
      ctx.arc(barX + 16, textY + 14, 9, 0, Math.PI * 2);
      ctx.fill();
      const bars = [35, 70, 50, 95, 60, 85, 40, 75, 90, 55, 65, 45, 80, 50];
      const waveAreaW = innerTextWidth - 68;
      const stepW = waveAreaW / bars.length;
      bars.forEach((hPct, bi) => {
        const bh = Math.max(4, (hPct / 100) * 16);
        drawRoundedRectPath(
          ctx,
          barX + 32 + bi * stepW,
          textY + 14 - bh / 2,
          Math.max(2, stepW - 3),
          bh,
          2
        );
        ctx.fill();
      });
      textY += podcastH;
    }

    if (config.showMetrics) {
      ctx.fillStyle = surfaceMuted;
      ctx.font = `500 ${Math.round(11.5 * scale)}px ${fontName}`;
      ctx.textAlign = isCenter ? 'center' : 'left';
      ctx.fillText(`♥ ${c.likes}   ${labels.replyAction}`, contentX, textY + 8);
    }

    if (config.decoration === 'tape') {
      ctx.save();
      ctx.translate(0, y);
      ctx.rotate((-2 * Math.PI) / 180);
      ctx.fillStyle = `${t.accent}45`;
      ctx.fillRect(-46, -11, 92, 22);
      ctx.restore();
    } else if (config.decoration === 'pin') {
      ctx.save();
      ctx.fillStyle = t.accent;
      ctx.beginPath();
      ctx.arc(x + cardW - 28, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
    cursorY += rotH + gap + overlapOffset;
  });

  return out.toDataURL('image/png');
}

function rasterizeSvgDataUrlToPng(
  svgDataUrl: string,
  fallbackW = 800,
  fallbackH = 450
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth || fallbackW;
      const h = img.naturalHeight || fallbackH;
      const c = document.createElement('canvas');
      c.width = w;
      c.height = h;
      const ctx = c.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(c.toDataURL('image/png'));
      } catch {
        resolve(svgDataUrl);
      }
    };
    img.onerror = () => resolve(svgDataUrl);
    img.src = svgDataUrl;
  });
}

export async function captureLiveDomToPngDataUrl(
  sourceNode: HTMLElement | null,
  zoom: number,
  config: StudioConfig,
  comments: CommentItem[],
  labels: CanvasExportLabels
): Promise<string> {
  if (!sourceNode) return renderArtboardToPngDataUrl(config, comments, labels);

  const rect = sourceNode.getBoundingClientRect();
  const currentZoom = zoom || 1;
  const width = Math.ceil(rect.width / currentZoom);
  const height = Math.ceil(rect.height / currentZoom);
  if (width <= 0 || height <= 0) return renderArtboardToPngDataUrl(config, comments, labels);

  const clone = sourceNode.cloneNode(true) as HTMLElement;
  clone.style.margin = '0';
  clone.style.transform = 'none';
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.boxSizing = 'border-box';

  const sourceElements = [sourceNode, ...Array.from(sourceNode.querySelectorAll('*'))];
  const cloneElements = [clone, ...Array.from(clone.querySelectorAll('*'))];

  sourceElements.forEach((srcEl, idx) => {
    const dstEl = cloneElements[idx] as HTMLElement | undefined;
    if (!dstEl || !(srcEl instanceof HTMLElement)) return;
    const computed = window.getComputedStyle(srcEl);
    let cssText = '';
    for (let i = 0; i < computed.length; i++) {
      const prop = computed[i];
      if (prop.startsWith('transition') || prop.startsWith('animation')) continue;
      cssText += `${prop}:${computed.getPropertyValue(prop)};`;
    }
    dstEl.style.cssText = cssText;
    if (dstEl === clone) {
      dstEl.style.margin = '0';
      dstEl.style.width = `${width}px`;
      dstEl.style.height = `${height}px`;
    }
  });

  const cloneImgs = Array.from(clone.querySelectorAll('img'));
  await Promise.all(
    cloneImgs.map(async (imgEl) => {
      const src = imgEl.getAttribute('src') || '';
      if (src.startsWith('data:image/svg+xml')) {
        const pngUrl = await rasterizeSvgDataUrlToPng(src);
        imgEl.setAttribute('src', pngUrl);
      }
    })
  );

  let fontCss = '';
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      for (const rule of Array.from(rules)) {
        if (rule.cssText && rule.cssText.includes('@font-face')) {
          fontCss += `${rule.cssText}\n`;
        }
      }
    } catch {
      // Ignore cross-origin stylesheet restrictions
    }
  }

  const serializedHtml = new XMLSerializer().serializeToString(clone);
  const svgMarkup = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <style>
        ${fontCss}
        * { box-sizing: border-box; }
      </style>
      <foreignObject x="0" y="0" width="100%" height="100%">
        ${serializedHtml}
      </foreignObject>
    </svg>
  `;

  const svgBlobUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  const dpr = config.exportScale || 2;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpr, dpr);
        ctx.drawImage(img, 0, 0, width, height);
        const pngDataUrl = canvas.toDataURL('image/png');
        resolve(pngDataUrl);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = (err) => reject(err);
    img.src = svgBlobUrl;
  });
}

export function triggerDownload(dataUrl: string, cardStyle: string) {
  const link = document.createElement('a');
  link.download = `klipkomen-${cardStyle}-${Date.now()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
