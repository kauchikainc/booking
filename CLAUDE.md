# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

民泊やゲストハウスなど、ホテル以外の宿泊施設専用の予約サービスプラットフォーム。

### 主要な3つのシステム

1. **一般利用者向けサービス** - 施設検索・予約・レビュー
2. **施設オーナー向け管理画面** - 施設管理・予約管理・分析
3. **サービス管理者向け管理画面** - ユーザー管理・施設審査・全体統計

これら3つは独立したフロントエンドですが、バックエンドAPI・データベースは共通です。

## 開発サーバーの起動

**重要**: サーバーの起動・停止はユーザーが手動で行います。Claudeは自動でサーバーを起動しません。

### サーバー起動手順

各サーバーは別々のターミナルウィンドウで起動してください：

#### 1. バックエンドAPI（必須）
```bash
cd backend
npm run dev
# ポート 3100 で起動
```

#### 2. Guest フロントエンド（一般利用者向け）
```bash
cd frontend/guest
npm run dev
# ポート 3101 で起動
```

#### 3. Owner フロントエンド（施設オーナー向け）
```bash
cd frontend/owner
npm run dev
# ポート 3102 で起動
```

#### 4. Admin フロントエンド（管理者向け）
```bash
cd frontend/admin
npm run dev
# ポート 3103 で起動
```

#### 5. Prisma Studio（データベースGUI、オプション）
```bash
cd backend
npx prisma studio
# ポート 5555 で起動
```

### アクセスURL

- バックエンドAPI: http://localhost:3100/api/v1
- Guest フロントエンド: http://localhost:3101
- Owner フロントエンド: http://localhost:3102
- Admin フロントエンド: http://localhost:3103
- Prisma Studio: http://localhost:5555

## 環境変数設定

### バックエンド (.env)

`backend/.env` ファイルに以下の環境変数が必須です：

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/booking?schema=public"
JWT_SECRET="your-secret-key-here"  # 本番環境では強力なランダム文字列を使用
JWT_EXPIRES_IN="24h"
CORS_ORIGIN="http://localhost:3101,http://localhost:3102,http://localhost:3103"
PORT=3100
NODE_ENV="development"
```

### フロントエンド (.env.local)

各フロントエンド（`frontend/guest/`, `frontend/owner/`, `frontend/admin/`）で以下を設定：

```bash
NEXT_PUBLIC_API_URL=http://localhost:3100/api/v1
```

## 開発コマンド

### 便利なMakeコマンド

プロジェクトルートで以下のコマンドが使用可能です：

```bash
# すべてのサーバーを一括起動（tmux使用）
make start

# 起動状況の確認
make status

# すべて停止
make stop

# 再起動
make restart

# すべての依存関係をインストール
make install

# すべてをビルド
make build

# データベースマイグレーション
make db-migrate

# データベースリセット
make db-reset

# テストアカウント作成（admin, guest, owner）
make db-seed

# Prisma Studio起動
make db-studio

# テスト実行
make test

# ヘルプ表示
make help
```

### バックエンド開発

```bash
cd backend

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番起動
npm start

# リント
npm run lint

# フォーマット
npm run format

# 型チェック
npm run type-check

# テスト実行
npm test                      # 全テスト実行
npm run test:watch            # ウォッチモード
npm run test:coverage         # カバレッジ測定

# 単一テストファイル実行
npm test -- auth.controller.test.ts

# Prisma関連
npx prisma generate           # Prismaクライアント生成
npx prisma migrate dev        # マイグレーション実行（開発環境）
npx prisma migrate reset      # データベースリセット
npx prisma studio             # Prisma Studio起動
```

### フロントエンド開発

各フロントエンド（guest, owner, admin）で共通のコマンド：

```bash
# Guest フロントエンド
cd frontend/guest
npm run dev                   # 開発サーバー起動（ポート3101）
npm run build                 # ビルド
npm run start                 # 本番起動
npm run lint                  # リント

# Owner フロントエンド
cd frontend/owner
npm run dev                   # 開発サーバー起動（ポート3102）
npm run build                 # ビルド
npm run start                 # 本番起動
npm run lint                  # リント

# Admin フロントエンド
cd frontend/admin
npm run dev                   # 開発サーバー起動（ポート3103）
npm run build                 # ビルド
npm run start                 # 本番起動
npm run lint                  # リント
```

### データベース操作

```bash
# Dockerでローカル環境のPostgreSQLを起動
docker compose up -d

