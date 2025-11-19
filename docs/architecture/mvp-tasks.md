# MVP開発タスクリスト

## MVP開発方針

各サービス（バックエンド + 3つのフロントエンド）が最小構成で動作する状態を目指し、段階的に機能を追加していきます。

### MVP v0.1: 最小動作確認（Week 1）
- 全サービスが起動し、ヘルスチェックが通る
- 基本的な認証機能（ログイン・登録）

### MVP v0.2: コア機能（Week 2-3）
- 施設の登録・一覧表示
- 予約機能（基本）

### MVP v0.3: 完全機能（Week 4-5）
- レビュー機能
- 管理者機能
- 通知機能

---

## Phase 1: バックエンド最小構成（MVP v0.1）

### タスク1.1: プロジェクト初期化
- [x] ドキュメント作成完了
- [ ] `backend/` ディレクトリ作成
- [ ] `npm init -y` でpackage.json作成
- [ ] TypeScript設定（tsconfig.json）
- [ ] ESLint + Prettier設定
- [ ] `.env.example` 作成
- [ ] 基本的なディレクトリ構造作成

**作成するファイル:**
```
backend/
├── src/
│   ├── index.ts              # エントリーポイント
│   ├── app.ts                # Express設定
│   ├── config/
│   │   └── index.ts          # 環境変数管理
│   ├── middleware/
│   │   └── error-handler.ts  # エラーハンドリング
│   ├── routes/
│   │   └── health.ts         # ヘルスチェック
│   └── utils/
│       └── logger.ts         # ロガー
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
└── package.json
```

**必要なパッケージ:**
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/node": "^20.10.5",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.1",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0"
  }
}
```

**確認方法:**
```bash
cd backend
npm install
npm run dev
# http://localhost:3000/health で "OK" が返る
```

---

### タスク1.2: Prismaセットアップ
- [ ] Prismaインストール
- [ ] `prisma/schema.prisma` 作成
- [ ] 最小限のスキーマ定義（users, guest_profiles のみ）
- [ ] PostgreSQL接続設定
- [ ] 初回マイグレーション実行

**必要なパッケージ:**
```json
{
  "dependencies": {
    "@prisma/client": "^5.7.1"
  },
  "devDependencies": {
    "prisma": "^5.7.1"
  }
}
```

**最小スキーマ（prisma/schema.prisma）:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  role          Role     @default(GUEST)
  status        Status   @default(ACTIVE)
  emailVerified Boolean  @default(false) @map("email_verified")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  guestProfile GuestProfile?

  @@map("users")
}

model GuestProfile {
  id        String   @id @default(uuid())
  userId    String   @unique @map("user_id")
  firstName String?  @map("first_name")
  lastName  String?  @map("last_name")
  phone     String?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("guest_profiles")
}

enum Role {
  GUEST
  OWNER
  ADMIN
}

enum Status {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

**確認方法:**
```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio  # ブラウザでDBを確認
```

---

### タスク1.3: 認証API実装（最小限）
- [ ] bcryptインストール
- [ ] jsonwebtoken インストール
- [ ] ユーザー登録API（POST /api/v1/auth/register/guest）
- [ ] ログインAPI（POST /api/v1/auth/login）
- [ ] 認証ミドルウェア実装
- [ ] プロフィール取得API（GET /api/v1/auth/me）

**必要なパッケージ:**
```json
{
  "dependencies": {
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "express-validator": "^7.0.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5"
  }
}
```

**作成するファイル:**
```
backend/src/
├── controllers/
│   └── auth.controller.ts
├── services/
│   └── auth.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── validate.middleware.ts
├── routes/
│   └── auth.routes.ts
├── types/
│   └── express.d.ts
└── utils/
    ├── jwt.ts
    └── password.ts
```

**確認方法:**
```bash
# 登録
curl -X POST http://localhost:3000/api/v1/auth/register/guest \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","firstName":"太郎","lastName":"山田"}'

