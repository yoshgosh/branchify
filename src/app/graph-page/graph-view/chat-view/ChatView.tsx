'use client';

import { RefObject } from 'react';
import { useAppSelector } from '@/client/store/store';
import { nodeSelectors } from '@/client/store/features/nodes/selectors';
import Markdown from './Markdown';
import { BranchifyIcon } from '@/app/components/BranchifyIcon';

interface ChatViewProps {
    activeNodeIds: string[];
    headNodeId: string | null;
    onSetHeadNode: (nodeId: string) => void;
    registerElementRef: (id: string) => (el: HTMLElement | null) => void;
    containerRef: RefObject<HTMLDivElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;
}

function Question({ content }: { content: string }) {
    return (
        <div className="flex justify-end">
            <div className="bg-base-2 px-4 py-2 rounded-[20px] max-w-[70%] text-left wrap-break-word whitespace-pre-wrap">
                {content}
            </div>
        </div>
    );
}

function Answer({
    content,
    status,
    isHead,
    setAsHead,
}: {
    content: string;
    status: string;
    isHead: boolean;
    setAsHead: () => void;
}) {
    if (!content && status !== 'in_progress') return null;

    return (
        <div
            className={`p-4 mb-4 rounded-[20px] w-full text-left cursor-pointer
            ${isHead ? 'border-2 border-base-9' : 'border-2 border-transparent'}`}
            onClick={setAsHead}
        >
            {!content && status === 'in_progress' ? (
                <div className="animate-pulse">
                    <BranchifyIcon size={24} color="var(--color-base-8)" />
                </div>
            ) : (
                <Markdown content={content} />
            )}
        </div>
    );
}

function Message({
    nodeId,
    isHead,
    onSetHeadNode,
    registerElementRef,
}: {
    nodeId: string;
    isHead: boolean;
    onSetHeadNode: (nodeId: string) => void;
    registerElementRef: (el: HTMLElement | null) => void;
}) {
    const node = useAppSelector((state) => nodeSelectors.selectById(state, nodeId));
    if (!node) return null;

    const content = typeof node.message?.content === 'string' ? node.message.content : '';

    return (
        <div className="flex flex-col px-4 gap-2 py-2" ref={registerElementRef}>
            {node.type === 'question' && content && <Question content={content} />}
            {node.type === 'answer' && (
                <Answer
                    content={content}
                    status={node.status}
                    isHead={isHead}
                    setAsHead={() => onSetHeadNode(nodeId)}
                />
            )}
        </div>
    );
}

export default function ChatView({
    activeNodeIds,
    headNodeId,
    onSetHeadNode,
    registerElementRef,
    containerRef,
    contentRef,
}: ChatViewProps) {
    return (
        <div className="h-full overflow-auto scrollbar-none" ref={containerRef}>
            <div className="w-full" ref={contentRef}>
                {activeNodeIds.map((nodeId) => (
                    <Message
                        key={nodeId}
                        nodeId={nodeId}
                        isHead={nodeId === headNodeId}
                        onSetHeadNode={onSetHeadNode}
                        registerElementRef={registerElementRef(nodeId)}
                    />
                ))}
            </div>
        </div>
    );
}
