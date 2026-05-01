'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight, oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useDarkMode } from '@/app/hooks/useDarkMode';
import '@/app/styles/markdown.css';
import { MdCode, MdContentCopy, MdCheck } from "react-icons/md";


const oneLightNoBackground = Object.fromEntries(
    Object.entries(oneLight).map(([key, value]) => {
        const { background: _bg, backgroundColor: _bgc, ...rest } = value as React.CSSProperties;
        return [key, rest];
    })
);

const oneDarkNoBackground = Object.fromEntries(
    Object.entries(oneDark).map(([key, value]) => {
        const { background: _bg, backgroundColor: _bgc, ...rest } = value as React.CSSProperties;
        return [key, rest];
    })
);

function CodeBlock({ language, children }: { language: string; children: string }) {
    const [copied, setCopied] = useState(false);
    const isDark = useDarkMode();

    const handleCopy = async () => {
        await navigator.clipboard.writeText(children);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="code-block-wrapper">
            <div className="code-block-header">
                <div className="code-block-lang">
                    <MdCode className="code-block-lang-icon" />
                    <span>{language || 'text'}</span>
                </div>
                <button
                    className={`code-copy-btn ${copied ? 'copied' : ''}`}
                    onClick={handleCopy}
                    title={copied ? 'Copied!' : 'Copy code'}
                >
                    {copied ? (
                        <MdCheck />
                    ) : (
                        <MdContentCopy />
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                style={isDark ? oneDarkNoBackground : oneLightNoBackground}
                language={language || 'text'}
                PreTag="div"
                customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: 'transparent',
                    padding: '0 16px 16px',
                }}
            >
                {children}
            </SyntaxHighlighter>
        </div>
    );
}

export default function Markdown({ content }: { content: string }) {
    return (
        <div className="markdown-content prose">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    pre({ children }) {
                        return <>{children}</>;
                    },
                    code({ className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !className;
                        if (isInline) {
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <CodeBlock language={match?.[1] ?? ''}>
                                {String(children).replace(/\n$/, '')}
                            </CodeBlock>
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
