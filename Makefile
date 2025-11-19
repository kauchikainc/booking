# 民泊・ゲストハウス予約サービス - Makefile
# 使用方法: make [target]

.PHONY: help start stop restart status install clean test build

# デフォルトターゲット
.DEFAULT_GOAL := help

# プロジェクトルート
PROJECT_ROOT := $(shell pwd)

# 色定義
GREEN  := \033[0;32m
YELLOW := \033[1;33m
BLUE   := \033[0;34m
RED    := \033[0;31m
NC     := \033[0m # No Color

##@ 全般

help: ## このヘルプメッセージを表示
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  民泊・ゲストハウス予約サービス - Makefile$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf ""} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ サーバー起動・停止

start: ## すべてのサーバーを起動（tmux使用）
	@echo "$(GREEN)すべてのサーバーを起動中...$(NC)"
	@./start-all.sh

stop: ## すべてのサーバーを停止
	@echo "$(YELLOW)すべてのサーバーを停止中...$(NC)"
	@-tmux kill-session -t booking-service 2>/dev/null || true
	@-pkill -f "tsx watch src/index.ts" 2>/dev/null || true
	@-pkill -f "next dev" 2>/dev/null || true
	@-pkill -f "prisma studio" 2>/dev/null || true
	@-pkill -f "npm run dev" 2>/dev/null || true
	@echo "$(GREEN)✓ すべてのサーバーを停止しました$(NC)"

restart: stop db-generate start ## すべてのサーバーを再起動（Prismaクライアント再生成含む）

status: ## サーバーの起動状況を確認
	@echo "$(BLUE)サーバー起動状況:$(NC)"
	@echo ""
	@echo "$(YELLOW)ポート 3100 (Backend):$(NC)"
	@lsof -i :3100 -sTCP:LISTEN || echo "  $(RED)停止中$(NC)"
	@echo ""
	@echo "$(YELLOW)ポート 3101 (Guest):$(NC)"
	@lsof -i :3101 -sTCP:LISTEN || echo "  $(RED)停止中$(NC)"
	@echo ""
	@echo "$(YELLOW)ポート 3102 (Owner):$(NC)"
	@lsof -i :3102 -sTCP:LISTEN || echo "  $(RED)停止中$(NC)"
	@echo ""
	@echo "$(YELLOW)ポート 3103 (Admin):$(NC)"
	@lsof -i :3103 -sTCP:LISTEN || echo "  $(RED)停止中$(NC)"
	@echo ""
	@echo "$(YELLOW)ポート 5555 (Prisma Studio):$(NC)"
	@lsof -i :5555 -sTCP:LISTEN || echo "  $(RED)停止中$(NC)"
	@echo ""

##@ 開発

install: ## すべての依存関係をインストール
	@echo "$(GREEN)バックエンドの依存関係をインストール中...$(NC)"
	@cd backend && npm install
	@echo ""
	@echo "$(GREEN)Guest フロントエンドの依存関係をインストール中...$(NC)"
	@cd frontend/guest && npm install
	@echo ""
	@echo "$(GREEN)Owner フロントエンドの依存関係をインストール中...$(NC)"
	@cd frontend/owner && npm install
	@echo ""
	@echo "$(GREEN)Admin フロントエンドの依存関係をインストール中...$(NC)"
	@cd frontend/admin && npm install
	@echo ""
	@echo "$(GREEN)✓ すべての依存関係をインストールしました$(NC)"

clean: ## node_modules と .next を削除
	@echo "$(YELLOW)クリーニング中...$(NC)"
	@rm -rf backend/node_modules backend/.next
	@rm -rf frontend/guest/node_modules frontend/guest/.next
	@rm -rf frontend/owner/node_modules frontend/owner/.next
	@rm -rf frontend/admin/node_modules frontend/admin/.next
	@echo "$(GREEN)✓ クリーニング完了$(NC)"

build: ## すべてのプロジェクトをビルド
	@echo "$(GREEN)バックエンドをビルド中...$(NC)"
	@cd backend && npm run build
	@echo ""
	@echo "$(GREEN)Guest フロントエンドをビルド中...$(NC)"
	@cd frontend/guest && npm run build
	@echo ""
	@echo "$(GREEN)Owner フロントエンドをビルド中...$(NC)"
	@cd frontend/owner && npm run build
	@echo ""
	@echo "$(GREEN)Admin フロントエンドをビルド中...$(NC)"
	@cd frontend/admin && npm run build
	@echo ""
	@echo "$(GREEN)✓ すべてのビルドが完了しました$(NC)"

##@ テスト

test: ## すべてのテストを実行
	@echo "$(GREEN)バックエンドのテストを実行中...$(NC)"
	@cd backend && npm test
	@echo "$(GREEN)✓ テスト完了$(NC)"

test-watch: ## テストをウォッチモードで実行
	@echo "$(GREEN)テストをウォッチモードで実行中...$(NC)"
	@cd backend && npm run test:watch

##@ データベース

db-migrate: ## データベースマイグレーションを実行
	@echo "$(GREEN)データベースマイグレーションを実行中...$(NC)"
	@cd backend && npx prisma migrate dev
	@echo "$(GREEN)✓ マイグレーション完了$(NC)"

db-reset: ## データベースをリセット
	@echo "$(YELLOW)データベースをリセット中...$(NC)"
	@cd backend && npx prisma migrate reset --force
	@echo "$(GREEN)✓ データベースリセット完了$(NC)"

db-studio: ## Prisma Studio を起動
	@echo "$(GREEN)Prisma Studio を起動中...$(NC)"
	@cd backend && npx prisma studio

db-generate: ## Prisma Client を生成
	@echo "$(GREEN)Prisma Client を生成中...$(NC)"
	@cd backend && npx prisma generate
	@echo "$(GREEN)✓ Prisma Client 生成完了$(NC)"

db-seed: ## テストアカウントを作成
	@echo "$(GREEN)テストアカウントを作成中...$(NC)"
	@cd backend && npx tsx scripts/create-test-accounts.ts
	@echo ""
	@echo "$(BLUE)テストアカウント情報:$(NC)"
	@echo "  Admin: admin@example.com / Admin123!"
	@echo "  Guest: guest@example.com / Guest123!"
	@echo "  Owner: owner-test@example.com / Owner123!"

##@ 個別サーバー起動（開発用）

backend: ## バックエンドのみ起動
	@echo "$(GREEN)バックエンドを起動中 (ポート 3100)...$(NC)"
	@cd backend && npm run dev

guest: ## Guest フロントエンドのみ起動
	@echo "$(GREEN)Guest フロントエンドを起動中 (ポート 3101)...$(NC)"
	@cd frontend/guest && npm run dev

owner: ## Owner フロントエンドのみ起動
	@echo "$(GREEN)Owner フロントエンドを起動中 (ポート 3102)...$(NC)"
	@cd frontend/owner && npm run dev

admin: ## Admin フロントエンドのみ起動
	@echo "$(GREEN)Admin フロントエンドを起動中 (ポート 3103)...$(NC)"
	@cd frontend/admin && npm run dev

##@ リント・フォーマット

lint: ## すべてのプロジェクトをリント
	@echo "$(GREEN)バックエンドをリント中...$(NC)"
	@cd backend && npm run lint || true
	@echo ""
	@echo "$(GREEN)Guest フロントエンドをリント中...$(NC)"
	@cd frontend/guest && npm run lint || true
	@echo ""
	@echo "$(GREEN)Owner フロントエンドをリント中...$(NC)"
	@cd frontend/owner && npm run lint || true
	@echo ""
	@echo "$(GREEN)Admin フロントエンドをリント中...$(NC)"
	@cd frontend/admin && npm run lint || true

format: ## すべてのプロジェクトをフォーマット
	@echo "$(GREEN)バックエンドをフォーマット中...$(NC)"
	@cd backend && npm run format || true
	@echo ""
	@echo "$(GREEN)✓ フォーマット完了$(NC)"

##@ Git

commit: ## 変更をコミット（作業記録ファイルを含む）
	@echo "$(YELLOW)最新の作業記録ファイルを確認してください$(NC)"
	@ls -lt temp_*.md | head -5
	@echo ""
	@echo "$(BLUE)Git status:$(NC)"
	@git status
	@echo ""
	@echo "$(YELLOW)コミットメッセージを入力してください:$(NC)"
	@read -p "> " msg; git add . && git commit -m "$$msg"

##@ ドキュメント

docs: ## ドキュメントディレクトリを表示
	@echo "$(BLUE)利用可能なドキュメント:$(NC)"
	@ls -lh docs/
	@echo ""
	@echo "$(BLUE)主要ドキュメント:$(NC)"
	@echo "  • README.md"
	@echo "  • CLAUDE.md"
	@echo "  • docs/architecture/system-design.md"
	@echo "  • docs/database/schema-design.md"
	@echo "  • docs/api/api-specification.md"

##@ 情報

info: ## プロジェクト情報を表示
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo "$(BLUE)  民泊・ゲストハウス予約サービス$(NC)"
	@echo "$(BLUE)━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━$(NC)"
	@echo ""
	@echo "$(GREEN)プロジェクトルート:$(NC) $(PROJECT_ROOT)"
	@echo ""
	@echo "$(GREEN)アクセスURL:$(NC)"
	@echo "  • バックエンドAPI:      http://localhost:3100/api/v1"
	@echo "  • Guest フロントエンド:  http://localhost:3101"
	@echo "  • Owner フロントエンド:  http://localhost:3102"
	@echo "  • Admin フロントエンド:  http://localhost:3103"
	@echo "  • Prisma Studio:        http://localhost:5555"
	@echo ""
	@echo "$(GREEN)技術スタック:$(NC)"
	@echo "  • バックエンド:   Node.js + Express + TypeScript + Prisma"
	@echo "  • フロントエンド: Next.js 14 + React 18 + TypeScript + Tailwind CSS"
	@echo "  • データベース:   PostgreSQL 16"
	@echo ""
