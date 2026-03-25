---
name: review
description: このプロジェクトのソースコードレビューを行うスキル。ユーザーが「レビュー」「コードレビュー」「/review」と言ったとき、またはコードの問題点を確認したいときに使用する。
version: 1.0.0
disable-model-invocation: true
---

# ソースコードレビュー

対象ファイル: $ARGUMENTS

以下の手順でレビューを行う。

## Step 1: 対象コードの読み込み

引数で指定されたファイルを読み込む。引数がない場合は `git diff HEAD` で変更差分を取得する。

## Step 2: 以下のチェックリストに沿ってレビュー

### 【共通】バグ・ロジック

- [ ] `null` / `undefined` のガード漏れがないか（特にオプショナルチェーン・型アサーションを使っている箇所）
- [ ] 配列インデックスや数値フィールドに負数・不正値が入り込まないか（`Field(ge=0)` 相当のバリデーションがあるか）
- [ ] 文字列フィールドを使う前に `.trim()` で空文字列チェックをしているか（イベント名などの表示系）
- [ ] 重複するIDや名前をキーにしている場合、衝突時の挙動を考慮しているか

### 【フロントエンド: TypeScript / Next.js】

- [ ] `localStorage` の読み書きを `try/catch` で囲んでいるか（`QuotaExceededError` 等）
- [ ] `JSON.parse` 後に `deepMerge(defaultLifePlan, parsed)` でスキーマ補完しているか（フィールド追加時の互換性）
- [ ] ディープクローンに `JSON.parse/stringify` を使っていないか（`NaN`/`Infinity` が `null` に変換される）→ `structuredClone` を使うこと
- [ ] ID生成ロジックが `lib/id.ts` の共通関数を使っているか（重複実装していないか）
- [ ] `localStorage` のキー文字列を直接ハードコードしていないか（`STORAGE_KEY` / `SCENARIOS_KEY` 定数を使うこと）
- [ ] `NumericInput` コンポーネントで `allowNegative` prop が必要な箇所（投資利回り・収支変化など）に対応しているか
- [ ] CSSカラーをハードコードしていないか（`#111827` 等）→ `var(--foreground)` / `var(--background)` 等のテーマ変数を使うこと
- [ ] ダークモード（`prefers-color-scheme: dark`）と矛盾していないか
- [ ] インタラクティブ要素に適切な `aria-*` 属性があるか（折りたたみボタンに `aria-expanded` / `aria-controls` など）
- [ ] `<input>` に対応する `<label>` またはスクリーンリーダー向けラベルがあるか

### 【フロントエンド: 型・インポート】

- [ ] 未使用のインポートがないか
- [ ] 未使用の変数・フィールドがないか
- [ ] `LifePlan` 型に新フィールドを追加した場合、`lib/storage.ts` の `defaultLifePlan` にもデフォルト値を追加しているか

### 【バックエンド: Python / FastAPI】

- [ ] Pydantic の mutable なデフォルト値に `Field(default_factory=...)` を使っているか（`HouseholdSchema()` などの直接インスタンス化は共有状態バグの原因）
- [ ] `model_dump()` が返す Enum 値を JSON シリアライズする際に失敗しないか（`model_config = {"use_enum_values": True}` を設定しているか）
- [ ] Pydantic のエイリアスフィールド（`self_` / `self`）でシリアライズ・デシリアライズの不整合がないか
- [ ] テスト用依存関係（pytest, httpx 等）が `requirements-dev.txt` に分離されているか
- [ ] インポートパスが正しいか（`get_db` は `app.database`、`Base` は `app.models.schemas`）

## Step 3: レビュー結果の出力

以下の形式で出力する。

---

### コードレビュー結果

**対象**: `<ファイルパスまたは差分>`

#### 問題点

| # | 重要度 | 場所 | 内容 |
|---|--------|------|------|
| 1 | 🔴 高 / 🟡 中 / 🔵 低 | `ファイル:行番号` | 問題の説明と修正方針 |

#### 問題なし

特に指摘なし（あれば省略）。

---

- 重要度の基準: 🔴=バグ・データ破損・セキュリティ、🟡=保守性・互換性・アクセシビリティ、🔵=スタイル・軽微な改善
- 既存コードの問題（今回の変更に含まれない箇所）は指摘しない
- CI でキャッチされる型エラー・フォーマット問題は指摘しない
