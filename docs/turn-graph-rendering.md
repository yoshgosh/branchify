# TurnGraph 描画ロジックの全体像

このドキュメントは、`GraphPane` 内で表示される `TurnGraph` の描画ロジックについて、どのレイヤーのコンポーネントが存在し、どこで分岐しているか、どこが今後分岐しうるかを整理するためのものです。

## 0. 最短で見る階層サマリ

まずは、描画ロジック全体を「上から下へ」だけで見ると次の構造です。

```text
1. GraphPane
   - 状態を集める
   - TreeView に渡す

2. TreeView
   - turn graph を作る
   - レイアウト方式を選ぶ
   - 描画コンポーネントを選ぶ

3. buildTurnGraph
   - Node / Edge を TurnNode / TurnEdge に変換する

4. positionTurnGraph* 
   - TurnNode / TurnEdge に座標と接続情報を付ける

5. TurnGraph*
   - ReactFlow 用の nodes / edges に変換する
   - ReactFlow に渡す

6. TurnNode / TurnEdge
   - ノード1個、エッジ1本の見た目を描く
```

現状の分岐は、シンプルに言うと次の 3 段です。

```text
TreeView
  -> positionTurnGraph or positionTurnGraphRT
  -> TurnGraph or TurnGraphRT
  -> 各 createReactFlowElements / TurnNode / TurnEdge
```

つまり、今の `layoutMode` は単なるレイアウト切り替えではなく、実際には次をまとめて切り替えています。

1. レイアウトアルゴリズム
2. ReactFlow 変換方法
3. ノード/エッジの見た目

### 0.1 現状シグネチャの階層

```text
GraphPane(props)
  -> TreeView(props)
    -> buildTurnGraph(nodes, edges, headNodeId, activeNodeIds, visibleNodeIds)
    -> positionTurnGraph(turnNodes, turnEdges) | positionTurnGraphRT(turnNodes, turnEdges)
    -> TurnGraph({ turnNodes, turnEdges, onTurnNodeClick })
       | TurnGraphRT({ turnNodes, turnEdges, onTurnNodeClick })
      -> createReactFlowElements(turnNodes, turnEdges, options?)
      -> TurnNode / TurnEdge
```

### 0.2 推奨シグネチャの階層

```text
GraphPane(props)
  -> TreeView({
       graph,
       selection,
       layoutMode,
       onLayoutModeChange,
       onTurnNodeSelect,
       onTurnNodeOpenInPane
     })
    -> buildTurnGraph({ nodes, edges, headNodeId, activeNodeIds, visibleNodeIds })
    -> strategy.layout(graph)
    -> TurnGraphRenderer({ graph: positionedGraph, strategy, onTurnNodeClick })
      -> createReactFlowElements({ graph, view: strategy.view })
      -> TurnNode / TurnEdge
```

### 0.3 どこで責務が切れるか

```text
アプリ層
  GraphPane
  TreeView の操作ハンドラ

描画用データ構築層
  buildTurnGraph

レイアウト層
  positionTurnGraph*
  または strategy.layout

描画アダプタ層
  TurnGraph*
  createReactFlowElements

見た目層
  TurnNode
  TurnEdge
```

この 4 ブロックを先に押さえると、下の詳細を読みやすくなります。

## 1. 全体フロー

現在の描画フローは、大きく次の 5 層に分かれています。

1. `GraphPane` が描画に必要な状態を集める
2. `TreeView` が turn graph 用の中間データを作る
3. `TreeView` がレイアウトアルゴリズムを選んで座標を付与する
4. `TurnGraph` 系コンポーネントが ReactFlow 用の要素に変換する
5. ReactFlow が `TurnNode` / `TurnEdge` を使って画面に描画する

流れを図にすると次の通りです。

```text
GraphPane
  -> TreeView
    -> buildTurnGraph
      -> turnNodes / turnEdges
    -> positionTurnGraph or positionTurnGraphRT
      -> x / y / handle 付き turnNodes / turnEdges
    -> TurnGraph or TurnGraphRT
      -> createReactFlowElements
        -> ReactFlow nodes / edges
      -> ReactFlow
        -> TurnNode / TurnEdge
```

## 2. レイヤーごとの責務

### 2.1 `GraphPane`

対象ファイル:

- `src/app/graph-page/graph-area/graph-pane/GraphPane.tsx`

責務:

