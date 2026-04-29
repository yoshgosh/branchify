# Branchify 公開プラン

## 決定事項

| 項目 | 決定内容 |
|---|---|
| デプロイ先 | Vercel |
| DB | Neon (PostgreSQL) |
| 認証 | Auth.js v5 + Google OAuth (JWT) |
| Google OAuth 公開 | 基本スコープのみ（審査不要で本番公開可） |
| APIキー管理 | `users.openai_api_key` カラム（管理者がDB直接登録） |
| APIキー取得タイミング | LLM呼び出し時のみDBから取得 |
| APIキー未登録時 | エラーメッセージ表示 |
| アクセス制御 | Googleアカウント全許可 |
| APIルート | middleware で保護（未認証リクエストを拒否） |
| ログイン画面 | 最低限（ロゴ＋Googleログインボタン） |
| ローカル開発 | Google OAuthを使用（localhost をリダイレクトURIに追加） |
| 既存データ | 破棄 |

---

## フェーズ1: DBスキーマ変更

### 1-1. `users` テーブル改修

```diff
 users:
   userId (UUID, PK, default gen_random_uuid())
   name (text, NOT NULL)
-  ※ name に UNIQUE制約あり
+  email (text, NOT NULL, UNIQUE)
+  emailVerified (timestamp with tz, nullable)
+  image (text, nullable)
+  openaiApiKey (text, nullable)
   createdAt, updatedAt
```

- `name` の UNIQUE制約を削除
- `email` を追加（Google認証の識別子、UNIQUE）
- `emailVerified`, `image` を追加（Auth.js規約）
- `openaiApiKey` を追加（nullable、管理者がDB直接登録）

### 1-2. `accounts` テーブル新規作成

```
accounts:
  id (UUID, PK, default gen_random_uuid())
  userId (UUID, FK→users, NOT NULL, CASCADE)
  type (text, NOT NULL)
  provider (text, NOT NULL)
  providerAccountId (text, NOT NULL)
  refresh_token (text, nullable)
  access_token (text, nullable)
  expires_at (integer, nullable)
  token_type (text, nullable)
  scope (text, nullable)
  id_token (text, nullable)
  ※ (provider, providerAccountId) に UNIQUE制約
```

### 1-3. 不要なテーブル（JWT戦略のため）

- `sessions` テーブル → 不要
- `verification_tokens` テーブル → 不要（Googleログインのみ）

### 1-4. 影響範囲

- `src/server/db/schema.ts` — テーブル定義の変更・追加
- `src/shared/entities/user.ts` — UserSchema に email, image, openaiApiKey 等を追加
- `src/server/repositories/users/models.ts` — Insert/Update スキーマ更新
- `src/server/repositories/users/repository.ts` — findByEmail 等のメソッド追加

---

## フェーズ2: Auth.js v5 導入

### 2-1. パッケージインストール

```bash
npm install next-auth@5 @auth/drizzle-adapter
```

### 2-2. 設定ファイル作成

**`src/auth.ts`** — Auth.js メイン設定
- Google プロバイダー
- Drizzle アダプター（カスタムスキーマを渡す）
- JWT セッション戦略
- コールバック: JWT に userId を含める

**`src/app/api/auth/[...nextauth]/route.ts`** — API ルートハンドラー
- `handlers` を export

### 2-3. Middleware（ルート保護）

**`src/middleware.ts`** — 未認証ユーザーをログインページにリダイレクト
- `/api/auth/*` は除外（認証エンドポイント自体）
- それ以外の全ルートで認証を要求

### 2-4. `getCtx()` の改修

**`src/server/libs/auth.ts`**

```
変更前: DEV_USER_ID を固定で返す
変更後: auth() でセッションを取得し、session.user.id を返す
```

- `Ctx` 型は `userId` のみ（APIキーは含めない）

### 2-5. フロントエンド変更

- **`src/app/layout.tsx`** — `SessionProvider` を追加
- **`src/app/page.tsx`** — 認証済みなら GraphPage、未認証ならログイン画面
- **ログイン画面** — Branchifyロゴ＋「Googleでログイン」ボタン（最低限）
- **`src/app/graph-page/sidebar/UserMenu.tsx`** — ユーザー名・画像表示、ログアウトボタン

---

## フェーズ3: LLM APIキーの DB 読み込み

### 3-1. APIキー取得の方針

- `getCtx()` では `userId` のみ取得（`Ctx` に `openaiApiKey` は含めない）
- LLM呼び出し時のみ DBから `users.openai_api_key` を取得
- APIキーが null なら「APIキーが未登録です」エラーメッセージを返す

### 3-2. LLM 呼び出しの変更

**`src/server/use-cases/nodes/generate-answer-message.ts`**
**`src/server/use-cases/nodes/generate-node-title.ts`**

```diff
- const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
- if (!OPENAI_API_KEY) throw new Error('MISSING_ENV: OPENAI_API_KEY');
  ...
- const llm = new ChatOpenAI({ model: ..., apiKey: OPENAI_API_KEY });
+ // LLM呼び出し時にDBからAPIキーを取得
+ const user = await UserRepo.findById(tx, ctx.userId);
+ if (!user?.openaiApiKey) throw new Error('APIキーが未登録です');
+ const llm = new ChatOpenAI({ model: ..., apiKey: user.openaiApiKey });
```

