# 情報システム部ポータル（jousys-portal）

社内向け Web サイト作成基盤（クライゼル）上で React + TypeScript により構築した情シスポータルを、
GitHub Pages で動く形に再現したものです。会社名・連絡先・障害情報はすべて架空のデモデータです。

## 機能

| 画面 | パス | 概要 |
| --- | --- | --- |
| 活動案内 | `#/` | 情シスの業務内容、お知らせ、問い合わせ窓口、現在の障害サマリー |
| 障害通知掲示板 | `#/status` | 拠点 × 障害種別ごとの障害レベルを色で表示。緊急・警告時は全ページにバナー表示 |
| 障害ステータス更新 | `#/status/admin` | チェックボックスで障害箇所を選び、レベルを反映して DB へ送信。CSV 生成・取り込み |
| PC・プリンター ナレッジ | `#/knowledge` | キーワード検索・カテゴリ絞り込み付きの自己解決ガイド |
| 情報セキュリティ動画 | `#/security` | 教育動画の一覧・再生、必須動画の受講進捗管理 |

### 障害通知の構成

- **障害の種類**：インターネット接続障害／社内LAN障害／Microsoft 365 関連障害
- **障害が起きている場所**：本社（1F〜5F）、西日本支店、東日本支店、グループ会社 A〜Z（計 33 拠点）
- **障害レベル**：緊急（赤）／警告（オレンジ）／通達（黄）／情報（青）／正常（色なし）

### 更新の流れ（チェックボックス画面）

1. マトリクスで障害箇所にチェック（行・列・グループ単位の一括選択も可能）
2. レベルとメッセージを選んで「選択した N 箇所に反映」（この時点では下書き）
3. 「DBへ送信」で掲示板に公開。送信履歴が残る

### CSV による手動切り替え

- **CSV生成**：全拠点 × 全種別（99 行）を UTF-8（BOM 付き、Excel 対応）で出力
- **CSV取り込み**：編集した CSV を読み込み、下書きに反映 → 確認して「DBへ送信」
  - UTF-8 / Shift_JIS のどちらでも読み込み可能
  - `level` は `emergency / warning / notice / info / normal` のほか `緊急 / 警告 / 通達 / 情報 / 正常` も可
  - 拠点は `location_id` または `location_name` で照合。CSV にない箇所は「正常」扱い
  - 不正な行は行番号付きでエラー表示し、正しい行だけ取り込む

```csv
location_id,location_name,incident_type,incident_type_name,level,message,updated_at
hq-3f,本社 3F,lan,社内LAN障害,emergency,フロアスイッチ故障,2026-11-06T01:00:00.000Z
```

## 技術構成

- React 18 + TypeScript + Vite
- React Router（HashRouter：GitHub Pages のサブパスで動かすため）
- Vitest（CSV 変換のユニットテスト）
- GitHub Actions → GitHub Pages 自動デプロイ

### データ保存（DB）について

クライゼルでは DB 機能に保存していた障害ステータスを、`StatusRepository` インターフェースで抽象化しています。

```ts
interface StatusRepository {
  load(): Promise<StatusSnapshot>;
  publish(cells, by, source): Promise<StatusSnapshot>;
  history(): Promise<PublishLog[]>;
  subscribe(listener): () => void;
}
```

GitHub Pages にはサーバーが無いため、デモでは `LocalStorageStatusRepository`（ブラウザの localStorage）を使っています。
REST API や Supabase などの実装に差し替えれば、画面側を変えずに複数端末で共有できます。
掲示板は 30 秒ごとの再読み込みと、別タブでの更新検知（storage イベント）に対応しています。

> デモのため更新画面に認証はかけていません。実運用では SSO 等でアクセスを制限してください。

### ディレクトリ

```
src/
  domain/status.ts          拠点・障害種別・レベルの定義と集計ロジック
  lib/csv.ts                CSV 生成・パース・取り込み（+ csv.test.ts）
  lib/statusRepository.ts   永続化層（localStorage 実装）
  data/                     活動案内・ナレッジ・動画・初期デモデータ
  pages/                    各画面
  components/               レイアウト・凡例
```

## 開発

```bash
npm install
npm run dev      # 開発サーバー
npm test         # ユニットテスト
npm run build    # 本番ビルド（dist/）
```

### セキュリティ動画の設定

`src/data/videos.ts` の各動画の `src` に YouTube の埋め込み URL（`https://www.youtube.com/embed/...`）
または動画ファイルの URL を設定すると再生できます。未設定の動画は「準備中」と表示されます。

## デプロイ

`main` に push すると GitHub Actions がテスト・ビルドして GitHub Pages に公開します。
初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にしてください。
