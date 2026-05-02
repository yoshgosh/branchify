// headNodeId / activeNodeIds は、graphId の graph に属する node の id であることを use-cases で保証する
// graphId が存在しても headNodeId / activeNodeIds が null / 空配列であることは正常な状態
export interface ViewEntry {
    headNodeId: string | null;
    activeNodeIds: string[];
    inputText: string;
}

export const createDefaultViewEntry = (): ViewEntry => ({
    headNodeId: null,
    activeNodeIds: [],
    inputText: '',
});

export interface ViewState {
    activeGraphId: string | null;
    entries: Record<string, ViewEntry>;
    newEntry: ViewEntry;
}
