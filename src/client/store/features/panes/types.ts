// headNodeId / activeNodeIds は、 null または graphId の graph に属する node の id　であることを usecases で保証する
// graphId が null でなくとも、 headNodeId / activeNodeIds が null または空配列であることは正常な状態である
// activeNodesIds はUIからのみ変更、参照される（将来的に移動される可能性がある）
export type Pane = {
    paneId: string;
    graphId: string | null;
    headNodeId: string | null;
    activeNodeIds: string[];
    inputText: string;
};

export const getDefaultPaneData = (): Omit<Pane, 'paneId'> => ({
    graphId: null,
    headNodeId: null,
    activeNodeIds: [],
    inputText: '',
});
