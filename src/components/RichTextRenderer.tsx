import React from 'react';
import { parseRichSegments } from '../utils/richText';

interface RichTextRendererProps {
  text: string;
  accentColor: string;
}

export function RichTextRenderer({ text, accentColor }: RichTextRendererProps) {
  const lines = String(text || '').split('\n');
  return (
    <>
      {lines.map((line, lineIdx) => {
        const segments = parseRichSegments(line);
        return (
          <React.Fragment key={lineIdx}>
            {lineIdx > 0 && <br />}
            {segments.map((seg, segIdx) => {
              if (seg.type === 'bold') {
                return (
                  <strong key={segIdx} className="font-extrabold">
                    {seg.value}
                  </strong>
                );
              }
              if (seg.type === 'italic') {
                return (
                  <em key={segIdx} className="italic">
                    {seg.value}
                  </em>
                );
              }
              if (seg.type === 'underline') {
                return (
                  <span
                    key={segIdx}
                    style={{
                      textDecoration: 'underline',
                      textDecorationColor: accentColor,
                      textDecorationThickness: '2px',
                      textUnderlineOffset: '3px'
                    }}
                  >
                    {seg.value}
                  </span>
                );
              }
              if (seg.type === 'highlight') {
                return (
                  <mark
                    key={segIdx}
                    className="px-1.5 py-0.5 rounded-md font-semibold"
                    style={{
                      backgroundColor: `${accentColor}26`,
                      color: 'inherit'
                    }}
                  >
                    {seg.value}
                  </mark>
                );
              }
              if (seg.type === 'mention') {
                return (
                  <span key={segIdx} className="font-semibold" style={{ color: accentColor }}>
                    {seg.value}
                  </span>
                );
              }
              return <React.Fragment key={segIdx}>{seg.value}</React.Fragment>;
            })}
          </React.Fragment>
        );
      })}
    </>
  );
}
