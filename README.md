# Branchify
文脈分岐可能なLLMチャットアプリ

## Setup
- setup DB
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

- setup .env (copy .env.example)

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