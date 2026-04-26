# Branchify

文脈分岐可能なLLMチャットアプリ

## Setup

- setup .env (copy .env.example)

- start postgres db server

- setup db

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

- start dev server

```bash
npm run dev
```

## Commands

- view dir tree

```bash
tree -I 'next|node_modules'
```

- view db

```bash
npm run db:view
```

- truncate db

```bash
npm run db:truncate
```

- backup db

```bash
npm run db:backup
```

- restore db

```bash
npm run db:restore
npm run db:restore backup_20260123_120000.sql
```

## Backup / Restore

`db:backup` と `db:restore` は `.env` の `DATABASE_URL` を使って PostgreSQL に接続します。実行環境には `pg_dump` と `psql` が必要です。

- `npm run db:backup`
  - `backups/backup_YYYYMMDD_HHMMSS.sql` を作成します
  - バックアップ対象はデータのみです
  - 出力形式は `INSERT` 文のプレーン SQL です
  - `--no-owner --no-acl` で権限情報は含みません

- `npm run db:restore`
  - 引数なしで実行すると `backups/` 配下の `.sql` 一覧を表示します
  - `npm run db:restore <filename>` で対象ファイルを復元します
  - 相対パス指定時は `backups/<filename>` を見に行きます
  - 復元前に `users`, `graphs`, `nodes`, `edges` を `TRUNCATE ... CASCADE` します
  - 既存データを消してから流し込むため、差分マージではなく全置換です