# Dockerを停止
docker compose down

# データベース初期化（マイグレーション実行）
cd backend
npx prisma migrate dev

# シードデータ投入（テストアカウント作成）
cd backend
npx prisma db seed
# または
make db-seed  # プロジェクトルートから実行
```

### API開発

バックエンドは**ポート3100**で起動します。

```bash
# ヘルスチェック
curl http://localhost:3100/health

# 一般利用者登録の例
curl -X POST http://localhost:3100/api/v1/auth/register/guest \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "firstName": "太郎",
    "lastName": "山田"
  }'

# 認証が必要なAPI呼び出しの例
curl http://localhost:3100/api/v1/properties \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 開発方針

### テスト駆動開発 (TDD)

- 原則としてテスト駆動開発（TDD）で進める
- 期待される入出力に基づき、まずテストを作成する
- 実装コードは書かず、テストのみを用意する
- テストを実行し、失敗を確認する
- テストが正しいことを確認できた段階でコミットする
- その後、テストをパスさせる実装を進める
- 実装中はテストを変更せず、コードを修正し続ける
- なお、指定が無い限り適切な箇所にコメントを日本語で記載する
- すべてのテストが通過するまで繰り返す

### ドキュメント参照

- README.mdやdocsディレクトリの中身を必ず確認する
- 設計ドキュメントに従って実装する

### ドキュメントの更新

- **重要**: 実装や仕様を変更した場合、必ず関連するドキュメントも同時に更新する
- 更新が必要なドキュメント例:
  - データベーススキーマを変更 → `docs/database/schema-design.md` を更新
  - APIエンドポイントを追加・変更 → `docs/api/api-specification.md` を更新
  - フロントエンド構成を変更 → `docs/architecture/frontend-design.md` を更新
  - 技術スタックを変更 → `docs/architecture/tech-stack.md` を更新
  - 開発フェーズを変更 → `docs/architecture/development-phases.md` を更新
  - プロジェクト概要を変更 → `README.md` を更新
- ドキュメントと実装が乖離しないよう、同一のコミットで更新すること
- temp_YYYYMMDD_HHmmss.mdにドキュメント更新理由も記載すること

### 作業記録

- 追加や修正を加えるたび、毎回必ずtemp_YYYYMMDD_HHmmss.mdを作成する
- 記載内容:
  - どういった修正を行ったか
  - なぜそうしたのか
  - テストを実装・実行していた場合、今回の修正内容に対しどのようなテストを作成したか
  - 個別具体的にどのファイルをどのコミットにどのようなコミットメッセージでコミットすべきか
- 日時はファイル作成時点の日本時間で登録する
- このファイルはgit管理をしない（.gitignoreに追加済み）

## 技術スタック

### バックエンド

- **言語**: Node.js 20.x + TypeScript 5.x
- **フレームワーク**: Express.js 4.x
- **データベース**: PostgreSQL 16.x
- **ORM**: Prisma 5.x
- **認証**: JWT (jsonwebtoken + bcrypt)
- **バリデーション**: express-validator
- **セキュリティ**: helmet, cors, express-rate-limit
- **ログ**: winston, morgan
- **画像処理**: multer, sharp
- **メール**: nodemailer
- **日付処理**: date-fns

### フロントエンド（3アプリケーション共通）

- **フレームワーク**: Next.js 14 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 3.x
- **状態管理**: React Context API + Zustand 4.x
- **フォーム**: React Hook Form 7.x + Zod 3.x
- **HTTPクライアント**: Axios 1.x
- **日付処理**: date-fns
- **地図**: React Leaflet
- **通知**: react-hot-toast
- **アニメーション**: framer-motion
- **アイコン**: react-icons

### インフラ・DevOps

- **バックエンドデプロイ**: Railway（推奨）
- **フロントエンドデプロイ**: Vercel
- **画像ストレージ**: Cloudinary
- **CI/CD**: GitHub Actions
- **エラートラッキング**: Sentry
- **バージョン管理**: Git + GitHub

### 開発ツール

- **リント**: ESLint + Prettier
- **テスト**: Jest + React Testing Library
- **E2Eテスト**: Playwright

## プロジェクト構成

