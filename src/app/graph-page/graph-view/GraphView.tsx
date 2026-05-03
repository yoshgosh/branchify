'use client';

import { useAppDispatch, useAppSelector } from '@/client/store/store';
import { selectActiveViewEntry } from '@/client/store/features/view/selectors';
import { updateEntry } from '@/client/store/features/view/slice';
import { updateActiveView } from '@/client/store/usecases/view/update-active-view';
import { selectNodesByGraphId, nodeSelectors } from '@/client/store/features/nodes/selectors';
import { selectEdgesByGraphId } from '@/client/store/features/edges/selectors';
import { graphSelectors } from '@/client/store/features/graphs/selectors';
import { useScroll } from '@/app/hooks/useScroll';
import { activateNode } from '@/client/store/usecases/view/activate-node';
import { submitQuestion } from '@/client/store/usecases/questions/submit-question';
import GraphViewHeader from './GraphViewHeader';
import TreeView from './tree-view/TreeView';
import ChatView from './chat-view/ChatView';
import InputBox from './InputBox';
import { useEffect } from 'react';

interface GraphViewProps {
    graphId: string | null;
}

export default function GraphView({ graphId }: GraphViewProps) {
    const dispatch = useAppDispatch();
    const entry = useAppSelector(selectActiveViewEntry);

    const {
        scrollToElement: scrollToNode,
        visibleElementIds: visibleNodeIds,
        registerElementRef,
        containerRef,
        contentRef,
    } = useScroll();

    const graph = useAppSelector((state) =>
        graphId ? graphSelectors.selectById(state, graphId) : null
    );
    const nodes = useAppSelector((state) => (graphId ? selectNodesByGraphId(graphId)(state) : []));
    const edges = useAppSelector((state) => (graphId ? selectEdgesByGraphId(graphId)(state) : []));

    const headNode = useAppSelector((state) =>
        entry.headNodeId ? nodeSelectors.selectById(state, entry.headNodeId) : null
    );

    useEffect(() => {
        if (!entry.headNodeId) return;
        scrollToNode(entry.headNodeId, {
            behavior: 'auto',
            align: false,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSetHeadNode = (nodeId: string) => {
        if (!graphId) return;
        dispatch(updateEntry({ graphId, data: { headNodeId: nodeId } }));
    };

    const handleActivateNode = async (nodeId: string) => {
        dispatch(activateNode(nodeId));
        scrollToNode(nodeId, {
            behavior: 'smooth',
            align: false,
        });
    };

    const handleInputChange = (value: string) => {
        dispatch(updateActiveView({ inputText: value }));
    };

    const handleSubmit = async (question: string) => {
        dispatch(updateActiveView({ inputText: '' }));
        const { questionNodeId } = await dispatch(submitQuestion(question));

        scrollToNode(questionNodeId, {
            behavior: 'smooth',
            align: true,
        });
    };

    const canSubmit = !graphId || !headNode || headNode.status === 'completed';

    return (
        <div className="flex-1 flex flex-col w-full h-full divide-y divide-base-3 overflow-hidden">
            <GraphViewHeader
                graphTitle={graph?.title ?? null}
                model="GPT4.1"
                provider="OpenAI"
            />

            <div className="flex-1 flex overflow-hidden">
                <div className="w-64 h-full">
                    {graphId && (
                        <TreeView
                            nodes={nodes}
                            edges={edges}
                            headNodeId={entry.headNodeId}
                            activeNodeIds={entry.activeNodeIds}
                            visibleNodeIds={visibleNodeIds}
                            onSetHeadNode={handleSetHeadNode}
                            onActivateNode={handleActivateNode}
                        />
                    )}
                </div>

                <div className="flex-1 h-full flex flex-col items-center overflow-hidden">
                    <div className="relative flex-1 w-full max-w-4xl overflow-hidden">
                        <ChatView
                            activeNodeIds={entry.activeNodeIds}
                            headNodeId={entry.headNodeId}
                            onSetHeadNode={handleSetHeadNode}
                            registerElementRef={registerElementRef}
                            containerRef={containerRef}
                            contentRef={contentRef}
                        />
                        <div className="pointer-events-none absolute bottom-0 left-0 w-full h-8 bg-linear-to-b from-transparent to-base-0" />
                    </div>

                    <div className="w-full max-w-3xl">
                        <InputBox
                            value={entry.inputText}
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
