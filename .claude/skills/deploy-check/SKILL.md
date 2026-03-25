---
name: deploy-check
description: GitHub Pages へのデプロイ前に静的ビルドを検証するスキル。「デプロイ確認」「ビルドチェック」「/deploy-check」と言ったとき使用する。
version: 1.0.0
disable-model-invocation: true
---

# GitHub Pages デプロイ前チェック

## Step 1: 作業環境の確認

```bash
pwd
```

`/mnt/c/` から始まる場合は WSL 環境。Step 4 でビルド手順が変わる。

## Step 2: TypeScript 型チェック

```bash
cd frontend && npx tsc --noEmit
```

エラーがあれば修正する。

## Step 3: ユニットテスト

```bash
cd frontend && npm test
```

テストが通ることを確認する。

## Step 4: 静的ビルド（環境に応じて分岐）

`GITHUB_ACTIONS=true` を付けて CI と同条件（`basePath=/life-career-planner`）でビルドする。

### 通常環境（`/mnt/c/` 以外）の場合

```bash
cd frontend && GITHUB_ACTIONS=true npm run build
```

### WSL 環境（`/mnt/c/` 配下）の場合

Turbopack の制約でビルドが失敗するため、Linux ファイルシステム上でビルドする：

```bash
# プロジェクトを /tmp にコピー（.claude/ は除外）
rsync -av --exclude='.claude' --exclude='node_modules' --exclude='.next' --exclude='out' \
  /path/to/project/ /tmp/life-career-planner-build/

# Linux FS 上でビルド
cd /tmp/life-career-planner-build/frontend && npm ci && GITHUB_ACTIONS=true npm run build
```

ビルドが失敗した場合は原因を分析して修正する。

## Step 5: ビルド成果物の確認

```bash
ls frontend/out/
```

（WSL ビルドの場合は `/tmp/life-career-planner-build/frontend/out/`）

以下のディレクトリ・ファイルが存在することを確認する：
- `index.html`
- `setup/`
- `dashboard/`

## Step 6: 未コミット変更の確認

```bash
git status
git diff --stat
```

コミット漏れがある場合は `/commit` スキルを使うよう案内する。

## Step 7: デプロイサマリー

```
=== デプロイ前チェック結果 ===

ブランチ: <現在のブランチ>
デプロイ先: https://<username>.github.io/life-career-planner/
トリガー: main ブランチへの push で GitHub Actions が自動実行

チェック結果:
- TypeScript 型チェック : ✅ PASS / ❌ FAIL
- Vitest テスト         : ✅ PASS / ❌ FAIL
- 静的ビルド           : ✅ PASS / ❌ FAIL
- 未コミット変更       : ✅ なし / ⚠️ あり

→ すべて PASS: main にプッシュしてデプロイを開始してください 🚀
```
