import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { nodeAdapter } from './adapter';
import {
    listNodesThunk,
    createNodeThunk,
    updateNodeThunk,
    removeNodeThunk,
    generateNodeTitleThunk,
} from './thunks';
import { NodeStatus, Message } from '@/shared/entities/node';

interface NodeState extends ReturnType<typeof nodeAdapter.getInitialState> {}

export const initialNodeState: NodeState = nodeAdapter.getInitialState();

const node = createSlice({
    name: 'node',
    initialState: initialNodeState,
    reducers: {
        // ストリームAPIが開始と受信で分かれておらず、statusのBEとの同期ができないため、FEで管理している
        setNodeStatus: (
            state,
            action: PayloadAction<{
                nodeId: string;
                status: NodeStatus;
            }>
        ) => {
            const { nodeId, status } = action.payload;
            const node = state.entities[nodeId];
            if (node) {
                node.status = status;
            }
        },

        // 暫定messageと確定messageは別で管理するべきだが、過剰実装になるため暫定的に同一プロパティで管理する
        setNodeMessage: (
            state,
            action: PayloadAction<{
                nodeId: string;
                message?: Message;
            }>
        ) => {
            const { nodeId, message } = action.payload;
            const node = state.entities[nodeId];
            if (node) {
                node.message = message;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(listNodesThunk.fulfilled, (state, action) => {
                nodeAdapter.upsertMany(state, action.payload.nodes);
            })

            .addCase(createNodeThunk.fulfilled, (state, action) => {
                nodeAdapter.upsertOne(state, action.payload.node);
            })

            .addCase(updateNodeThunk.fulfilled, (state, action) => {
                nodeAdapter.upsertOne(state, action.payload.node);
            })

            .addCase(removeNodeThunk.fulfilled, (state, action) => {
                const node = action.payload.node;
                if (node) {
                    nodeAdapter.removeOne(state, node.nodeId);
                }
            })

            .addCase(generateNodeTitleThunk.fulfilled, (state, action) => {
                nodeAdapter.upsertOne(state, action.payload.node);
            });
    },
});

export const { setNodeStatus, setNodeMessage } = node.actions;

export default node.reducer;
