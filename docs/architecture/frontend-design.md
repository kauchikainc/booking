# フロントエンド設計

## 概要

3つの独立したフロントエンドアプリケーション（一般利用者向け、オーナー向け、管理者向け）を構築します。

---

## 1. 一般利用者向けフロントエンド (Guest Frontend)

### 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API + Zustand
- **フォーム管理**: React Hook Form + Zod
- **HTTPクライアント**: Axios
- **日付処理**: date-fns
- **地図表示**: React Leaflet
- **画像最適化**: Next.js Image
- **認証**: JWT + HttpOnly Cookie

### ディレクトリ構成

```
frontend-guest/
├── src/
│   ├── app/                        # App Router
│   │   ├── layout.tsx              # ルートレイアウト
│   │   ├── page.tsx                # トップページ
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── properties/
│   │   │   ├── page.tsx            # 施設一覧
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx        # 施設詳細
│   │   │   └── search/
│   │   │       └── page.tsx        # 検索結果
│   │   ├── bookings/
│   │   │   ├── page.tsx            # 予約一覧
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx        # 予約詳細
│   │   │   └── new/
│   │   │       └── page.tsx        # 新規予約
│   │   ├── profile/
│   │   │   └── page.tsx            # プロフィール
│   │   └── help/
│   │       └── page.tsx            # ヘルプ
│   ├── components/
│   │   ├── common/                 # 共通コンポーネント
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Loading.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   ├── property/               # 施設関連
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyList.tsx
│   │   │   ├── PropertyDetail.tsx
│   │   │   ├── PropertyGallery.tsx
│   │   │   ├── PropertyMap.tsx
│   │   │   └── PropertyReviews.tsx
│   │   ├── booking/                # 予約関連
│   │   │   ├── BookingCard.tsx
│   │   │   ├── BookingForm.tsx
│   │   │   ├── BookingCalendar.tsx
│   │   │   └── BookingSummary.tsx
│   │   ├── search/                 # 検索関連
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchFilters.tsx
│   │   │   └── DateRangePicker.tsx
│   │   └── review/                 # レビュー関連
│   │       ├── ReviewCard.tsx
│   │       ├── ReviewForm.tsx
│   │       └── RatingStars.tsx
│   ├── hooks/
│   │   ├── useAuth.ts              # 認証フック
│   │   ├── useProperties.ts        # 施設取得フック
│   │   ├── useBookings.ts          # 予約管理フック
│   │   ├── useReviews.ts           # レビューフック
│   │   └── useNotifications.ts     # 通知フック
│   ├── contexts/
│   │   ├── AuthContext.tsx         # 認証コンテキスト
│   │   └── NotificationContext.tsx # 通知コンテキスト
│   ├── stores/
│   │   ├── searchStore.ts          # 検索条件ストア
│   │   └── bookingStore.ts         # 予約フローストア
│   ├── api/
│   │   ├── client.ts               # APIクライアント設定
│   │   ├── auth.ts                 # 認証API
│   │   ├── properties.ts           # 施設API
│   │   ├── bookings.ts             # 予約API
│   │   ├── reviews.ts              # レビューAPI
│   │   └── notifications.ts        # 通知API
│   ├── utils/
│   │   ├── validation.ts           # バリデーション
│   │   ├── format.ts               # フォーマット関数
│   │   ├── date.ts                 # 日付ユーティリティ
│   │   └── price.ts                # 料金計算
│   ├── types/
│   │   ├── user.ts
│   │   ├── property.ts
│   │   ├── booking.ts
│   │   └── review.ts
│   └── constants/
│       ├── routes.ts
│       ├── config.ts
│       └── messages.ts
├── public/
│   ├── images/
│   └── icons/
└── package.json
```

### 主要ページ

#### トップページ (/)
- ヒーローセクション
- 人気の施設
- 検索バー
- カテゴリ別施設
- 新着レビュー

#### 施設一覧 (/properties)
- フィルタリング（場所、価格、人数、アメニティ）
- ソート（価格、評価、新着）
- ページネーション
- 地図表示切り替え

#### 施設詳細 (/properties/[id])
- 画像ギャラリー
- 施設情報
- アメニティ
- 地図
- レビュー一覧
- 予約フォーム
- 空き状況カレンダー

#### 予約一覧 (/bookings)
- 今後の予約
- 過去の予約
- キャンセル済み予約
- ステータスフィルタ

#### プロフィール (/profile)
- 基本情報編集
- プロフィール画像変更
- パスワード変更
- 通知設定

---

## 2. 施設オーナー向けフロントエンド (Owner Dashboard)

### 技術スタック

一般利用者向けと同じ

### ディレクトリ構成

