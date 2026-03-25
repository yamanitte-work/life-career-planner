---
name: unit-test
description: このプロジェクトのユニットテストを作成・追加するスキル。ユーザーが「テストを書いて」「ユニットテスト」「/unit-test」と言ったとき、または新しいロジックにテストを追加したいときに使用する。
version: 1.0.0
disable-model-invocation: true
---

# ユニットテスト作成

対象ファイル: $ARGUMENTS

## Step 1: 対象コードと既存テストの読み込み

1. 引数で指定されたソースファイルを読み込む
2. `frontend/src/__tests__/` 配下の既存テストを確認し、同じ対象のテストがないか確認する（重複配置を防ぐ）
3. バックエンドの場合は `backend/tests/` 配下を確認する

## Step 2: テスト配置ルールの確認

### フロントエンド（Vitest）
- テストファイルは **`frontend/src/__tests__/`** に配置する（`src/lib/` 等の隣には置かない）
- ファイル名: `<対象モジュール名>.test.ts`
- Node.js 20.19 以上が必要（`.nvmrc` 参照）

### バックエンド（pytest）
- テストファイルは **`backend/tests/`** に配置する
- ファイル名: `test_<対象モジュール名>.py`
- 依存パッケージは `requirements-dev.txt` に記載（`pytest`, `httpx` など）

## Step 3: テストコードの作成規則

### フロントエンド（TypeScript）

#### 基本構造
```typescript
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { /* 対象の関数/モジュール */ } from '../lib/対象モジュール';
import { defaultLifePlan } from '../lib/storage';

describe('モジュール名 or 関数名', () => {
  it('正常系: 〜したとき〜になること', () => {
    // ...
  });
});
```

#### localStorage を使うテスト
```typescript
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);
afterAll(() => vi.unstubAllGlobals()); // グローバルリーク防止（必須）

beforeEach(() => {
  localStorageMock.clear(); // テスト間の状態汚染を防ぐ（必須）
});
```

#### テストデータ生成ヘルパー
```typescript
// 最小限のデフォルト値 + 上書き可能なパターンで作る
function createLifeEvent(overrides: Partial<LifeEvent> = {}): LifeEvent {
  return {
    id: 'test',
    name: '',
    category: 'other',
    yearOffset: 0,
    person: 'household',
    oneTimeCost: 0,
    annualCostChange: 0,
    annualIncomeChange: 0,
    durationYears: 0,
    memo: '',
    ...overrides,
  };
}
```

#### LifePlan のカスタマイズ
```typescript
// defaultLifePlan をベースにスプレッドで必要箇所だけ上書きする
const plan: LifePlan = {
  ...defaultLifePlan,
  income: { ...defaultLifePlan.income, selfAnnualIncome: 10000000 },
};
```

### バックエンド（Python）

```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_正常系():
    response = client.get("/api/...")
    assert response.status_code == 200
```

## Step 4: テストケースの網羅ルール

以下のカテゴリを必ず検討する。

### 必須カテゴリ
1. **正常系**: 典型的な入力で期待通りの出力になること
2. **境界値**: ゼロ、最大値（age=100など）、ちょうど境界の値
3. **空・欠損**: 空配列 `[]`、空文字 `''`、`0`、`null`/`undefined`
4. **破損データ**: `JSON.parse` エラー、不正な型（`localStorage` 系テストに必須）
5. **エッジケース**: このプロジェクト固有の以下を必ず含める

#### プロジェクト固有のエッジケース
- `runSimulation`: `age=100` で結果が空配列になること
- `runSimulation`: `durationYears=0` のライフイベントが永続的に適用されること
- `runSimulation`: 負の `annualIncomeChange`（退職シナリオ）が正しく反映されること
- `runSimulation`: 同一年に複数イベントが重複適用されること
- `runSimulation`: 負債がゼロ以下にならないこと
- `loadScenarios`: 破損 JSON・配列でない値・不完全な plan フィールドでもクラッシュしないこと
- `loadScenarios`: 新しいフィールドが欠けている古いデータを `deepMerge` で補完できること
- `saveScenario`: `QuotaExceededError` 等の例外が起きてもクラッシュしないこと
- `NumericInput`: 負の値・空文字列を入力中にクラッシュしないこと

## Step 5: 実行確認

テスト作成後、以下のコマンドで実行する。

### フロントエンド
```bash
cd frontend && npm test
```

### バックエンド
```bash
cd backend && pytest tests/
```

失敗したテストがあれば原因を調査・修正してから完了とする。
