"use client";

import { RefObject } from "react";
import { Node } from "@/shared/entities/node";
import ReactMarkdown from "react-markdown";
import "@/app/styles/markdown.css";

interface ChatViewProps {
    activeNodes: Node[];
    headNodeId: string | null;
    onSetHeadNode: (nodeId: string) => void;
    registerElementRef: (id: string) => (el: HTMLDivElement | null) => void;
    containerRef: RefObject<HTMLDivElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;
}

function Question({ node }: { node: Node }) {
    const content =
        typeof node.message?.content === "string" ? node.message.content : "";
    if (!content) return null;
    
    return (
        <div className="flex justify-end">
            <div className="bg-bg-muted px-4 py-2 rounded-[20px] max-w-[70%] text-left break-words">
                {content}
            </div>
        </div>
    );
}

function Answer({ 
    node,
    isHead,
    setAsHead 
}: { 
    node: Node;
    isHead: boolean;
    setAsHead: () => void;
}) {
    const content =
        typeof node.message?.content === "string" ? node.message.content : "";
    if (!content) return null;

    return (
        <div
            className={`px-4 py-2 mb-4 rounded-[20px] w-full text-left cursor-pointer
              ${
                  isHead
                      ? "border-2 border-graph-head"
                      : "border-2 border-transparent"
              }`}
            onClick={setAsHead}
        >
            <div className="prose markdown-content break-words">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
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
    registerElementRef: (id: string) => (el: HTMLDivElement | null) => void;
}) {
    return (
        <div className="flex flex-col px-4 gap-2 py-2" ref={registerElementRef(node.nodeId)}>
            {node.type === "question" && <Question node={node} />}
            {node.type === "answer" && (
                <Answer node={node} isHead={isHead} setAsHead={setAsHead} />
            )}
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
                    // answerノードの場合のみsetAsHeadを有効にする
                    const shouldSetHead = node.type === "answer";
                    return (
                        <Message
                            key={node.nodeId}
                            node={node}
                            isHead={node.nodeId === headNodeId}
                            setAsHead={
                                shouldSetHead
                                    ? () => onSetHeadNode(node.nodeId)
                                    : () => {}
                            }
                            registerElementRef={registerElementRef}
                        />
                    );
                })}
            </div>
        </div>
    );
}