# ログイン
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# プロフィール取得
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## Phase 2: フロントエンド最小構成（MVP v0.1）

### タスク2.1: 一般利用者向けフロントエンド初期化
- [ ] `frontend-guest/` ディレクトリ作成
- [ ] Next.js 14プロジェクト初期化
- [ ] Tailwind CSS設定
- [ ] `.env.example` 作成
- [ ] 基本レイアウト作成

**コマンド:**
```bash
npx create-next-app@latest frontend-guest --typescript --tailwind --app --no-src
cd frontend-guest
```

**選択肢:**
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: No

**作成するファイル:**
```
frontend-guest/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # トップページ
│   └── globals.css
├── components/
│   └── common/
│       ├── Header.tsx
│       └── Footer.tsx
├── .env.example
└── package.json
```

**確認方法:**
```bash
npm run dev
# http://localhost:3101 でページが表示される
```

---

### タスク2.2: オーナー向けフロントエンド初期化
- [ ] `frontend-owner/` ディレクトリ作成
- [ ] Next.js 14プロジェクト初期化
- [ ] Tailwind CSS設定
- [ ] 基本レイアウト作成（ダッシュボード風）

**確認方法:**
```bash
npm run dev -- -p 3102
# http://localhost:3102 でページが表示される
```

---

### タスク2.3: 管理者向けフロントエンド初期化
- [ ] `frontend-admin/` ディレクトリ作成
- [ ] Next.js 14プロジェクト初期化
- [ ] Tailwind CSS設定
- [ ] 基本レイアウト作成（管理画面風）

**確認方法:**
```bash
npm run dev -- -p 3103
# http://localhost:3103 でページが表示される
```

---

## Phase 3: 認証機能実装（フロントエンド）（MVP v0.1）

### タスク3.1: 共通ライブラリインストール（3つすべて）
- [ ] axios
- [ ] react-hook-form
- [ ] zod
- [ ] zustand
- [ ] react-hot-toast

**各フロントエンドで実行:**
```bash
npm install axios react-hook-form zod @hookform/resolvers zustand react-hot-toast
```

---

### タスク3.2: 一般利用者向け - 認証画面
- [ ] APIクライアント設定（`lib/api/client.ts`）
- [ ] 認証コンテキスト（`contexts/AuthContext.tsx`）
- [ ] ログインページ（`app/auth/login/page.tsx`）
- [ ] 登録ページ（`app/auth/register/page.tsx`）
- [ ] プロフィールページ（`app/profile/page.tsx`）
- [ ] 認証済みルート保護

**作成するファイル:**
```
frontend-guest/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   └── profile/
│       └── page.tsx
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       └── RegisterForm.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   └── auth.ts
│   └── validations/
│       └── auth.ts
└── types/
    └── user.ts
```

**確認方法:**
1. http://localhost:3101/auth/register で登録
2. http://localhost:3101/auth/login でログイン
3. http://localhost:3101/profile でプロフィール表示

---

### タスク3.3: オーナー向け - 認証画面
- [ ] APIクライアント設定
- [ ] 認証コンテキスト
- [ ] ログインページ
- [ ] ダッシュボードページ

**簡易版（招待機能は後回し）:**
- オーナー登録は管理者向け画面から直接DBに追加する形で仮実装

---

### タスク3.4: 管理者向け - 認証画面
- [ ] APIクライアント設定
- [ ] 認証コンテキスト
- [ ] ログインページ
- [ ] ダッシュボードページ

**初期管理者:**
- マイグレーションまたはシードで初期管理者を作成

---

## Phase 4: 施設機能実装（MVP v0.2）

### タスク4.1: データベーススキーマ拡張
- [ ] properties テーブル追加
- [ ] property_images テーブル追加
- [ ] amenity_types テーブル追加
- [ ] property_amenities テーブル追加
- [ ] マイグレーション実行
- [ ] アメニティシードデータ投入

---

