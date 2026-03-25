---
name: check
description: デプロイ前の総合チェックを行うスキル。型チェック・テスト・コードレビュー・整合性確認を一括実施する。「/check」「チェック」「デプロイ前確認」「プッシュ前確認」と言ったとき使用する。
version: 1.0.0
disable-model-invocation: true
---

# デプロイ前総合チェック

対象: $ARGUMENTS（省略時は全体）

## Step 1: TypeScript 型チェック

```bash
cd frontend && npx tsc --noEmit
```

エラーがあれば内容を表示して修正を提案する。型エラーはテストでは検出されないため、このステップは必須。

## Step 2: フロントエンド ユニットテスト

```bash
cd frontend && npm test
```

失敗したテストがあれば原因を特定して修正する。

## Step 3: バックエンドテスト（backend/ が存在する場合）

```bash
cd backend && pytest tests/ -v 2>/dev/null || echo "バックエンドのテスト環境がセットアップされていません（スキップ）"
```

## Step 4: 変更差分のコードレビュー

`git diff HEAD` を取得し、`/review` スキルと同じチェックリストでレビューを実施する：

- null / undefined ガード漏れ
- localStorage の try/catch
- `lib/types.ts` 変更時の `defaultLifePlan` 更新
- `structuredClone` の使用（JSON.parse/stringify 禁止）
- CSS 変数の使用（カラーハードコード禁止）
- Pydantic の mutable デフォルト値

## Step 5: `defaultLifePlan` 整合性チェック

`lib/types.ts` の `LifePlan` インターフェースのフィールドと `lib/storage.ts` の `defaultLifePlan` のフィールドを比較する。

両ファイルを読み込み、`LifePlan` に存在して `defaultLifePlan` にないフィールドがあれば警告する。

## Step 6: 結果サマリー

以下の形式で出力する：

```
=== デプロイ前チェック結果 ===

1. TypeScript 型チェック  : ✅ PASS / ❌ FAIL
2. Vitest テスト          : ✅ PASS (X件) / ❌ FAIL (X件失敗)
3. pytest                 : ✅ PASS / ❌ FAIL / ⏭️ SKIP
4. コードレビュー         : ✅ 問題なし / ⚠️ X件の指摘
5. defaultLifePlan 整合性 : ✅ OK / ⚠️ 要確認: [フィールド名]

→ すべて PASS: デプロイ可能です 🚀
→ 問題あり: 上記の項目を修正してから main にプッシュしてください
```
