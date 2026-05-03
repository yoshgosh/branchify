export type ViewEntry = {
    headNodeId: string | null;
    activeNodeIds: string[];
    inputText: string;
};

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