- Redux から `nodes`, `edges`, `pane.headNodeId`, `pane.activeNodeIds` を取得する
- `useScroll` から `visibleNodeIds` を取得する
- `TreeView` に描画用の元データと操作コールバックを渡す

このレイヤーは「描画そのもの」ではなく、「描画に必要な状態の収集とイベント接続」を担当しています。

### 2.2 `TreeView`

対象ファイル:

- `src/app/graph-page/graph-area/graph-pane/tree-view/TreeView.tsx`

責務:

- 生の `nodes` / `edges` から turn graph を構築する
- レイアウトモードを `layoutMode` として持つ
- レイアウトアルゴリズムを選ぶ
- 描画コンポーネントを選ぶ
- ノードクリック時のアプリケーション動作を定義する

`TreeView` は現在、以下の 3 つの責務を同時に持っています。

1. データ変換
2. レイアウト戦略の選択
3. 描画コンポーネントの選択

今の「分岐が JSX に現れている」主な場所はここです。

### 2.3 `buildTurnGraph`

対象ファイル:

- `src/app/graph-page/graph-area/graph-pane/tree-view/libs/build-turn-graph.ts`
- `src/app/graph-page/graph-area/graph-pane/tree-view/models.ts`

責務:

- 通常の `Node[]` / `Edge[]` から `TurnNode[]` / `TurnEdge[]` を作る
- `question` ノードを起点に、次の `question` に当たるまでを 1 つの turn として束ねる
- `isHead`, `isActive`, `isVisible` を turn 単位に持ち上げる

この層は「何を描くか」を定義する層であり、「どこに描くか」はまだ決めません。

### 2.4 レイアウト関数

対象ファイル:

- `src/app/graph-page/graph-area/graph-pane/tree-view/libs/position-turn-graph.ts`
- `src/app/graph-page/graph-area/graph-pane/tree-view/libs/position-turn-graph-rt.ts`

責務:

- `turnNodes` に `x`, `y` を付与する
- `turnEdges` に `parentHandle`, `childHandle` を付与する

ここは「どこに描くか」を決める純粋な配置レイヤーです。

現在は 2 つのアルゴリズムがあります。

- `positionTurnGraph`
  - 既存の lane ベース配置
  - 親子の相対位置に応じてハンドル位置も変える
- `positionTurnGraphRT`
  - Reingold-Tilford 風の木配置
  - 親を上、子を下に置き、ハンドルは上下固定

### 2.5 描画アダプタ (`TurnGraph`, `TurnGraphRT`)

対象ファイル:

- `src/app/graph-page/graph-area/graph-pane/tree-view/turn-graph/TurnGraph.tsx`
- `src/app/graph-page/graph-area/graph-pane/tree-view/turn-graph-rt/TurnGraph.tsx`
- `src/app/graph-page/graph-area/graph-pane/tree-view/turn-graph/libs/create-react-flow-elements.ts`
- `src/app/graph-page/graph-area/graph-pane/tree-view/turn-graph-rt/libs/create-react-flow-elements.ts`

責務:

- `turnNodes` / `turnEdges` を ReactFlow の `nodes` / `edges` に変換する
- `nodeTypes`, `edgeTypes` を ReactFlow に登録する
- `onNodeClick` を ReactFlow のイベント形式からアプリ側の `TurnNode` へ変換する

重要なのは、このレイヤーが単なる表示コンポーネントではなく、実質的に「描画方式ごとのアダプタ」になっている点です。

現在の差分は主に次の通りです。

- `unitX`
  - `turn-graph`: `20`
  - `turn-graph-rt`: `30`
- edge 変換
  - `turn-graph`: `sourceHandle`, `targetHandle` を使う
  - `turn-graph-rt`: ハンドル指定を使わず中心接続に寄せている

つまり、現在の分岐はレイアウト関数だけではなく、ReactFlow 変換ルールにもまたがっています。

### 2.6 ReactFlow の見た目コンポーネント

対象ファイル:

- `src/app/graph-page/graph-area/graph-pane/tree-view/turn-graph/TurnNode.tsx`
- `src/app/graph-page/graph-area/graph-pane/tree-view/turn-graph/TurnEdge.tsx`
- `src/app/graph-page/graph-area/graph-pane/tree-view/turn-graph-rt/TurnNode.tsx`
- `src/app/graph-page/graph-area/graph-pane/tree-view/turn-graph-rt/TurnEdge.tsx`

