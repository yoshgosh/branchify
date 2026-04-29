'use client';

import { RefObject } from 'react';
import { Node } from '@/shared/entities/node';
import Markdown from './Markdown';

interface ChatViewProps {
    activeNodes: Node[];
    headNodeId: string | null;
    onSetHeadNode: (nodeId: string) => void;
    registerElementRef: (id: string) => (el: HTMLElement | null) => void;
    containerRef: RefObject<HTMLDivElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;
}

function Question({ node }: { node: Node }) {
    const content = typeof node.message?.content === 'string' ? node.message.content : '';
    if (!content) return null;

    return (
        <div className="flex justify-end">
            <div className="bg-bg-muted px-4 py-2 rounded-[20px] max-w-[70%] text-left wrap-break-word whitespace-pre-wrap">
                {content}
            </div>
        </div>
    );
}

function Answer({
    node,
    isHead,
    setAsHead,
}: {
    node: Node;
    isHead: boolean;
    setAsHead: () => void;
}) {
    const content = typeof node.message?.content === 'string' ? node.message.content : '';
    if (!content) return null;

    return (
        <div
            className={`p-4 mb-4 rounded-[20px] w-full text-left cursor-pointer
              ${isHead ? 'border-2 border-graph-head' : 'border-2 border-transparent'}`}
            onClick={setAsHead}
        >
            <Markdown content={content} />
        </div>
    );
}

function Message({
    node,
    isHead,
    setAsHead,
    registerElementRef,
}: {
    node: Node;
    isHead: boolean;
    setAsHead: () => void;
    registerElementRef: (el: HTMLElement | null) => void;
}) {
    return (
        <div className="flex flex-col px-4 gap-2 py-2" ref={registerElementRef}>
            {node.type === 'question' && <Question node={node} />}
            {node.type === 'answer' && <Answer node={node} isHead={isHead} setAsHead={setAsHead} />}
        </div>
    );
}

export default function ChatView({
    activeNodes,
    headNodeId,
    onSetHeadNode,
    registerElementRef,
    containerRef,
    contentRef,
}: ChatViewProps) {
    return (
        <div className="h-full overflow-auto scrollbar-none" ref={containerRef}>
            <div className="w-full" ref={contentRef}>
                {activeNodes.map((node) => {
                    const shouldSetHead = node.type === 'answer';
                    return (
                        <Message
                            key={node.nodeId}
                            node={node}
                            isHead={node.nodeId === headNodeId}
                            setAsHead={shouldSetHead ? () => onSetHeadNode(node.nodeId) : () => {}}
                            registerElementRef={registerElementRef(node.nodeId)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
