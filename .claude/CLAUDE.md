# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

### フロントエンド（`frontend/`）
```bash
npm install          # 初回セットアップ
npm run dev          # 開発サーバー起動 → http://localhost:3000
npm run build        # 静的エクスポートビルド（out/ に出力）
npm test             # Vitest でテスト実行（1回）
npm run test:watch   # Vitest をウォッチモードで実行
```

> **WSL 注意**: `/mnt/c/` 等の Windows ファイルシステム上では `npm run build` が Turbopack の制約で失敗する場合がある。その場合は `/tmp` 等の Linux FS にコピーしてビルドすること。

### バックエンド（`backend/`）—オプション
```bash
pip install -r requirements.txt -r requirements-dev.txt
uvicorn app.main:app --reload   # http://localhost:8000
pytest tests/                   # テスト実行
```

## アーキテクチャ概要

### フロントエンドは完全スタンドアロン
バックエンドは**オプション**。フロントエンドはバックエンド不要で動作し、データはすべて **localStorage** に保存する（`lib/storage.ts`）。

### データフロー
```
localStorage
  ↕ (loadPlan / savePlan)
PlanContext (context/PlanContext.tsx)
  ↕ (usePlan hook)
各フォームコンポーネント → updatePlan()
ダッシュボード → runSimulation(plan) → グラフ表示
```

### 中心的な型定義（`lib/types.ts`）
`LifePlan` が唯一のルートデータ構造で、以下を内包する：
- `HouseholdProfile`（自分・配偶者それぞれの `Person`）
- `IncomePlan` / `ExpensePlan` / `AssetAccount` / `DebtPlan` / `InvestmentPlan`
- `LifeEvent[]`（発生年オフセット・一時コスト・継続的な収支変化・継続年数）

### シミュレーションエンジン（`lib/simulation.ts`）
`runSimulation(plan, years)` が純粋関数として 30 年分の `SimulationYearData[]` を返す。ライフイベントは `yearOffset` で発生年を、`durationYears`（0 = 永続）で継続期間を制御する。バックエンドの `app/services/simulation.py` は同じロジックの Python 実装。

### ページ構成（App Router）
| ルート | 役割 |
|--------|------|
| `/` | トップ（ランディング） |
| `/setup` | 6ステップ入力ウィザード（基本情報→収入→支出→資産・負債→投資前提→ライフイベント） |
| `/dashboard` | シミュレーション結果・グラフ表示 |

### GitHub Pages へのデプロイ
`next.config.ts` で `output: "export"` を設定。CI 環境（`GITHUB_ACTIONS=true`）では `basePath` に `/life-career-planner` が付与される。ローカルでは空文字。`main` ブランチへの push で自動デプロイ（`.github/workflows/deploy-pages.yml`）。

### バックエンド（FastAPI）
- SQLite（デフォルト）/ `DATABASE_URL` 環境変数で変更可能（`.env.example` 参照）
- ルーター: `/api/households`（世帯データの CRUD）、`/api/simulation`（シミュレーション実行）
- CORS は `http://localhost:3000` のみ許可

### ストレージのスキーマ進化
`storage.ts` の `deepMerge` 関数が `defaultLifePlan` をベースに localStorage の保存データをマージする。新しいフィールドを `LifePlan` に追加した場合は、必ず `defaultLifePlan`（`lib/storage.ts`）にもデフォルト値を追加すること。