責務:

- ノードの見た目を描く
- エッジの SVG パスを描く
- ハンドルの置き方や接続の見た目を調整する

現在の差分は次の通りです。

- `TurnNode`
  - `turn-graph` は複数ハンドルを右・上・下に持つ
  - `turn-graph-rt` は中心付近の非表示ハンドルで接続する
  - `turn-graph-rt` にはノード背面の背景円があり、エッジが裏を通っても見た目が崩れにくい
- `TurnEdge`
  - `turn-graph` は折れ線と角丸を使う
  - `turn-graph-rt` はシンプルな直線を使う

ここは「レイアウト差分が視覚表現に漏れている」層です。

## 3. 現在どこが分岐しているか

現在、描画ロジックの分岐は次の 3 箇所に存在します。

### 3.1 `TreeView.tsx` の分岐

`layoutMode` によって次を切り替えています。

- 実行するレイアウト関数
  - `positionTurnGraph`
  - `positionTurnGraphRT`
- 描画コンポーネント
  - `TurnGraph`
  - `TurnGraphRT`

ここが現在もっとも目立つ分岐です。

### 3.2 `create-react-flow-elements.ts` の分岐

ディレクトリ自体が分かれており、次のルールが別実装になっています。

- 座標スケールの変換方法
- edge をハンドルベースで接続するか
- edge を中心接続で扱うか

これは JSX 上の分岐ではありませんが、描画方式の分岐が実装構造として複製されている箇所です。

### 3.3 `TurnNode` / `TurnEdge` の分岐

見た目コンポーネントがディレクトリごと分かれています。

- ハンドル配置
- ノード背面処理
- エッジパス生成

この層も、描画方式ごとの差分を抱えています。

## 4. 今後分岐しうるポイント

今後責務を分けるなら、分岐しうるポイントは次の 5 つです。

### 4.1 グラフ構築ルール

`buildTurnGraph` は現在、以下を前提にしています。

- 分岐は `question` ノードでのみ発生する
- グラフは非巡回有向グラフ
- グラフは単純グラフ

将来的に、turn の切り方そのものを変えたい場合は、ここが分岐点になります。

### 4.2 レイアウトアルゴリズム

これは既に分岐しています。

候補:

- 既存 lane 方式
- Reingold-Tilford 風
- Dagre/ELK のような一般グラフレイアウト
- head node を基準にした局所レイアウト

### 4.3 ReactFlow 変換ポリシー

レイアウト結果を ReactFlow に載せる時点でも分岐がありえます。

候補:

- `unitX`, `unitY`
- edge の `sourceHandle` / `targetHandle` の有無
- zIndex ルール
- node の anchor の取り方

### 4.4 ノード/エッジの見た目

候補:

- 円形ノードか別の形か
- head node の強調方法
- 折れ線、直線、Bezier などの edge 表現
- エッジがノード背面を通る際の処理

### 4.5 インタラクション

現状のクリック処理は `TreeView` にあります。

- 通常クリックで `activate + head 更新`
- `meta/ctrl` クリックで別 pane を開く

将来的に hover, context menu, selection mode が増えると、この責務も別レイヤー化の対象になります。

## 5. 現在の構造を責務で言い換える

現状を責務ベースで整理すると、次のように言えます。

### 5.1 アプリケーション層

- `GraphPane.tsx`
- `TreeView.tsx` のクリックハンドラ部分

役割:

- 状態取得
- ユーザー操作と Redux の接続

### 5.2 ViewModel 生成層

- `build-turn-graph.ts`
- `models.ts`

役割:

- ドメインの `Node` / `Edge` を、描画単位の `TurnNode` / `TurnEdge` に変換する

### 5.3 レイアウト層

- `position-turn-graph.ts`
- `position-turn-graph-rt.ts`

役割:

- 描画単位に座標と接続位置を付与する

### 5.4 描画アダプタ層

- `TurnGraph.tsx`
- `TurnGraphRT.tsx`
- 各 `create-react-flow-elements.ts`

役割:

- 内部モデルを ReactFlow 仕様へ変換する

### 5.5 プリミティブ描画層

- 各 `TurnNode.tsx`
- 各 `TurnEdge.tsx`

役割:

- ノード 1 個、エッジ 1 本をどう見せるかを定義する

