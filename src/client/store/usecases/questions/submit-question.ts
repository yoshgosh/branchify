import { AppThunk } from '@/client/store/store';
import { selectActiveViewEntry, selectActiveGraphId } from '@/client/store/features/view/selectors';
import { updateEntry, promoteNewEntry } from '@/client/store/features/view/slice';
import { activateNode } from '../view/activate-node';
import { HumanMessage, AIMessageChunk } from '@langchain/core/messages';
import { createGraphThunk, generateGraphTitleThunk } from '@/client/store/features/graphs/thunks';
import { createNodeThunk, generateNodeTitleThunk } from '@/client/store/features/nodes/thunks';
import { setNodeMessage, setNodeStatus } from '@/client/store/features/nodes/slice';
import { generateAnswerMessage } from '@/client/services/nodes/service';

export const submitQuestion =
    (question: string): AppThunk<Promise<{ questionNodeId: string; answerNodeId: string }>> =>
    async (dispatch, getState) => {
        const entry = selectActiveViewEntry(getState());

        // graph 未設定なら作成して entry に紐付ける
        let graphId = selectActiveGraphId(getState());
        let headNodeId = entry.headNodeId;
        let isFirstQuestion = false;

        if (!graphId) {
            const createGraphRes = await dispatch(createGraphThunk()).unwrap();
            const graph = createGraphRes.graph;
            graphId = graph.graphId;
            headNodeId = null;
            isFirstQuestion = true;

            dispatch(promoteNewEntry({ graphId }));
        }

        // 質問 node を作成し、headNodeId を更新
        const questionNodeRes = await dispatch(
            createNodeThunk({
                data: {
                    graphId,
                    type: 'question',
                    status: 'completed',
                    message: new HumanMessage({ content: question }),
                },
                parentIds: headNodeId ? [headNodeId] : [],
            })
        ).unwrap();
        const questionNode = questionNodeRes.node;

        dispatch(updateEntry({ graphId, data: { headNodeId: questionNode.nodeId } }));

        // nodeTitle は毎回生成。初回質問のみ、nodeTitle 生成後にグラフタイトルも更新
        (async () => {
            await dispatch(
                generateNodeTitleThunk({
                    nodeId: questionNode.nodeId,
                })
            );
            if (isFirstQuestion) {
                dispatch(generateGraphTitleThunk({ graphId }));
            }
        })();

        // 回答 node を作成し、headNodeId を更新
        const answerNodeRes = await dispatch(
            createNodeThunk({
                data: {
                    graphId,
                    type: 'answer',
                    status: 'pending',
                },
                parentIds: [questionNode.nodeId],
            })
        ).unwrap();

        const answerNode = answerNodeRes.node;

        dispatch(updateEntry({ graphId, data: { headNodeId: answerNode.nodeId } }));

        // 作成された answerNode を activate
        dispatch(activateNode(answerNode.nodeId));

        // 回答ストリームを受け取りながら、node.status / node.message を FE で更新
        dispatch(
            streamAnswer({
                nodeId: answerNode.nodeId,
            })
        );

        // 作成された questionNode と answerNode の nodeId を返す
        return {
            questionNodeId: questionNode.nodeId,
            answerNodeId: answerNode.nodeId,
        };
    };

export const streamAnswer =
    (params: { nodeId: string }): AppThunk<{ close: () => void }> =>
    (dispatch, _getState) => {
        const { nodeId } = params;
        const hasKwargs = (value: unknown): value is { kwargs: Record<string, unknown> } =>
            typeof value === 'object' && value !== null && 'kwargs' in value;

        dispatch(
            setNodeStatus({
                nodeId,
                status: 'in_progress',
            })
        );

        let mergedChunk: AIMessageChunk | undefined;
        const controller = generateAnswerMessage(
            { nodeId },
            {
                onMessage: (data) => {
                    let chunk: AIMessageChunk;
                    chunk = new AIMessageChunk(hasKwargs(data) ? data.kwargs : {});
                    mergedChunk = mergedChunk ? mergedChunk.concat(chunk) : chunk;

                    console.log(
                        '[streamAnswer] merged content:',
                        typeof mergedChunk.content === 'string'
                            ? mergedChunk.content
                            : JSON.stringify(mergedChunk.content)
                    );

                    dispatch(
                        setNodeMessage({
                            nodeId,
                            message: mergedChunk,
                        })
                    );
                },
                onError: (err) => {
                    console.error('streamAnswer error:', err);
                    dispatch(
                        setNodeStatus({
                            nodeId,
                            status: 'failed',
                        })
                    );
                },
                onEnd: () => {
                    console.log('[streamAnswer] stream ended');
                    dispatch(
                        setNodeStatus({
                            nodeId,
                            status: 'completed',
                        })
                    );
                    // TODO: 将来的に getNodeThunk を dispatch して最新化する
                },
            }
        );
        return controller;
    };
