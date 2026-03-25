---
name: add-life-event
description: ライフイベントのカテゴリやテンプレートを追加するドメイン特化スキル。「ライフイベントを追加」「新しいカテゴリを追加」「/add-life-event」と言ったとき使用する。
version: 1.0.0
disable-model-invocation: true
---

# ライフイベント追加ガイド

追加するイベント: $ARGUMENTS

## Step 1: 現状確認

以下のファイルを読み込む：

1. `frontend/src/lib/types.ts` — `LifeEventCategory` 型の現在の値を確認
2. `frontend/src/components/forms/LifeEventForm.tsx` — `CATEGORY_OPTIONS` と `EVENT_TEMPLATES` の現在の内容を確認
3. `frontend/src/__tests__/simulation.test.ts` — 既存のテストパターンを確認

## Step 2: 更新が必要な3箇所（すべて更新すること）

### A. `frontend/src/lib/types.ts`

`LifeEventCategory` の Union 型に新しいカテゴリ文字列を追加する。

```typescript
export type LifeEventCategory =
  | '既存カテゴリ'
  | '新しいカテゴリ名';  // ← 追加
```

### B. `frontend/src/components/forms/LifeEventForm.tsx`

**`CATEGORY_OPTIONS` にアイコンとラベルを追加：**
```typescript
{ value: '新しいカテゴリ名', label: '表示名', icon: '絵文字' },
```

**`EVENT_TEMPLATES` にテンプレートを追加：**
```typescript
新しいカテゴリ名: {
  name: 'テンプレート表示名',
  oneTimeCost: 0,           // 一時費用（円）
  annualCostChange: 0,      // 年間支出変動（円、増加=正、減少=負）
  annualIncomeChange: 0,    // 年間収入変動（円、増加=正、減少=負）
  durationYears: 0,         // 継続年数（0=永続）
  person: 'household',      // 'self' | 'spouse' | 'household'
},
```

### C. `frontend/src/__tests__/simulation.test.ts`

新しいカテゴリのイベントを使ったテストケースを追加する（`unit-test` スキルのテンプレートに従う）。

## Step 3: 金額の参考値（日本の生活費データ）

| イベント | 一時費用 | 年間継続コスト | 継続年数 | `person` |
|----------|----------|----------------|----------|----------|
| 出産 | 50万円 | 36万円 | 3年 | `household` |
| 子ども小学校入学 | 10万円 | 24万円 | 6年 | `household` |
| 子ども大学進学 | 50万円 | 120万円 | 4年 | `household` |
| マイホーム購入（3000万） | 500万円 | 18万円（維持費） | 35年 | `household` |
| 車購入 | 300万円 | 30万円（維持費） | 7年 | `household` |
| 転職（年収+100万） | 0 | +100万円（収入増） | 0=永続 | `self` |
| 早期退職・独立 | 0 | -300万円（収入減） | 0=永続 | `self` |
| 介護開始 | 0 | 60万円 | 5年 | `household` |
| 海外赴任 | 50万円 | -50万円（生活費増） | 3年 | `self` |
| 副業開始 | 0 | +50万円（収入増） | 0=永続 | `self` |

## Step 4: テスト確認

```bash
cd frontend && npm test
```

新しいカテゴリのイベントが `runSimulation` で正しく反映されることを確認する。
