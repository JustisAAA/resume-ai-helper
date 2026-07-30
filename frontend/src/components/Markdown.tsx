import React from 'react';

/**
 * 简易 Markdown 渲染器
 * 支持：标题(###)、加粗(**)、斜体(*)、列表(- / 1.)、换行
 */
export default function Markdown({ content }: { content: string }) {
  if (!content) return null;

  // 按行分割，但保留空行（用于段落分隔）
  const lines = content.split('\n');

  const elements: React.ReactNode[] = [];
  let listBuffer: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let paragraphBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0 && listType) {
      const Tag = listType;
      elements.push(
        <Tag key={`list-${elements.length}`} className="my-2 ml-6 space-y-1 list-disc">
          {listBuffer}
        </Tag>
      );
      listBuffer = [];
      listType = null;
    }
  };

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      elements.push(
        <p key={`p-${elements.length}`} className="my-2 leading-relaxed">
          {parseInline(paragraphBuffer.join(' '))}
        </p>
      );
      paragraphBuffer = [];
    }
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    // 匹配 **bold**、*italic*、`code`
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**')) {
        parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('`')) {
        parts.push(<code key={key++} className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">{token.slice(1, -1)}</code>);
      } else {
        parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
      }
      lastIndex = match.index + token.length;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts;
  };

  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  lines.forEach((rawLine, idx) => {
    const line = rawLine.replace(/\r$/, '');

    // 空行：刷新buffer
    if (line.trim() === '') {
      flushAll();
      return;
    }

    // 标题
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const className = level === 1 ? 'text-2xl font-bold mt-4 mb-2' :
                        level === 2 ? 'text-xl font-bold mt-3 mb-2' :
                        level === 3 ? 'text-base font-bold mt-2 mb-1' :
                                      'text-sm font-bold mt-2 mb-1';
      elements.push(
        React.createElement(`h${level + 1}`, { key: `h-${idx}`, className: `${className} text-gray-900 dark:text-white` },
          parseInline(text)
        )
      );
      return;
    }

    // 无序列表
    const ulMatch = line.match(/^[\-\*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listBuffer.push(
        <li key={`li-${idx}`} className="leading-relaxed">{parseInline(ulMatch[1])}</li>
      );
      return;
    }

    // 有序列表
    const olMatch = line.match(/^\d+[\.、]\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listBuffer.push(
        <li key={`li-${idx}`} className="leading-relaxed">{parseInline(olMatch[1])}</li>
      );
      return;
    }

    // 普通段落
    flushList();
    paragraphBuffer.push(line.trim());
  });

  flushAll();

  return <div className="text-sm text-gray-700 dark:text-gray-300">{elements}</div>;
}