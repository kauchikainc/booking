# Booking Backend API

民泊・ゲストハウス予約サービスのバックエンドAPI

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、必要な値を設定してください。

```bash
cp .env.example .env
```

### 3. データベースのセットアップ

PostgreSQLデータベースを用意し、マイグレーションを実行します。

```bash
# Prismaクライアントを生成
npx prisma generate

# マイグレーションを実行
npx prisma migrate dev --name init

# (オプション) Prisma Studioでデータを確認
npx prisma studio
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

サーバーが起動したら、以下のURLでヘルスチェックを確認できます:
http://localhost:3100/health

## スクリプト

- `npm run dev` - 開発サーバーを起動（ホットリロード有効）
- `npm run build` - TypeScriptをビルド
- `npm start` - ビルド済みのサーバーを起動
- `npm run lint` - ESLintでコードをチェック
- `npm run format` - Prettierでコードをフォーマット
- `npm run type-check` - TypeScriptの型チェック

## ディレクトリ構成

```
src/
├── config/          # 設定ファイル
├── controllers/     # コントローラー
├── middleware/      # ミドルウェア
├── routes/          # ルート定義
├── services/        # ビジネスロジック
├── types/           # TypeScript型定義
├── utils/           # ユーティリティ関数
├── app.ts           # Expressアプリケーション設定
└── index.ts         # エントリーポイント
```

## API仕様

詳細なAPI仕様は [docs/api/api-specification.md](../docs/api/api-specification.md) を参照してください。

## 開発ガイドライン

- TDD（テスト駆動開発）で進める
- コミット前に必ずリント・型チェックを実行
- 日本語でコメントを記載
