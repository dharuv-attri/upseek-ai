import React, { useState } from 'react';
import { Check, Copy, Play, Eye, Code2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// Simple yet elegant syntax highlighters for code blocks
function highlightCode(code: string, lang: string): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, lineIdx) => {
    // Quick regex tokenization for common languages
    const tokens: React.ReactNode[] = [];
    let remaining = line;

    // Pattern for comment
    const commentMatch = remaining.match(/(\/\/.*|#.*|\/\*.*\*\/)/);
    let commentPart = '';
    let codePart = remaining;
    if (commentMatch && commentMatch.index !== undefined) {
      codePart = remaining.slice(0, commentMatch.index);
      commentPart = remaining.slice(commentMatch.index);
    }

    // Highlight keywords, strings, numbers in codePart
    const parts = codePart.split(/(".*?"|'.*?'|`.*?`|\b(?:const|let|var|function|return|import|export|from|default|class|if|else|switch|case|break|for|while|try|catch|async|await|def|class|self|print|None|True|False|public|private|interface|type)\b|\b\d+\b)/g);

    parts.forEach((part, idx) => {
      if (!part) return;
      if (/^["'`].*["'`]$/.test(part)) {
        tokens.push(
          <span key={`str-${lineIdx}-${idx}`} className="text-emerald-400 dark:text-emerald-300">
            {part}
          </span>
        );
      } else if (
        /^(const|let|var|function|return|import|export|from|default|class|if|else|switch|case|break|for|while|try|catch|async|await|def|class|self|print|None|True|False|public|private|interface|type)$/.test(
          part
        )
      ) {
        tokens.push(
          <span key={`kw-${lineIdx}-${idx}`} className="text-purple-400 dark:text-purple-300 font-semibold">
            {part}
          </span>
        );
      } else if (/^\d+$/.test(part)) {
        tokens.push(
          <span key={`num-${lineIdx}-${idx}`} className="text-amber-400 dark:text-amber-300">
            {part}
          </span>
        );
      } else {
        tokens.push(<span key={`txt-${lineIdx}-${idx}`}>{part}</span>);
      }
    });

    if (commentPart) {
      tokens.push(
        <span key={`comm-${lineIdx}`} className="text-neutral-500 italic">
          {commentPart}
        </span>
      );
    }

    return (
      <div key={`line-${lineIdx}`} className="table-row">
        <span className="table-cell pr-4 text-right select-none text-neutral-600 text-xs font-mono">
          {lineIdx + 1}
        </span>
        <span className="table-cell whitespace-pre">{tokens.length > 0 ? tokens : ' '}</span>
      </div>
    );
  });
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const cleanLang = (language || 'text').toLowerCase().trim();
  const isWebSnippet = ['html', 'svg'].includes(cleanLang);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950/90 shadow-lg text-sm font-mono">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/90 border-b border-neutral-800 text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-cyan-400" />
          <span className="uppercase font-semibold tracking-wider text-neutral-300">
            {cleanLang || 'code'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isWebSnippet && (
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            >
              {showPreview ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showPreview ? 'Show Code' : 'Preview'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all active:scale-95"
            title="Copy code to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code or Live Preview */}
      {showPreview && isWebSnippet ? (
        <div className="p-4 bg-white text-neutral-900 rounded-b-xl overflow-auto min-h-[120px]">
          <div dangerouslySetInnerHTML={{ __html: code }} />
        </div>
      ) : (
        <div className="p-4 overflow-x-auto text-neutral-200">
          <div className="table w-full">{highlightCode(code, cleanLang)}</div>
        </div>
      )}
    </div>
  );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // Parse blocks: code fences, tables, headers, lists, quotes, paragraphs
  const renderFormattedText = (text: string): React.ReactNode => {
    // Process bold, italic, code, links
    const tokens: React.ReactNode[] = [];
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

    parts.forEach((part, index) => {
      if (!part) return;

      if (part.startsWith('`') && part.endsWith('`')) {
        tokens.push(
          <code
            key={index}
            className="px-1.5 py-0.5 mx-0.5 rounded bg-neutral-800/80 dark:bg-neutral-800 text-cyan-400 dark:text-cyan-300 font-mono text-[0.88em] border border-neutral-700/50"
          >
            {part.slice(1, -1)}
          </code>
        );
      } else if (part.startsWith('**') && part.endsWith('**')) {
        tokens.push(
          <strong key={index} className="font-semibold text-neutral-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith('*') && part.endsWith('*')) {
        tokens.push(
          <em key={index} className="italic text-neutral-800 dark:text-neutral-200">
            {part.slice(1, -1)}
          </em>
        );
      } else if (part.startsWith('[') && part.includes('](')) {
        const titleMatch = part.match(/\[(.*?)\]\((.*?)\)/);
        if (titleMatch) {
          tokens.push(
            <a
              key={index}
              href={titleMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-500 hover:text-cyan-400 underline decoration-cyan-500/40 underline-offset-2 hover:decoration-cyan-400 transition-colors"
            >
              {titleMatch[1]}
            </a>
          );
        } else {
          tokens.push(part);
        }
      } else {
        tokens.push(part);
      }
    });

    return tokens;
  };

  // Split content by code blocks first
  const blocks: React.ReactNode[] = [];
  const lines = content.split('\n');

  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';

  let tableBuffer: string[] = [];
  let inTable = false;

  const flushTable = (key: string) => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer.map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
    );

    const headers = rows[0] || [];
    const bodyRows = rows.slice(2); // Skip separator row (e.g. |---|---|)

    blocks.push(
      <div key={key} className="my-4 overflow-x-auto rounded-xl border border-neutral-800 shadow-sm">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-neutral-900/90 text-neutral-200 border-b border-neutral-800 font-semibold">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-4 py-2.5">
                  {renderFormattedText(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-neutral-900/40 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-2 text-neutral-300">
                    {renderFormattedText(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code fence start or end
    if (line.trim().startsWith('```')) {
      if (inTable) flushTable(`table-${i}`);
      if (inCodeBlock) {
        // End code block
        blocks.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeBuffer.join('\n')}
            language={codeLang}
          />
        );
        codeBuffer = [];
        codeLang = '';
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = line.trim().replace(/^```/, '').trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Table detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      tableBuffer.push(line);
      continue;
    } else if (inTable) {
      flushTable(`table-${i}`);
    }

    // Headers
    if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={i} className="text-lg font-bold text-neutral-100 mt-5 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-4 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500 inline-block" />
          {renderFormattedText(line.slice(4))}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={i} className="text-xl font-bold text-neutral-100 mt-6 mb-3 pb-1 border-b border-neutral-800/80">
          {renderFormattedText(line.slice(3))}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(
        <h1 key={i} className="text-2xl font-extrabold text-neutral-100 mt-6 mb-4">
          {renderFormattedText(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      blocks.push(
        <blockquote
          key={i}
          className="my-3 pl-4 py-1 border-l-2 border-cyan-500 bg-cyan-950/20 text-neutral-300 italic rounded-r-md text-sm"
        >
          {renderFormattedText(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Horizontal Rule
    if (line.trim() === '---' || line.trim() === '***') {
      blocks.push(<hr key={i} className="my-5 border-neutral-800" />);
      continue;
    }

    // Bullet list items
    if (/^[-*•]\s+/.test(line.trim())) {
      const text = line.trim().replace(/^[-*•]\s+/, '');
      blocks.push(
        <li key={i} className="ml-4 list-disc text-neutral-300 my-1 leading-relaxed">
          {renderFormattedText(text)}
        </li>
      );
      continue;
    }

    // Numbered list items
    if (/^\d+\.\s+/.test(line.trim())) {
      const text = line.trim().replace(/^\d+\.\s+/, '');
      blocks.push(
        <li key={i} className="ml-4 list-decimal text-neutral-300 my-1 leading-relaxed">
          {renderFormattedText(text)}
        </li>
      );
      continue;
    }

    // Empty line / paragraph break
    if (!line.trim()) {
      blocks.push(<div key={i} className="h-2" />);
      continue;
    }

    // Regular paragraph
    blocks.push(
      <p key={i} className="my-1.5 leading-relaxed text-neutral-300">
        {renderFormattedText(line)}
      </p>
    );
  }

  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push(
      <CodeBlock
        key="code-last"
        code={codeBuffer.join('\n')}
        language={codeLang}
      />
    );
  }

  if (inTable) {
    flushTable('table-end');
  }

  return (
    <div className={`prose prose-invert max-w-none text-[15px] space-y-1 ${className}`}>
      {blocks}
    </div>
  );
};
