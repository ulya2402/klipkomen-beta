import type { RichSegment } from '../types';

export function parseRichSegments(rawText: string): RichSegment[] {
  const text = String(rawText || '');
  const tokenRegex =
    /(\*\*[^*]+\*\*|__[^_]+__|==[^=]+==|\*[^*]+\*|@[a-zA-Z0-9._-]+|#[a-zA-Z0-9._-]+)/g;
  const segments: RichSegment[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      segments.push({ type: 'text', value: text.slice(lastIdx, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      segments.push({ type: 'bold', value: token.slice(2, -2) });
    } else if (token.startsWith('__') && token.endsWith('__')) {
      segments.push({ type: 'underline', value: token.slice(2, -2) });
    } else if (token.startsWith('==') && token.endsWith('==')) {
      segments.push({ type: 'highlight', value: token.slice(2, -2) });
    } else if (token.startsWith('*') && token.endsWith('*')) {
      segments.push({ type: 'italic', value: token.slice(1, -1) });
    } else if (token.startsWith('@') || token.startsWith('#')) {
      segments.push({ type: 'mention', value: token });
    } else {
      segments.push({ type: 'text', value: token });
    }
    lastIdx = match.index + token.length;
  }

  if (lastIdx < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIdx) });
  }
  return segments.length ? segments : [{ type: 'text', value: '' }];
}
