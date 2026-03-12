import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-body solution-output ${className}`}>
      <style>{`
        .solution-output {
          font-family: 'Inter', sans-serif;
          line-height: 1.8;
          color: #e2e8f0;
        }
        .solution-output .katex-display {
          margin: 1.5em 0;
          padding: 1rem;
          background: rgba(255,255,255,0.03);
          border-radius: 8px;
          overflow-x: auto;
          overflow-y: hidden;
        }
        .solution-output .katex {
          font-size: 1.1em;
        }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Custom components for better styling
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
          li: ({ node, ...props }) => <li className="" {...props} />,
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="my-6 rounded-xl overflow-hidden shadow-lg border border-[var(--border-primary)]">
                <div className="bg-[var(--bg-tertiary)] px-4 py-2 text-xs font-mono text-[var(--text-tertiary)] border-b border-[var(--border-primary)] flex justify-between items-center">
                  <span>{match[1].toUpperCase()}</span>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus as any}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, padding: '1.5rem', fontSize: '0.875rem' }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className={`${className} bg-[var(--bg-tertiary)] px-1.5 py-0.5 rounded text-sm font-mono`}
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-[var(--border-primary)] pl-4 italic my-4" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-[var(--border-primary)]" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-4 py-2 text-left font-bold" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-[var(--border-primary)] px-4 py-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