## 6. どこを 1 つにまとめやすいか

現状の実装を見る限り、最もまとめやすいのは次の層です。

### 6.1 `TurnGraph.tsx` と `TurnGraphRT.tsx`

この 2 つはほぼ同じです。

- ReactFlow の設定はほぼ共通
- 差分は主に ReactFlow 要素への変換ルール

つまり、ここは 1 コンポーネントに統一しやすいです。

### 6.2 `create-react-flow-elements.ts`

ここは分岐があるが、責務は明確です。

- 座標スケール
- ハンドルの扱い

このため、関数差し替えや設定オブジェクトで吸収しやすい層です。

## 7. どこは簡単にはまとめにくいか

### 7.1 `TurnEdge.tsx`

既存レイアウトと RT レイアウトでは、エッジの意味が少し違います。

- 既存レイアウトはハンドル前提で折れ線を描く
- RT レイアウトは中心接続で直線を描く

ここは単純統合すると条件分岐が増えやすく、無理に 1 ファイルに寄せると逆に見通しが悪くなる可能性があります。

### 7.2 `TurnNode.tsx`

ハンドル配置がレイアウト方針と結び付いています。

- 右/上/下ハンドルを持つか
- 中心ハンドルで足りるか

このため、ノードの見た目と接続方式をどこで分離するかを決めてから統合を考える方が安全です。

## 8. 現状のボトルネック

現在の実装で責務の境界が曖昧になっている主因は、`layoutMode` が 1 個の値で次の 3 種類の差分を同時に切り替えていることです。

1. レイアウトアルゴリズム
2. ReactFlow 変換ルール
3. ノード/エッジの見た目

つまり `layoutMode` は見た目のテーマではなく、実質的には「描画方式全体」を表しています。

このため、`TreeView` 上では単なるアルゴリズム切り替えに見えても、実際には描画パイプライン全体の分岐になっています。

## 9. 設計上の見方

現状の構造は、概念的には次のように理解すると整理しやすいです。

- `buildTurnGraph`
  - 何を描くかを決める
- `positionTurnGraph*`
  - どこに描くかを決める
- `createReactFlowElements`
  - ReactFlow にどう渡すかを決める
- `TurnNode` / `TurnEdge`
  - どう見せるかを決める

この 4 層に分けて考えると、現在の問題は「`TreeView` が後ろ 3 層の分岐を直接持っていること」と言えます。

## 10. まとめ

現状の描画ロジックは、次のレイヤーに分解して理解できます。

1. 状態収集: `GraphPane`
2. 描画用データ構築: `buildTurnGraph`
3. レイアウト: `positionTurnGraph*`
4. ReactFlow 変換: `TurnGraph*` + `createReactFlowElements`
5. プリミティブ描画: `TurnNode` / `TurnEdge`

そして、現在分岐しているのは主に次の 3 点です。

1. `TreeView` 上のレイアウト関数選択
2. ReactFlow 要素変換ルール
3. ノード/エッジの見た目

この整理を前提にすると、今後責務分離を進める際は、「レイアウトだけを差し替える」のか、「描画方式全体を差し替える」のかをまず明確にする必要があります。

## 11. 現状の主要シグネチャ

ここでは、現在の描画ロジックで中心になっているコンポーネントとメソッドのシグネチャを抜き出します。

### 11.1 モデル

```ts
export type TurnNode = {
  turnNodeId: string;
  nodes: Node[];
  x?: number;
  y?: number;
  isHead?: boolean;
  isActive?: boolean;
  isVisible?: boolean;
};

export type HandleType = 'top' | 'bottom' | 'left' | 'right';

export type TurnEdge = {
  turnEdgeId: string;
  parentId: string;
  childId: string;
  parentHandle?: HandleType;
  childHandle?: HandleType;
  isActive?: boolean;
  isVisible?: boolean;
};
```

特徴:

- `x`, `y`, `parentHandle`, `childHandle` が optional で、構築前後の状態を同じ型で表している
- turn graph の素データと、レイアウト済みデータの境界が型上は分かれていない

### 11.2 `GraphPane`

```ts
interface GraphPaneProps {
  paneId: string;
  isFocused: boolean;
}

export default function GraphPane({ paneId, isFocused }: GraphPaneProps)
```

役割:

- Redux から描画元データを集めて `TreeView` へ渡す

### 11.3 `TreeView`