```
booking/
├── docs/                           # 設計ドキュメント
│   ├── architecture/               # アーキテクチャ設計
│   ├── api/                        # API仕様
│   ├── database/                   # データベース設計
│   └── ui/                         # UI設計
├── backend/                        # バックエンドアプリケーション
│   ├── src/
│   │   ├── app.ts                  # Expressアプリケーション設定
│   │   ├── index.ts                # エントリーポイント
│   │   ├── config/                 # 環境変数・設定
│   │   ├── controllers/            # コントローラー層
│   │   ├── services/               # ビジネスロジック層
│   │   ├── routes/                 # ルート定義
│   │   ├── middleware/             # ミドルウェア
│   │   ├── utils/                  # ユーティリティ
│   │   └── types/                  # 型定義
│   ├── prisma/
│   │   └── schema.prisma           # Prismaスキーマ
│   └── package.json
├── frontend-guest/                 # 一般利用者向けフロントエンド
├── frontend-owner/                 # 施設オーナー向けフロントエンド
├── frontend-admin/                 # 管理者向けフロントエンド
├── database/                       # データベース関連
├── README.md                       # プロジェクト概要
└── CLAUDE.md                       # このファイル
```

## バックエンドアーキテクチャ

### レイヤー構造

```
routes (ルート定義)
  ↓
controllers (リクエスト処理・レスポンス生成)
  ↓
services (ビジネスロジック)
  ↓
Prisma (データアクセス層)
  ↓
PostgreSQL (データベース)
```

### ミドルウェアチェーン

1. **helmet** - セキュリティヘッダー設定
2. **cors** - CORS設定
3. **express.json/urlencoded** - リクエストボディパース
4. **morgan** - HTTPリクエストログ
5. **routes** - 各種ルート
6. **notFoundHandler** - 404エラーハンドラー
7. **errorHandler** - 統一エラーハンドラー

### 認証フロー

1. ユーザーがログイン → JWT発行
2. クライアントがトークンを保存
3. 保護されたエンドポイントへのリクエスト時、`Authorization: Bearer <token>` ヘッダーを付与
4. `auth.middleware.ts` がトークンを検証
5. 有効な場合、`req.user` にユーザー情報を設定
6. コントローラーで `req.user` を利用

## 実装済み機能

### バックエンドAPI（全32エンドポイント実装済み）

#### 認証API (auth.routes.ts)
- ✅ 一般利用者登録 `POST /api/v1/auth/register/guest`
- ✅ オーナー登録（招待トークン必須） `POST /api/v1/auth/register/owner`
- ✅ ログイン `POST /api/v1/auth/login`
- ✅ ログアウト `POST /api/v1/auth/logout`
- ✅ プロフィール取得 `GET /api/v1/auth/me`
- ✅ プロフィール更新 `PUT /api/v1/auth/profile`
- ✅ パスワード変更 `PUT /api/v1/auth/password`

#### 物件管理API (property.routes.ts)
- ✅ 公開中の物件一覧取得 `GET /api/v1/properties`
- ✅ オーナーの物件一覧取得 `GET /api/v1/properties/my` (オーナー/管理者専用)
- ✅ 物件詳細取得 `GET /api/v1/properties/:id`
- ✅ 物件作成 `POST /api/v1/properties` (オーナー/管理者専用)
- ✅ 物件更新 `PUT /api/v1/properties/:id` (オーナー/管理者専用)
- ✅ 物件削除 `DELETE /api/v1/properties/:id` (オーナー/管理者専用)

#### 部屋管理API (room.routes.ts)
- ✅ 物件の部屋一覧取得（公開） `GET /api/v1/rooms/property/:propertyId`
- ✅ 自分の物件の部屋一覧取得 `GET /api/v1/rooms/my/:propertyId` (オーナー/管理者専用)
- ✅ 部屋詳細取得 `GET /api/v1/rooms/:id`
- ✅ 部屋作成 `POST /api/v1/rooms` (オーナー/管理者専用)
- ✅ 部屋更新 `PUT /api/v1/rooms/:id` (オーナー/管理者専用)
- ✅ 部屋削除 `DELETE /api/v1/rooms/:id` (オーナー/管理者専用)

#### 予約管理API (booking.routes.ts)
- ✅ 予約作成 `POST /api/v1/bookings` (ゲスト/管理者専用)
- ✅ 自分の予約一覧取得 `GET /api/v1/bookings/my` (ゲスト/管理者専用)
- ✅ オーナーの予約一覧取得 `GET /api/v1/bookings/owner` (オーナー/管理者専用)
- ✅ 予約詳細取得 `GET /api/v1/bookings/:id` (認証必須)
- ✅ 予約キャンセル `POST /api/v1/bookings/:id/cancel` (認証必須)
- ✅ 予約ステータス更新 `PUT /api/v1/bookings/:id/status` (オーナー/管理者専用)