```
frontend-owner/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # ダッシュボード
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx        # 招待トークンで登録
│   │   ├── properties/
│   │   │   ├── page.tsx            # 自分の施設一覧
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # 新規施設登録
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # 施設詳細・編集
│   │   │       ├── availability/
│   │   │       │   └── page.tsx    # 空き枠管理
│   │   │       ├── images/
│   │   │       │   └── page.tsx    # 画像管理
│   │   │       └── reviews/
│   │   │           └── page.tsx    # レビュー管理
│   │   ├── bookings/
│   │   │   ├── page.tsx            # 予約一覧
│   │   │   └── [id]/
│   │   │       └── page.tsx        # 予約詳細
│   │   ├── analytics/
│   │   │   └── page.tsx            # 分析・統計
│   │   └── profile/
│   │       └── page.tsx
│   ├── components/
│   │   ├── common/
│   │   │   ├── Sidebar.tsx         # サイドバー
│   │   │   ├── DashboardCard.tsx
│   │   │   ├── StatCard.tsx
│   │   │   └── Table.tsx
│   │   ├── property/
│   │   │   ├── PropertyForm.tsx
│   │   │   ├── PropertyList.tsx
│   │   │   ├── AvailabilityCalendar.tsx
│   │   │   └── ImageUploader.tsx
│   │   ├── booking/
│   │   │   ├── BookingTable.tsx
│   │   │   ├── BookingDetail.tsx
│   │   │   └── BookingStatusBadge.tsx
│   │   └── analytics/
│   │       ├── RevenueChart.tsx
│   │       ├── BookingChart.tsx
│   │       └── OccupancyRate.tsx
│   ├── hooks/
│   ├── contexts/
│   ├── stores/
│   ├── api/
│   ├── utils/
│   ├── types/
│   └── constants/
└── package.json
```

### 主要ページ

#### ダッシュボード (/)
- 今日のチェックイン・チェックアウト
- 未確認の予約
- 最新のレビュー
- 売上サマリー
- 稼働率グラフ

#### 施設管理 (/properties)
- 自分の施設一覧
- 施設の追加・編集・削除
- 公開状態の管理
- 画像のアップロード
- アメニティの設定

#### 空き枠管理 (/properties/[id]/availability)
- カレンダー形式で空き枠設定
- 一括設定機能
- 特別料金の設定
- 最小宿泊日数の設定

#### 予約管理 (/bookings)
- 予約一覧（テーブル形式）
- 予約の承認・拒否
- 予約詳細の確認
- ゲスト情報の表示

#### レビュー管理 (/properties/[id]/reviews)
- レビュー一覧
- オーナー返信
- 評価統計

#### 分析・統計 (/analytics)
- 売上推移グラフ
- 予約数推移グラフ
- 稼働率
- 平均単価
- レビュー評価推移

---

## 3. 管理者向けフロントエンド (Admin Dashboard)

### 技術スタック

オーナー向けと同じ

### ディレクトリ構成

```
frontend-admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                # ダッシュボード
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx            # ユーザー一覧
│   │   │   └── [id]/
│   │   │       └── page.tsx        # ユーザー詳細
│   │   ├── owners/
│   │   │   ├── page.tsx            # オーナー一覧
│   │   │   ├── invite/
│   │   │   │   └── page.tsx        # オーナー招待
│   │   │   └── [id]/
│   │   │       └── page.tsx        # オーナー詳細
│   │   ├── properties/
│   │   │   ├── page.tsx            # 全施設一覧
│   │   │   ├── pending/
│   │   │   │   └── page.tsx        # 審査待ち施設
│   │   │   └── [id]/
│   │   │       └── page.tsx        # 施設詳細・審査
│   │   ├── bookings/
│   │   │   ├── page.tsx            # 全予約一覧
│   │   │   └── [id]/
│   │   │       └── page.tsx        # 予約詳細
│   │   ├── analytics/
│   │   │   └── page.tsx            # プラットフォーム統計
│   │   ├── settings/
│   │   │   ├── page.tsx            # システム設定
│   │   │   ├── amenities/
│   │   │   │   └── page.tsx        # アメニティマスタ管理
│   │   │   └── notifications/
│   │   │       └── page.tsx        # 通知テンプレート管理
│   │   └── logs/
│   │       └── page.tsx            # システムログ
│   ├── components/
│   │   ├── common/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── DataTable.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── user/
│   │   │   ├── UserTable.tsx
│   │   │   ├── UserStatusBadge.tsx
│   │   │   └── UserRoleBadge.tsx
│   │   ├── property/
│   │   │   ├── PropertyReviewCard.tsx
│   │   │   ├── PropertyApprovalForm.tsx
│   │   │   └── PropertyStatusBadge.tsx
│   │   ├── analytics/
│   │   │   ├── PlatformStats.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   └── UserGrowthChart.tsx
│   │   └── invitation/
│   │       └── InvitationForm.tsx
│   ├── hooks/
│   ├── contexts/
│   ├── stores/
│   ├── api/
│   ├── utils/
│   ├── types/
│   └── constants/
└── package.json
```

### 主要ページ