```ts
type LayoutMode = 'optimized' | 'rt';

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

export default function TreeView(props: TreeViewProps)
```

内部メソッド:

```ts
const handleTurnNodeClick = async (
  event: React.MouseEvent,
  turnNode: TurnNode
) => Promise<void>
```

特徴:

- 生の `nodes` / `edges` を直接受ける
- 描画方式選択、レイアウト選択、クリック動作が同居している
- `React.MouseEvent` がアプリ側のユースケース選択にまで漏れている

### 11.4 turn graph 構築

```ts
export const buildTurnGraph = (
  nodes: Node[],
  edges: Edge[],
  headNodeId: string | null,
  activeNodeIds: string[],
  visibleNodeIds: string[]
): { turnNodes: TurnNode[]; turnEdges: TurnEdge[] }
```

特徴:

- 位置引数が多い
- 描画状態もまとめて入力している

### 11.5 レイアウト

```ts
export const positionTurnGraph = (
  turnNodes: TurnNode[],
  turnEdges: TurnEdge[]
): void

export const positionTurnGraphRT = (
  turnNodes: TurnNode[],
  turnEdges: TurnEdge[]
): void
```

特徴:

- 返り値はなく、引数を破壊的に更新する
- どの描画方式向けのレイアウト結果なのかが型に出ていない

### 11.6 描画アダプタ

```ts
interface TurnGraphProps {
  turnNodes: TurnNode[];
  turnEdges: TurnEdge[];
  onTurnNodeClick: (event: React.MouseEvent, turnNode: TurnNode) => void;
}

export default function TurnGraph(props: TurnGraphProps)

interface TurnGraphRTProps {
  turnNodes: TurnNode[];
  turnEdges: TurnEdge[];
  onTurnNodeClick: (event: React.MouseEvent, turnNode: TurnNode) => void;
}

export default function TurnGraphRT(props: TurnGraphRTProps)
```

特徴:

- ほぼ同一シグネチャのコンポーネントが 2 つある
- 差分は props ではなく、内部依存先に埋まっている

### 11.7 ReactFlow 要素変換

```ts
export const createReactFlowElements = (
  turnNodes: TurnNode[],
  turnEdges: TurnEdge[],
  options: {
    unitX: number;
    unitY: number;
  } = {
    unitX: 20,
    unitY: 40,
  }
): {
  nodes: ReactFlowNode<TurnNode>[];
  edges: ReactFlowEdge<TurnEdge>[];
}
```

RT 側:

```ts
export const createReactFlowElements = (
  turnNodes: TurnNode[],
  turnEdges: TurnEdge[],
  options: {
    unitX: number;
    unitY: number;
  } = {
    unitX: 30,
    unitY: 40,
  }
): {
  nodes: ReactFlowNode<TurnNode>[];
  edges: ReactFlowEdge<TurnEdge>[];
}
```

特徴:

- 名前と大枠の型は同じだが、内部ポリシーが別
- `sourceHandle` / `targetHandle` を使うかどうかが隠れた差分になっている

## 12. 推奨シグネチャ

ここでは、責務を分離しやすくするための推奨シグネチャを示します。意図は次の 3 点です。

1. 生データ、レイアウト済みデータ、描画ポリシーを型で分ける
2. 破壊的更新をやめて、レイアウト結果を返す
3. JSX の分岐ではなく、strategy オブジェクトに分岐を集約する

### 12.1 推奨モデル

```ts
type TurnGraphData = {
  turnNodes: TurnNode[];
  turnEdges: TurnEdge[];
};

type PositionedTurnNode = TurnNode & {
  x: number;
  y: number;
};

type PositionedTurnEdge = TurnEdge & {
  parentHandle?: HandleType;
  childHandle?: HandleType;
};

type PositionedTurnGraph = {
  turnNodes: PositionedTurnNode[];
  turnEdges: PositionedTurnEdge[];
};
```

意図:

- レイアウト前後を型で区別する
- `x`, `y` が必要な層では optional を減らす

### 12.2 `TreeView` の推奨シグネチャ

```ts
type LayoutMode = 'optimized' | 'rt';

interface TreeViewProps {
  graph: {
    nodes: Node[];
    edges: Edge[];
  };
  selection: {
    headNodeId: string | null;
    activeNodeIds: string[];
    visibleNodeIds: string[];
  };
  layoutMode: LayoutMode;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onTurnNodeSelect: (nodeId: string) => Promise<void>;
  onTurnNodeOpenInPane: (nodeId: string) => void;
}

export default function TreeView(props: TreeViewProps)
```