### タスク4.2: 施設管理API実装
- [ ] 施設登録API（POST /api/v1/properties）
- [ ] 施設一覧API（GET /api/v1/properties）
- [ ] 施設詳細API（GET /api/v1/properties/:id）
- [ ] 施設更新API（PUT /api/v1/properties/:id）
- [ ] アメニティ一覧API（GET /api/v1/amenities）

---

### タスク4.3: オーナー向け - 施設管理画面
- [ ] 施設一覧ページ
- [ ] 施設登録ページ
- [ ] 施設編集ページ

---

### タスク4.4: 一般利用者向け - 施設閲覧画面
- [ ] トップページ（施設一覧）
- [ ] 施設詳細ページ
- [ ] 簡易検索機能

---

## Phase 5: 予約機能実装（MVP v0.2）

### タスク5.1: データベーススキーマ拡張
- [ ] bookings テーブル追加
- [ ] availability テーブル追加
- [ ] マイグレーション実行

---

### タスク5.2: 予約管理API実装
- [ ] 空き状況取得API（GET /api/v1/properties/:id/availability）
- [ ] 予約作成API（POST /api/v1/bookings）
- [ ] 予約一覧API（GET /api/v1/bookings）
- [ ] 予約詳細API（GET /api/v1/bookings/:id）

---

### タスク5.3: 一般利用者向け - 予約画面
- [ ] 施設詳細ページに予約フォーム追加
- [ ] 予約確認ページ
- [ ] 予約一覧ページ
- [ ] 予約詳細ページ

---

### タスク5.4: オーナー向け - 予約管理画面
- [ ] 予約一覧ページ
- [ ] 予約詳細ページ
- [ ] 空き枠管理ページ（簡易版）

---

## Phase 6: その他機能実装（MVP v0.3）

### タスク6.1: レビュー機能
- [ ] データベーススキーマ（reviews）
- [ ] レビューAPI
- [ ] 一般利用者向けレビュー投稿画面
- [ ] オーナー向けレビュー確認画面

---

### タスク6.2: 通知機能
- [ ] データベーススキーマ（notifications）
- [ ] 通知API
- [ ] 各フロントエンドに通知バッジ追加

---

### タスク6.3: 管理者機能
- [ ] データベーススキーマ（invitations, owner_profiles）
- [ ] 招待API
- [ ] オーナー招待画面
- [ ] ユーザー一覧画面
- [ ] 施設一覧・審査画面

---

## マイルストーン

### MVP v0.1 完了条件（Week 1終了時）
- [x] バックエンドが起動し、ヘルスチェックが通る
- [ ] 3つのフロントエンドがすべて起動する
- [ ] 一般利用者が登録・ログインできる
- [ ] 各画面間の遷移が動作する

### MVP v0.2 完了条件（Week 3終了時）
- [ ] オーナーが施設を登録できる
- [ ] 一般利用者が施設を検索・閲覧できる
- [ ] 一般利用者が予約を作成できる
- [ ] オーナーが予約を確認できる

### MVP v0.3 完了条件（Week 5終了時）
- [ ] レビュー機能が動作する
- [ ] 通知機能が動作する
- [ ] 管理者がユーザー・施設を管理できる
- [ ] 全体が統合されて動作する

---

## 開発の進め方

### 1日の作業フロー
1. TodoWriteでタスクをin_progressに設定
2. 必要に応じてテストを先に作成（TDD）
3. 実装
4. 動作確認
5. TodoWriteでタスクをcompletedに設定
6. temp_YYYYMMDD_HHmmss.mdに作業記録
7. コミット準備（ユーザー側で実施）

### 優先順位
1. **バックエンドAPI** → **フロントエンド実装** の順
2. **一般利用者向け** を優先（コア機能）
3. **オーナー向け**、**管理者向け** は段階的に

### テスト
- MVP v0.1では手動テスト中心
- MVP v0.2以降で自動テスト追加

---

## 次のステップ

まず **Phase 1: バックエンド最小構成** の **タスク1.1: プロジェクト初期化** から開始します。
