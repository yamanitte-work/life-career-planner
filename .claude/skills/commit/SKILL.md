---
name: commit
description: Conventional Commits 形式で git コミットを作成するスキル。ユーザーが「コミット」「commit」「/commit」と言ったとき使用する。
version: 1.0.0
disable-model-invocation: true
---

# Conventional Commits 形式でコミット

## Step 1: 変更内容の把握

```bash
git status
git diff --staged
git diff
```

ステージされた変更がない場合は、変更ファイルを確認してから `git add` を提案する。

## Step 2: コミット前のガード（必ず確認）

### `lib/types.ts` に変更がある場合
`lib/storage.ts` の `defaultLifePlan` にも対応するデフォルト値が追加されているか確認する。不整合があればコミット前に修正を促す。

### テストの確認
```bash
cd frontend && npm test
```
失敗がある場合はコミットしない。

## Step 3: コミットタイプの選択

変更内容に応じて以下のタイプを選ぶ：

| タイプ | 使う場面 |
|--------|----------|
| `feat` | 新機能（新しいライフイベントカテゴリ、グラフ追加など） |
| `fix` | バグ修正（シミュレーション計算ミス、storage 不整合など） |
| `refactor` | 動作変更なしのリファクタリング |
| `test` | テスト追加・修正のみ |
| `docs` | CLAUDE.md、README 等のドキュメント変更 |
| `chore` | 設定ファイル変更（next.config.ts、package.json など） |
| `style` | CSS・UI のスタイル変更（機能変更なし） |
| `perf` | パフォーマンス改善（runSimulation の最適化など） |

## Step 4: スコープの付与（任意）

このプロジェクト固有のスコープ：

| スコープ | 対象ファイル・領域 |
|----------|--------------------|
| `simulation` | `lib/simulation.ts` |
| `storage` | `lib/storage.ts` |
| `types` | `lib/types.ts` |
| `ui` | `components/` 全般 |
| `setup` | セットアップウィザード |
| `dashboard` | ダッシュボード・グラフ |
| `backend` | FastAPI バックエンド |
| `ci` | `.github/workflows/` |
| `claude` | `.claude/` 設定 |

## Step 5: コミットの実行

形式: `<type>(<scope>): <日本語の説明>`

```bash
git add <関係するファイルを個別に指定>
git commit -m "<type>(<scope>): <説明>"
```

### コミットメッセージの例
```
feat(simulation): ライフイベントの継続年数ゼロを永続適用に変更
fix(storage): loadScenarios で破損 JSON を受け取った場合の空配列フォールバック
refactor(ui): NumericInput の allowNegative prop をデフォルト false に統一
test(simulation): age=100 で空配列を返すエッジケースのテスト追加
chore(ci): Node.js バージョンを 20.19 に固定
```

## Step 6: 完了確認

```bash
git log --oneline -5
```