#### 招待管理API (invitation.routes.ts)
- ✅ 招待作成 `POST /api/v1/admin/invitations` (管理者専用)
- ✅ 招待トークン検証 `GET /api/v1/invitations/validate/:token` (認証不要)
- ✅ 招待一覧取得 `GET /api/v1/admin/invitations` (管理者専用)
- ✅ 招待削除 `DELETE /api/v1/admin/invitations/:id` (管理者専用)

### フロントエンド実装状況

#### Guest（一般利用者向け）- 11ページ
- ✅ ランディングページ
- ✅ ログインページ
- ✅ 一般利用者登録ページ
- ✅ ダッシュボード
- ✅ プロフィール表示・編集ページ
- ✅ パスワード変更ページ
- ✅ 物件一覧ページ（フィルタリング機能付き）
- ✅ 物件詳細ページ
- ✅ 予約一覧ページ
- ✅ 予約詳細ページ
- ✅ API連携（26メソッド）、Zustand状態管理、認証フロー完備

#### Owner（施設オーナー向け）- 13ページ
- ✅ ルートページ（認証状態チェック）
- ✅ ログインページ
- ✅ オーナー登録ページ（招待トークン検証付き）
- ✅ ダッシュボード
- ✅ プロフィール表示・編集ページ
- ✅ パスワード変更ページ
- ✅ 物件一覧ページ（ステータスフィルタ付き）
- ✅ 物件詳細ページ
- ✅ 物件新規作成ページ
- ✅ 部屋編集ページ
- ✅ 予約一覧ページ（オーナー向け）
- ✅ 予約詳細・ステータス管理ページ
- ✅ API連携（25メソッド）、Zustand状態管理、認証フロー完備

#### Admin（管理者向け）- 4ページ
- ✅ ルートページ（認証状態チェック）
- ✅ ログインページ
- ✅ 管理者ダッシュボード
- ✅ 招待管理ページ（作成・一覧・削除、URLコピー機能）
- ✅ API連携（8メソッド）、Zustand状態管理、認証フロー完備

### データベース（10テーブル実装済み）
- ✅ users - 全ユーザー共通情報
- ✅ guest_profiles - 一般利用者プロフィール
- ✅ owner_profiles - 施設オーナープロフィール
- ✅ properties - 宿泊施設
- ✅ rooms - 部屋
- ✅ property_images - 物件画像
- ✅ room_images - 部屋画像
- ✅ property_amenities - 物件設備
- ✅ bookings - 予約
- ✅ invitations - 招待（OWNER/ADMIN登録用）

## 重要な設計ドキュメント

### 必読ドキュメント

1. **[README.md](README.md)** - プロジェクト全体概要
2. **[データベース設計](docs/database/schema-design.md)** - ER図、テーブル定義
3. **[API仕様](docs/api/api-specification.md)** - 全エンドポイント定義
4. **[フロントエンド設計](docs/architecture/frontend-design.md)** - 3つのフロントエンド構成
5. **[技術スタック](docs/architecture/tech-stack.md)** - 技術選定理由
6. **[開発フェーズ](docs/architecture/development-phases.md)** - 開発計画

## データベース設計の要点

### 主要テーブル（10テーブル実装済み）

1. **users** - 全ユーザー共通（guest/owner/admin）
2. **guest_profiles** - 一般利用者プロフィール
3. **owner_profiles** - 施設オーナープロフィール
4. **properties** - 宿泊施設
5. **rooms** - 部屋
6. **property_images** - 施設画像
7. **room_images** - 部屋画像
8. **property_amenities** - 施設設備
9. **bookings** - 予約
10. **invitations** - 招待（owner/admin登録用）

### 主キー

- すべてのテーブルでUUIDを使用

### 認証・認可

- **ロール**: GUEST（一般利用者）、OWNER（施設オーナー）、ADMIN（管理者）
- **招待制**: ✅ OWNERとADMINは招待トークン必須（実装済み）
- **JWT認証**: ✅ Authorization Bearerヘッダーで管理（実装済み）
- **パスワード**: ✅ bcryptでハッシュ化（コスト係数12）
- **トークン検証**: ✅ ミドルウェアで自動検証

## API設計の要点

### ベースURL

```
開発環境: http://localhost:3100/api/v1
本番環境: https://api.booking-service.example.com/v1
```