#### ダッシュボード (/)
- プラットフォーム全体のKPI
- 新規ユーザー数
- 新規施設数
- 予約数・売上
- 審査待ち施設
- 最近のアクティビティ

#### ユーザー管理 (/users)
- 全ユーザー一覧
- 検索・フィルタリング
- ステータス変更（停止など）
- ユーザー詳細の確認

#### オーナー管理 (/owners)
- オーナー一覧
- オーナー招待
- 招待状況の確認

#### 施設管理 (/properties)
- 全施設一覧
- 審査待ち施設の確認
- 施設の承認・却下
- 施設詳細の確認

#### 予約管理 (/bookings)
- 全予約一覧
- 予約詳細の確認
- 問題のある予約の対応

#### 統計・分析 (/analytics)
- プラットフォーム全体の統計
- ユーザー増加傾向
- 売上推移
- 施設数推移
- 平均稼働率

#### システム設定 (/settings)
- アメニティマスタの管理
- 通知テンプレートの管理
- 手数料率の設定
- メンテナンスモード

---

## 共通設計方針

### レスポンシブデザイン

すべてのフロントエンドはモバイル・タブレット・デスクトップに対応。

**ブレークポイント:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### アクセシビリティ

- WCAG 2.1 AA準拠
- キーボード操作対応
- スクリーンリーダー対応
- 適切なARIAラベル

### パフォーマンス最適化

- 画像の遅延読み込み
- コード分割
- サーバーサイドレンダリング（SSR）
- 静的サイト生成（SSG）の活用
- APIレスポンスのキャッシュ

### セキュリティ

- XSS対策（入力のサニタイズ）
- CSRF対策（トークン）
- HTTPSのみ
- Content Security Policy設定
- 機密情報のローカルストレージ禁止

### エラーハンドリング

- グローバルエラーバウンダリ
- APIエラーの統一的なハンドリング
- ユーザーフレンドリーなエラーメッセージ
- エラーログの記録

### 国際化対応（将来）

現在は日本語のみだが、将来的に多言語対応できるよう設計。

- i18n対応のディレクトリ構成
- 翻訳キーの使用
- 日付・通貨のフォーマット対応

---

## コンポーネント設計原則

### Atomic Design

- Atoms: ボタン、入力フィールド、ラベルなど
- Molecules: 検索バー、カードなど
- Organisms: ヘッダー、フォーム、リストなど
- Templates: ページレイアウト
- Pages: 実際のページ

### コンポーネント命名規則

- PascalCase
- 機能を表す名前
- 例: `PropertyCard`, `SearchFilters`, `BookingForm`

### Props設計

- TypeScriptで型定義
- 必須プロパティと任意プロパティを明確に
- デフォルト値の設定
- コメントによる説明

### 状態管理の使い分け

- **ローカル状態**: `useState`
- **共有状態（軽量）**: `useContext`
- **複雑な状態**: `Zustand`
- **サーバー状態**: `React Query`（将来導入検討）

---

## スタイリングガイドライン

### Tailwind CSS設定

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          // ...
          900: '#1e3a8a',
        },
        secondary: {
          // ...
        },
      },
      fontFamily: {
        sans: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
};
```

### カラーパレット

- **Primary**: 青系（信頼感）
- **Secondary**: グレー系（中立）
- **Accent**: オレンジ系（アクション）
- **Success**: 緑系
- **Warning**: 黄色系
- **Error**: 赤系

### タイポグラフィ

- **見出し**: font-bold, text-2xl～text-4xl
- **本文**: font-normal, text-base
- **小文字**: text-sm, text-xs

---

## テスト戦略

### 単体テスト

- **ツール**: Jest + React Testing Library
- **対象**: ユーティリティ関数、フック、コンポーネント
- **カバレッジ目標**: 80%以上

### E2Eテスト

- **ツール**: Playwright
- **対象**: 主要なユーザーフロー
  - 新規登録
  - ログイン
  - 施設検索
  - 予約作成
  - レビュー投稿

### ビジュアルリグレッションテスト

- **ツール**: Storybook + Chromatic（検討中）
- **対象**: 主要コンポーネント

---

## 開発環境

### ローカル開発サーバー

```bash
npm run dev
```

- Hot Reload対応
- 開発用プロキシ設定
- モックAPIサーバー（必要に応じて）

### ビルド

```bash
npm run build
npm run start
```

### リント・フォーマット

```bash
npm run lint
npm run format
```

- ESLint
- Prettier
- TypeScript型チェック

---

## デプロイ

### 環境

- **開発環境**: Vercel（自動デプロイ）
- **ステージング環境**: Vercel（手動デプロイ）
- **本番環境**: Vercel（承認後デプロイ）

### 環境変数

```
NEXT_PUBLIC_API_URL=https://api.booking-service.example.com/v1
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=xxx
```

### CI/CD

- GitHub Actions
- PR作成時: リント、型チェック、テスト実行
- mainブランチマージ時: 自動デプロイ
