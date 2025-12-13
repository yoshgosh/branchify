import type { TX } from "@/server/db/types";
import * as EdgeRepo from "@/server/repositories/edges/repository";
import * as NodeRepo from "@/server/repositories/nodes/repository";
import type { Node } from "@/shared/entities/node";

const DEFAULT_MAX_DEPTH = 10;

/**
 * 指定したノードから親方向へ辿り、ルートに至るまでのノード列を返す。
 *
 * 前提:
 * - グラフは非巡回・単一始点・単純グラフ
 * - edgeは (parent_id, child_id) で一意
 *
 * 挙動:
 * - 親が存在しない場合 → ルート到達で終了
 * - 複数親が存在する場合 → 分岐検出で終了
 * - maxDepthを超えた場合 → 探索停止（安全装置）
 *
 * @param tx - トランザクションコンテキスト
 * @param startNodeId - 開始ノードID
 * @param options.maxDepth - 最大探索深さ（デフォルト10）
 * @returns ルートから開始ノードまでのNode配列（ルート順）
 */
export async function collectContextNodes(
    tx: TX,
    startNodeId: string,
    options?: { maxDepth?: number }
): Promise<Node[]> {
    const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
    const result: Node[] = [];

    let currentId: string | null = startNodeId;
    let depth = 0;

    while (currentId && depth < maxDepth) {
        const node = await NodeRepo.findById(tx, currentId);
        if (!node) break;

        result.push(node);

        const parents = await EdgeRepo.findParents(tx, currentId);
        if (parents.length === 0) break; // ルート到達
        if (parents.length > 1) break; // 分岐ノード検出

        currentId = parents[0].parentId;
        depth++;
    }

    // ルート→開始ノードの順に並べる
    return result.reverse();
}
