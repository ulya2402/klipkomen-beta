import type { AvatarShapeId, CommentItem, StudioConfig } from '../types';

export interface SurfaceTokens {
  rgb: string;
  ink: string;
  muted: string;
  subBg: string;
  borderColor: string;
  isDark: boolean;
  bg: string;
  accent: string;
  borderCss: string;
  boxShadow: string;
  fontFamilyCss: string;
  backdropFilter: string;
}

export function getSurfaceTokens(cfg: StudioConfig): SurfaceTokens {
  const { cardTheme, borderStyle, shadow, accentColor, cardStyle, cardOpacity } = cfg;
  const alpha = Math.max(0.5, Math.min(1, (cardOpacity ?? 100) / 100));

  const palettes = {
    light: {
      rgb: '255, 255, 255',
      ink: '#111318',
      muted: '#5A606E',
      subBg: 'rgba(17, 19, 24, 0.055)',
      borderColor: 'rgba(17, 19, 24, 0.13)',
      isDark: false
    },
    dark: {
      rgb: '22, 25, 32',
      ink: '#F3F4F6',
      muted: '#9CA3AF',
      subBg: 'rgba(255, 255, 255, 0.09)',
      borderColor: 'rgba(255, 255, 255, 0.16)',
      isDark: true
    },
    warm: {
      rgb: '250, 246, 238',
      ink: '#1F1B16',
      muted: '#736A5E',
      subBg: 'rgba(31, 27, 22, 0.065)',
      borderColor: 'rgba(31, 27, 22, 0.15)',
      isDark: false
    },
    glass: {
      rgb: '20, 22, 28',
      ink: '#FFFFFF',
      muted: 'rgba(255, 255, 255, 0.75)',
      subBg: 'rgba(255, 255, 255, 0.13)',
      borderColor: 'rgba(255, 255, 255, 0.26)',
      isDark: true
    }
  };

  const p = palettes[cardTheme] || palettes.light;

  const effectiveAlpha =
    cardStyle === 'frosted'
      ? Math.min(alpha, 0.76)
      : cardTheme === 'glass'
      ? Math.min(alpha, 0.78)
      : alpha;

  const bg = `rgba(${p.rgb}, ${effectiveAlpha})`;
  const useBlur = cardStyle === 'frosted' || cardTheme === 'glass' || effectiveAlpha < 0.98;

  let borderCss = 'none';
  if (borderStyle === 'thin') {
    borderCss = `1px solid ${p.borderColor}`;
  } else if (borderStyle === 'bold') {
    borderCss = `2px solid ${p.isDark ? '#F3F4F6' : '#111318'}`;
  } else if (borderStyle === 'dashed') {
    borderCss = `1.5px dashed ${p.isDark ? 'rgba(255,255,255,0.35)' : 'rgba(17,19,24,0.3)'}`;
  }

  if (cardStyle === 'brutalist' && borderStyle === 'none') {
    borderCss = `2px solid ${p.isDark ? '#F3F4F6' : '#111318'}`;
  }

  let boxShadow = 'none';
  if (shadow === 'soft') {
    boxShadow = '0 10px 26px -6px rgba(0, 0, 0, 0.15), 0 2px 6px -1px rgba(0, 0, 0, 0.06)';
  } else if (shadow === 'deep') {
    boxShadow = '0 22px 44px -10px rgba(0, 0, 0, 0.3), 0 6px 14px -4px rgba(0, 0, 0, 0.12)';
  } else if (shadow === 'hard') {
    boxShadow = `5px 5px 0px ${p.isDark ? accentColor : '#111318'}`;
  } else if (shadow === 'glow') {
    boxShadow = `0 12px 32px -4px ${accentColor}59, 0 2px 8px -1px ${accentColor}33`;
  }

  const fontStacks = {
    sans: '"Plus Jakarta Sans", system-ui, sans-serif',
    serif: '"Fraunces", Georgia, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
  };

  return {
    ...p,
    bg,
    accent: accentColor,
    borderCss,
    boxShadow,
    fontFamilyCss: fontStacks[cfg.fontFamily] || fontStacks.sans,
    backdropFilter: useBlur ? 'blur(16px)' : 'none'
  };
}

export function getAvatarRadius(shape: AvatarShapeId, size: number): string {
  if (shape === 'squircle') return `${Math.round(size * 0.28)}px`;
  if (shape === 'badge') return `${Math.round(size * 0.16)}px`;
  return '9999px';
}

export function getEffectiveTilt(cfg: StudioConfig, comment: CommentItem, index: number): number {
  if (typeof comment.customTilt === 'number' && !Number.isNaN(comment.customTilt)) {
    return comment.customTilt;
  }
  if (cfg.layoutMode === 'collage' && cfg.tiltAngle === 0) {
    const presetAngles = [-1.8, 1.5, -1.1, 2.0];
    return presetAngles[index % presetAngles.length];
  }
  if (cfg.tiltAngle !== 0 && index % 2 === 1 && cfg.layoutMode !== 'stack') {
    return -cfg.tiltAngle;
  }
  return cfg.tiltAngle;
}