### 認証

```
Authorization: Bearer <token>
```

### 主要APIカテゴリ

1. **認証・認可API** ✅ - ログイン、登録、プロフィール管理、パスワード変更
2. **施設管理API** ✅ - 施設CRUD、公開/非公開管理
3. **部屋管理API** ✅ - 部屋CRUD、ステータス管理
4. **予約管理API** ✅ - 予約CRUD、キャンセル、ステータス更新
5. **招待管理API** ✅ - 招待CRUD、トークン検証（管理者向け）
6. **レビューAPI** 🚧 - レビュー投稿、オーナー返信（未実装）
7. **通知API** 🚧 - 通知一覧、既読管理（未実装）
8. **統計API** 🚧 - 売上、予約統計（未実装）

## 開発フェーズ

### 現在の状況: フェーズ1完了、フェーズ2-3も大部分実装済み

#### 実装済み機能（フェーズ0-3相当）

**フェーズ0: プロジェクトセットアップ** ✅ 完了
- ✅ プロジェクト初期セットアップ
- ✅ データベーススキーマ設計（10テーブル）
- ✅ Prismaセットアップとマイグレーション
- ✅ バックエンドAPI基盤構築（Express + TypeScript）
- ✅ 3つのフロントエンド初期構築（Next.js 14）

**フェーズ1: 認証・ユーザー管理** ✅ 完了
- ✅ 一般利用者登録・ログイン（バックエンド + Guest フロントエンド）
- ✅ オーナー登録（招待トークン必須、バックエンド + Owner フロントエンド）
- ✅ 管理者向け招待システム（バックエンド + Admin フロントエンド）
- ✅ JWT認証・認可ミドルウェア
- ✅ プロフィール管理機能（表示・編集）
- ✅ パスワード変更機能
- ✅ ロール別アクセス制御（GUEST/OWNER/ADMIN）

**フェーズ2: 施設管理** ✅ 大部分完了
- ✅ 物件CRUD機能（バックエンド + Owner フロントエンド）
- ✅ 物件一覧・詳細表示（Guest フロントエンド）
- ✅ 物件ステータス管理（DRAFT/PUBLISHED/SUSPENDED/CLOSED）
- ✅ 部屋CRUD機能（バックエンド + Owner フロントエンド）
- ✅ 部屋一覧・詳細表示（Guest フロントエンド）
- 🚧 画像アップロード機能（未実装）
- 🚧 設備管理UI（未実装）

**フェーズ3: 予約管理** ✅ 大部分完了
- ✅ 予約作成機能（バックエンド + Guest フロントエンド）
- ✅ 予約一覧・詳細表示（Guest/Owner フロントエンド）
- ✅ 予約キャンセル機能
- ✅ 予約ステータス管理（PENDING/CONFIRMED/CHECKED_IN/CHECKED_OUT/CANCELLED）
- ✅ オーナー向け予約管理（ステータス更新）
- 🚧 空室検索機能（未実装）
- 🚧 料金計算ロジック（簡易版のみ）

#### 未実装機能（フェーズ4以降）

**フェーズ4: レビュー機能** 🚧 未実装
**フェーズ5: 通知機能** 🚧 未実装
**フェーズ6: 管理者機能強化** 🚧 一部実装済み（招待システム）
**フェーズ7: オーナー分析機能** 🚧 未実装
**フェーズ8: UI/UX改善・最適化** 🚧 未実装
**フェーズ9: セキュリティ強化** 🚧 一部実装済み（JWT、bcrypt、バリデーション）
**フェーズ10: テスト・デバッグ** 🚧 一部実装済み（auth.controller.test.ts のみ）
**フェーズ11: デプロイ準備** 🚧 未実装
**フェーズ12: リリース・運用開始** 🚧 未実装

詳細は [開発フェーズ](docs/architecture/development-phases.md) を参照。

## コーディング規約

### TypeScript

- 厳格な型チェック（strict mode）
- anyの使用を最小限に
- インターフェースと型エイリアスの適切な使い分け

### コメント

- 日本語で記載
- 複雑なロジックには必ずコメント
- 関数・クラスにはJSDocコメント

### 命名規則

- **ファイル名**: kebab-case（例: user-service.ts）
- **変数・関数**: camelCase（例: getUserById）
- **クラス・インターフェース**: PascalCase（例: UserService）
- **定数**: UPPER_SNAKE_CASE（例: MAX_FILE_SIZE）
- **コンポーネント**: PascalCase（例: PropertyCard.tsx）

