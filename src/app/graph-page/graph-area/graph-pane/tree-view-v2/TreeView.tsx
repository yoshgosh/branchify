import { Node } from '@/shared/entities/node';
import { Edge } from '@/shared/entities/edge';

interface TreeViewProps {
    nodes: Node[];
    edges: Edge[];
    headNodeId: string | null;
    activeNodeIds: string[];
    visibleNodeIds: string[];
    onSetHeadNode: (nodeId: string) => void;
    onActivateNode: (nodeId: string) => Promise<void>;
    onOpenPaneWithNode: (nodeId: string) => void;
}

export default function TreeView({
    nodes,
    edges,
    headNodeId,
    activeNodeIds,
    visibleNodeIds,
    onSetHeadNode,
    onActivateNode,
    onOpenPaneWithNode,
}: TreeViewProps) {
    // TODO: Implement
    return <div>TreeView v2</div>;
}
