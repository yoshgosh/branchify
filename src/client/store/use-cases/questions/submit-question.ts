import { AppThunk } from "@/client/store/store";
import { paneSelectors } from "@/client/store/features/panes/selectors";
import { updatePane } from "@/client/store/features/panes/slice";
import { activateNode } from "../panes/activate-node";
import {
    HumanMessage,
    AIMessageChunk,
    AIMessage,
} from "@langchain/core/messages";
import { mapStoredMessagesToChatMessages } from "@langchain/core/messages";
import {
    createGraphThunk,
    generateGraphTitleThunk,
} from "@/client/store/features/graphs/thunks";
import {
    createNodeThunk,
    generateNodeTitleThunk,
} from "@/client/store/features/nodes/thunks";
import {
    setNodeMessage,
    setNodeStatus,
} from "@/client/store/features/nodes/slice";
import { generateAnswerMessage } from "@/client/services/nodes/service";

export const submitQuestion =
    (
        paneId: string,
        question: string
    ): AppThunk<Promise<{ questionNodeId: string; answerNodeId: string }>> =>
    async (dispatch, getState) => {
        const state = getState();
        const pane = paneSelectors.selectById(state, paneId);
        if (!pane) throw new Error(`Pane not found: ${paneId}`);

        // graph 未設定なら作成して pane に紐づける
        let graphId = pane.graphId;
        let headNodeId = pane.headNodeId;
        let activeNodeIds = pane.activeNodeIds;

        if (!graphId) {
            const createGraphRes = await dispatch(createGraphThunk()).unwrap();
            const graph = createGraphRes.graph;
            graphId = graph.graphId;
            // 防御的ガード
            headNodeId = null;
            activeNodeIds = [];

            dispatch(
                updatePane({
                    paneId,
                    data: { graphId, headNodeId, activeNodeIds },
                })
            );

            dispatch(generateGraphTitleThunk({ graphId }));
        }

        // 質問 node を作成し、pane.headNodeId を更新
        // TODO: paneData の headNodeId と graphId に矛盾がないか確認する
        const questionNodeRes = await dispatch(
            createNodeThunk({
                data: {
                    graphId,
                    type: "question",
                    status: "completed",
                    message: new HumanMessage({ content: question }),
                },
                parentIds: headNodeId ? [headNodeId] : [],
            })
        ).unwrap();
        const questionNode = questionNodeRes.node;

        dispatch(
            updatePane({
                paneId,
                data: { headNodeId: questionNode.nodeId },
            })
        );

        // タイトルを非同期で生成
        (async () => {
            await dispatch(
                generateNodeTitleThunk({
                    nodeId: questionNode.nodeId,
                })
            );
            dispatch(generateGraphTitleThunk({ graphId }));
        })();

        // 回答 node を作成し、pane.headNodeId を更新
        const answerNodeRes = await dispatch(
            createNodeThunk({
                data: {
                    graphId,
                    type: "answer",
                    status: "pending",
                },
                parentIds: [questionNode.nodeId],
            })
        ).unwrap();

        const answerNode = answerNodeRes.node;

        dispatch(
            updatePane({
                paneId,
                data: { headNodeId: answerNode.nodeId },
            })
        );

        // 作成された answerNode を activate
        dispatch(activateNode(paneId, answerNode.nodeId));

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

        dispatch(
            setNodeStatus({
                nodeId,
                status: "in_progress",
            })
        );

        let mergedChunk: AIMessageChunk | undefined;
        const controller = generateAnswerMessage(
            { nodeId },
            {
                onMessage: (data) => {
                    let chunk: AIMessageChunk;
                    chunk = new AIMessageChunk((data as any).kwargs);
                    mergedChunk = mergedChunk
                        ? mergedChunk.concat(chunk)
                        : chunk;

                    console.log(
                        "[streamAnswer] merged content:",
                        typeof mergedChunk.content === "string"
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
                    console.error("streamAnswer error:", err);
                    dispatch(
                        setNodeStatus({
                            nodeId,
                            status: "failed",
                        })
                    );
                },
                onEnd: () => {
                    console.log("[streamAnswer] stream ended");
                    dispatch(
                        setNodeStatus({
                            nodeId,
                            status: "completed",
                        })
                    );
                    // TODO: 将来的に getNodeThunk を dispatch して最新化する
                },
            }
        );
        return controller;
    };
