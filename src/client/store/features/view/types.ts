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

export type ViewState = {
    activeGraphId: string | null;
    entries: Record<string, ViewEntry>;
    newEntry: ViewEntry;
};