- モジュールレベルの環境変数チェックを削除
- `_ctx` → `ctx` に変更
- 環境変数 `OPENAI_API_KEY` は不要になる

---

## フェーズ4: Neon DB セットアップ

### 4-1. Neonプロジェクト作成（ユーザー作業）

1. [Neon Console](https://console.neon.tech/) でプロジェクト作成
2. 接続文字列を取得（`postgresql://...@...neon.tech/...?sslmode=require`）

### 4-2. pool.ts の SSL 対応

```diff
  _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
-     // ssl: { rejectUnauthorized: false },
+     ssl: process.env.DATABASE_URL?.includes('neon.tech')
+         ? { rejectUnauthorized: false }
+         : undefined,
  });
```

※ ローカルPostgreSQLではSSL不要、Neonでは必要なので条件分岐

### 4-3. マイグレーション実行

```bash
npm run db:generate   # 新しいスキーマからマイグレーション生成
npm run db:migrate    # Neon に適用
```

---

## フェーズ5: Vercel デプロイ

### 5-1. Vercel接続（ユーザー作業）

1. [Vercel](https://vercel.com/) で GitHub リポジトリを接続
2. デプロイ → ドメイン取得（例: `branchify-xxx.vercel.app`）

### 5-2. Google OAuth 設定（ユーザー作業）

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) で OAuth 2.0 クライアント作成
2. 承認済みリダイレクト URI を追加:
   - `https://<vercel-domain>/api/auth/callback/google`（本番）
   - `http://localhost:3000/api/auth/callback/google`（ローカル開発）
3. OAuth同意画面を「本番」に公開（基本スコープのみなので審査不要）
4. クライアントID・シークレットを取得

### 5-3. 環境変数設定

**Vercel:**
```
DATABASE_URL=postgresql://...@...neon.tech/...?sslmode=require
AUTH_GOOGLE_ID=<Google Client ID>
AUTH_GOOGLE_SECRET=<Google Client Secret>
AUTH_SECRET=<ランダム文字列: npx auth secret で生成>
```

**ローカル `.env`:**
```
DATABASE_URL=postgresql://...（ローカルPostgreSQL or Neon）
AUTH_GOOGLE_ID=<同上>
AUTH_GOOGLE_SECRET=<同上>
AUTH_SECRET=<同上>
```

### 5-4. 再デプロイ・動作確認

---

## フェーズ6: 初期データ投入・動作確認

1. ブラウザで Vercel ドメインにアクセス → Googleログイン
   - Auth.js が自動で `users` テーブルにレコードを作成
2. 管理者が Neon Console (SQL Editor) で `openai_api_key` を設定
   ```sql
   UPDATE users SET openai_api_key = 'sk-...' WHERE email = 'user@gmail.com';
   ```
3. 再度ログインしてチャットが動作するか確認

---

## 実装順序と担当

| # | タスク | 担当 | 依存 |
|---|---|---|---|
| 1 | DBスキーマ変更 + accounts テーブル追加 | Devin | - |
| 2 | Auth.js v5 導入（設定・ルートハンドラー・middleware） | Devin | 1 |
| 3 | getCtx() 改修（auth()セッションに差し替え） | Devin | 2 |
| 4 | LLM呼び出しのAPIキーをDBから取得に変更 | Devin | 1, 3 |
| 5 | フロントエンド変更（ログインUI・UserMenu） | Devin | 2 |
| 6 | pool.ts SSL対応 | Devin | - |
| 7 | PR作成・レビュー | Devin→ユーザー | 1-6 |
| 8 | Neon プロジェクト作成 | ユーザー | - |
| 9 | Google OAuth 設定 | ユーザー | - |
| 10 | Vercel 接続・環境変数設定・デプロイ | ユーザー | 7, 8, 9 |
| 11 | マイグレーション実行（Neonに対して） | ユーザー | 8, 10 |
| 12 | 初期データ投入・動作確認 | ユーザー | 10, 11 |

**Devin担当（1〜7）**: 1つのPRにまとめる
**ユーザー担当（8〜12）**: PRマージ後に実施。8, 9 はPR作業中に並行可能

---

## 環境変数の変更

### 新規追加

| 変数名 | 用途 | 設定場所 |
|---|---|---|
| `AUTH_GOOGLE_ID` | Google OAuth Client ID | Vercel + ローカル .env |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret | Vercel + ローカル .env |
| `AUTH_SECRET` | Auth.jsのJWT署名キー | Vercel + ローカル .env |

### 既存（継続使用）

| 変数名 | 用途 | 備考 |
|---|---|---|
| `DATABASE_URL` | DB接続文字列 | Neonの接続文字列に変更 |

### 廃止

| 変数名 | 理由 |
|---|---|
| `OPENAI_API_KEY` | DBから取得する方式に変更 |
| `DEV_USER_ID` | Auth.jsでセッションから取得 |