### ディレクトリ構造

- 機能ごとにディレクトリを分ける
- 共通機能は common/ または shared/
- テストファイルは同階層に配置（例: user.service.ts → user.service.test.ts）

## Git運用

### ブランチ戦略

- `main`: 本番環境
- `develop`: 開発環境
- `feature/*`: 機能開発
- `hotfix/*`: 緊急修正

### コミットメッセージ

```
<type>(<scope>): <subject>

例:
feat(auth): ユーザー登録APIを実装
fix(booking): 予約の重複チェックを修正
docs(readme): APIドキュメントを更新
test(property): 施設登録のテストを追加
```

**type一覧:**
- feat: 新機能
- fix: バグ修正
- docs: ドキュメント
- style: フォーマット
- refactor: リファクタリング
- test: テスト
- chore: その他

### Pull Request

- PRには必ず説明を記載
- レビュー後にマージ
- mainへのマージは承認必須

## テスト戦略

### カバレッジ目標

- 単体テスト: 80%以上
- E2Eテスト: 主要フローをカバー

### テストの種類

1. **単体テスト** (Jest)
   - ビジネスロジック
   - ユーティリティ関数
   - APIエンドポイント

2. **コンポーネントテスト** (React Testing Library)
   - Reactコンポーネント
   - フック

3. **E2Eテスト** (Playwright)
   - ユーザーフロー
   - クロスブラウザ

### テスト実行

#### バックエンドテスト

```bash
cd backend

# 全テスト実行
npm test

# ウォッチモード（開発中に便利）
npm run test:watch

# カバレッジ測定
npm run test:coverage

# 単一テストファイルのみ実行
npm test -- auth.controller.test.ts

# 特定のテストケースのみ実行
npm test -- -t "ユーザー登録"
```

#### フロントエンドテスト（未実装）

```bash
# 各フロントエンドで実行
cd frontend/guest  # または frontend/owner, frontend/admin

# 単体テスト
npm test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:coverage
```

## セキュリティ

### 必須対策

- [x] パスワードのハッシュ化（bcrypt、コスト係数12）
- [x] JWTトークンの適切な管理
- [x] HTTPSの使用
- [x] CSRF対策
- [x] XSS対策（入力のサニタイズ）
- [x] SQLインジェクション対策（Prismaのパラメータ化クエリ）
- [ ] レート制限（将来実装）
- [x] セキュリティヘッダー（helmet）
- [x] 入力バリデーション

### 機密情報の管理

- 環境変数で管理（.env）
- .envファイルはGitに含めない
- 本番環境の環境変数はデプロイ先で設定

## トラブルシューティング

### よくある問題

1. **Prismaマイグレーションエラー**
   ```bash
   cd backend
   npx prisma migrate reset   # データベースリセット
   npx prisma generate         # Prismaクライアント再生成
   ```

2. **ポート番号について**
   - 各サービスのポート番号は「アクセスURL」セクションを参照
   - 注: 3000番台は使用済みのため、3100番台を使用

3. **CORS エラー**
   - バックエンドのCORS設定を確認（`backend/src/app.ts`）
   - 環境変数 `CORS_ORIGIN` でフロントエンドURLを設定

4. **開発サーバーが起動しない**
   ```bash
   # ポートが使用中の場合
   lsof -i :3100           # プロセス確認
   kill -9 <PID>           # プロセス終了

   # または
   pkill -f "tsx watch"    # tsx watchプロセスを強制終了
   ```

5. **データベース接続エラー**
   ```bash
   # Dockerコンテナが起動しているか確認
   docker compose ps

   # 起動していない場合
   docker compose up -d

   # DATABASE_URL環境変数を確認
   cat backend/.env
   ```

6. **テストアカウントでログインできない**
   ```bash
   # テストアカウントを再作成
   make db-seed

   # テストアカウント情報はREADME.mdを参照
   # Admin: admin@example.com / Admin123!
   # Guest: guest@example.com / Guest123!
   # Owner: owner-test@example.com / Owner123!
   ```

## 注意事項

### Git運用

- Git初期化とコミットはユーザー側で実施
- Claudeはファイル作成・修正のみ実施

### 作業記録

- 毎回temp_YYYYMMDD_HHmmss.mdで作業内容を記録
- 日時は日本時間で記載

### TDD厳守

- テストファースト
- テストが通るまで実装を修正
- コミットはテスト通過後