意図:

- 入力を `graph` と `selection` にまとめ、責務のまとまりを明示する
- レイアウト状態を外へ出し、必要なら永続化可能にする
- click event そのものではなく、解決済みの `nodeId` を渡す

### 12.3 turn graph 構築の推奨シグネチャ

```ts
type BuildTurnGraphParams = {
  nodes: Node[];
  edges: Edge[];
  headNodeId: string | null;
  activeNodeIds: string[];
  visibleNodeIds: string[];
};

export const buildTurnGraph = (
  params: BuildTurnGraphParams
): TurnGraphData
```

意図:

- 位置引数をやめる
- `buildTurnGraph` の入力責務をひと目で読めるようにする

### 12.4 レイアウト戦略の推奨シグネチャ

```ts
type TurnGraphLayoutStrategy = {
  id: LayoutMode;
  layout: (graph: TurnGraphData) => PositionedTurnGraph;
  view: {
    unitX: number;
    unitY: number;
    useHandles: boolean;
  };
};
```

各レイアウト実装:

```ts
export const optimizedLayoutStrategy: TurnGraphLayoutStrategy
export const rtLayoutStrategy: TurnGraphLayoutStrategy
```

または、関数だけに絞るなら:

```ts
type LayoutTurnGraph = (graph: TurnGraphData) => PositionedTurnGraph
```

意図:

- レイアウトアルゴリズムと描画変換ポリシーを同じ strategy に閉じ込める
- `TreeView` から `if (layoutMode === ...)` を追い出しやすくする

### 12.5 描画アダプタの推奨シグネチャ

```ts
interface TurnGraphRendererProps {
  graph: PositionedTurnGraph;
  strategy: TurnGraphLayoutStrategy;
  onTurnNodeClick: (turnNode: PositionedTurnNode) => void;
}

export function TurnGraphRenderer(props: TurnGraphRendererProps)
```

意図:

- `TurnGraph` と `TurnGraphRT` を 1 つに統一する
- クリックハンドラから UI イベント型を外す
- 差分は `strategy` に寄せる

### 12.6 ReactFlow 要素変換の推奨シグネチャ

```ts
type ReactFlowElements = {
  nodes: ReactFlowNode<PositionedTurnNode>[];
  edges: ReactFlowEdge<PositionedTurnEdge>[];
};

type CreateReactFlowElementsParams = {
  graph: PositionedTurnGraph;
  view: {
    unitX: number;
    unitY: number;
    useHandles: boolean;
  };
};

export const createReactFlowElements = (
  params: CreateReactFlowElementsParams
): ReactFlowElements
```

意図:

- `unitX`, `unitY`, handle 利用有無を strategy から受ける
- 関数名は 1 つのまま、ポリシーだけ差し替えられるようにする

### 12.7 見た目コンポーネントの推奨シグネチャ

分けたままにするなら、最低限 props の意味を揃えるのがよいです。

```ts
export function TurnNode(props: NodeProps<PositionedTurnNode>)

export function TurnEdge(props: EdgeProps<PositionedTurnEdge>)
```

さらに統一したい場合は、見た目ポリシーを外出しできます。

```ts
type TurnGraphVisualStyle = {
  edgeStyle: 'orthogonal' | 'straight';
  nodeHandleMode: 'multi' | 'center';
};
```

ただし、この層は差分が視覚的に大きいため、早い段階では無理に 1 ファイルへ統合しない方が安全です。

## 13. シグネチャ変更の要点

推奨シグネチャの意図を一言でまとめると次の通りです。

- `buildTurnGraph` は「生グラフから turn graph を作る関数」に限定する
- `layout` は「turn graph を受けて、レイアウト済み graph を返す関数」にする
- `renderer` は「strategy と graph を受けて描画するコンポーネント」にする
- UI イベント型はなるべく描画層で閉じ、アプリ層には `nodeId` や `turnNode` を渡す

この分離により、現状 1 つの `layoutMode` がまとめて背負っている次の差分を、個別の責務として扱えるようになります。

1. レイアウトアルゴリズム
2. ReactFlow 変換ポリシー
3. ノード/エッジの視覚表現
