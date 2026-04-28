'use client';

import { useAppDispatch, useAppSelector } from '@/client/store/store';
import { paneSelectors } from '@/client/store/features/panes/selectors';
import { setFocusedPaneId, updatePane } from '@/client/store/features/panes/slice';
import { selectNodesByGraphId, nodeSelectors } from '@/client/store/features/nodes/selectors';
import { selectEdgesByGraphId } from '@/client/store/features/edges/selectors';
import { graphSelectors } from '@/client/store/features/graphs/selectors';
import { useScroll } from '@/app/hooks/useScroll';
import { openPane } from '@/client/store/use-cases/panes/open-pane';
import { closePane } from '@/client/store/use-cases/panes/close-pane';
import { activateNode } from '@/client/store/use-cases/panes/activate-node';
import { submitQuestion } from '@/client/store/use-cases/questions/submit-question';
import GraphPaneHeader from './GraphPaneHeader';
import TreeView from './tree-view/TreeView';
import ChatView from './ChatView';
import InputBox from './InputBox';
import { useEffect } from 'react';

interface GraphPaneProps {
    paneId: string;
    isFocused: boolean;
}

export default function GraphPane({ paneId, isFocused }: GraphPaneProps) {
    const dispatch = useAppDispatch();
    const pane = useAppSelector((state) => paneSelectors.selectById(state, paneId));

    const {
        scrollToElement: scrollToNode,
        visibleElementIds: visibleNodeIds,
        registerElementRef,
        containerRef,
        contentRef,
    } = useScroll();

    const graphId = pane.graphId;
    const graph = useAppSelector((state) =>
        graphId ? graphSelectors.selectById(state, graphId) : null
    );
    const nodes = useAppSelector((state) => (graphId ? selectNodesByGraphId(graphId)(state) : []));
    const edges = useAppSelector((state) => (graphId ? selectEdgesByGraphId(graphId)(state) : []));
    const activeNodes = useAppSelector((state) =>
        pane.activeNodeIds.map((id) => nodeSelectors.selectById(state, id)).filter(Boolean)
    );
    const headNode = useAppSelector((state) =>
        pane.headNodeId ? nodeSelectors.selectById(state, pane.headNodeId) : null
    );
    const inputText = useAppSelector(
        (state) => paneSelectors.selectById(state, paneId)?.inputText ?? ''
    );

    useEffect(() => {
        if (!pane.headNodeId) return;
        scrollToNode(pane.headNodeId, {
            behavior: 'auto',
            align: false,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handlePaneClick = () => {
        dispatch(setFocusedPaneId({ paneId }));
    };

    const handleSetHeadNode = (nodeId: string) => {
        dispatch(updatePane({ paneId, data: { headNodeId: nodeId } }));
    };

    const handleActivateNode = async (nodeId: string) => {
        dispatch(activateNode(paneId, nodeId));
        scrollToNode(nodeId, {
            behavior: 'smooth',
            align: false,
        });
    };

    const handleOpenPaneWithNode = (nodeId: string) => {
        dispatch(setFocusedPaneId({ paneId }));
        dispatch(
            openPane(
                { graphId, headNodeId: nodeId },
                true // forceAdd
            )
        );
    };

    const handleInputChange = (value: string) => {
        dispatch(updatePane({ paneId, data: { inputText: value } }));
    };

    const handleSubmit = async (question: string) => {
        const { questionNodeId } = await dispatch(submitQuestion(paneId, question));
        dispatch(updatePane({ paneId, data: { inputText: '' } }));

        scrollToNode(questionNodeId, {
            behavior: 'smooth',
            align: true,
        });
    };

    const handleClose = () => {
        dispatch(closePane(paneId));
    };

    // graphがないか、headNodeがないか、headNodeのstatusがcompletedの場合に送信可能
    const canSubmit = !graphId || !headNode || headNode.status === 'completed';

    return (
        <div
            className="flex flex-col w-full h-full divide-y divide-border-muted overflow-hidden"
            onClick={handlePaneClick}
        >
            <GraphPaneHeader
                graphTitle={graph?.title ?? null}
                model="GPT4.1"
                provider="OpenAI"
                isFocused={isFocused}
                onClose={handleClose}
            />

            <div className="flex-1 flex overflow-hidden">
                <div className="w-64 h-full">
                    {graphId && (
                        <TreeView
                            nodes={nodes}
                            edges={edges}
                            headNodeId={pane.headNodeId}
                            activeNodeIds={pane.activeNodeIds}
                            visibleNodeIds={visibleNodeIds}
                            onSetHeadNode={handleSetHeadNode}
                            onActivateNode={handleActivateNode}
                            onOpenPaneWithNode={handleOpenPaneWithNode}
                        />
                    )}
                </div>

                <div className="flex-1 h-full flex flex-col items-center overflow-hidden">
                    <div className="relative flex-1 w-full max-w-4xl overflow-hidden">
                        <ChatView
                            activeNodes={activeNodes}
                            headNodeId={pane.headNodeId}
                            onSetHeadNode={handleSetHeadNode}
                            registerElementRef={registerElementRef}
                            containerRef={containerRef}
                            contentRef={contentRef}
                        />
                        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-linear-to-b from-transparent to-bg" />
                    </div>

                    <div className="w-full max-w-3xl">
                        <InputBox
                            value={inputText}
                            onChange={handleInputChange}
                            onSubmit={handleSubmit}
                            canSubmit={canSubmit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
