#!/bin/bash

# 民泊・ゲストハウス予約サービス - 全サーバー起動スクリプト
# 使用方法: ./start-all.sh

set -e

# 色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ロゴ表示
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  民泊・ゲストハウス予約サービス - サーバー起動${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# プロジェクトルートディレクトリを取得
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
echo -e "${GREEN}プロジェクトルート: ${PROJECT_ROOT}${NC}"
echo ""

# ポートチェック関数
check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}警告: ポート ${port} (${service}) は既に使用されています${NC}"
        echo -e "${YELLOW}既存のプロセスを停止しますか? (y/N)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            echo -e "${GREEN}ポート ${port} を解放しました${NC}"
        else
            echo -e "${RED}起動をキャンセルしました${NC}"
            exit 1
        fi
    fi
}

# 必要なポートをチェック
echo -e "${BLUE}ポート使用状況を確認中...${NC}"
check_port 3100 "Backend API"
check_port 3101 "Guest Frontend"
check_port 3102 "Owner Frontend"
check_port 3103 "Admin Frontend"
check_port 5555 "Prisma Studio"
echo ""

# tmuxまたはscreenの確認
if command -v tmux &> /dev/null; then
    SESSION_MANAGER="tmux"
    echo -e "${GREEN}tmux が利用可能です${NC}"
elif command -v screen &> /dev/null; then
    SESSION_MANAGER="screen"
    echo -e "${GREEN}screen が利用可能です${NC}"
else
    echo -e "${YELLOW}tmux/screen が見つかりません。個別のターミナルウィンドウで起動してください。${NC}"
    echo ""
    echo -e "${BLUE}以下のコマンドを別々のターミナルで実行してください:${NC}"
    echo ""
    echo -e "${GREEN}# ターミナル1: バックエンド${NC}"
    echo "cd $PROJECT_ROOT/backend && npm run dev"
    echo ""
    echo -e "${GREEN}# ターミナル2: Guest フロントエンド${NC}"
    echo "cd $PROJECT_ROOT/frontend/guest && npm run dev"
    echo ""
    echo -e "${GREEN}# ターミナル3: Owner フロントエンド${NC}"
    echo "cd $PROJECT_ROOT/frontend/owner && npm run dev"
    echo ""
    echo -e "${GREEN}# ターミナル4: Admin フロントエンド${NC}"
    echo "cd $PROJECT_ROOT/frontend/admin && npm run dev"
    echo ""
    echo -e "${GREEN}# ターミナル5 (オプション): Prisma Studio${NC}"
    echo "cd $PROJECT_ROOT/backend && npx prisma studio"
    echo ""
    exit 0
fi

# tmuxセッション名
SESSION_NAME="booking-service"

# 既存のセッションをチェック
if tmux has-session -t $SESSION_NAME 2>/dev/null; then
    echo -e "${YELLOW}既存のセッション '${SESSION_NAME}' が見つかりました${NC}"
    echo -e "${YELLOW}セッションを削除して再起動しますか? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        tmux kill-session -t $SESSION_NAME
        echo -e "${GREEN}セッションを削除しました${NC}"
    else
        echo -e "${BLUE}既存のセッションにアタッチします: tmux attach -t ${SESSION_NAME}${NC}"
        exit 0
    fi
fi

echo ""
echo -e "${BLUE}tmux セッション '${SESSION_NAME}' を作成中...${NC}"

# tmuxセッションを作成して各サーバーを起動
tmux new-session -d -s $SESSION_NAME -n backend

# 1. バックエンドAPI
tmux send-keys -t $SESSION_NAME:backend "cd $PROJECT_ROOT/backend" C-m
tmux send-keys -t $SESSION_NAME:backend "echo -e '${GREEN}バックエンドAPI起動中 (ポート 3100)...${NC}'" C-m
tmux send-keys -t $SESSION_NAME:backend "npm run dev" C-m

# 2. Guest フロントエンド
tmux new-window -t $SESSION_NAME -n guest
tmux send-keys -t $SESSION_NAME:guest "cd $PROJECT_ROOT/frontend/guest" C-m
tmux send-keys -t $SESSION_NAME:guest "echo -e '${GREEN}Guest フロントエンド起動中 (ポート 3101)...${NC}'" C-m
tmux send-keys -t $SESSION_NAME:guest "npm run dev" C-m

# 3. Owner フロントエンド
tmux new-window -t $SESSION_NAME -n owner
tmux send-keys -t $SESSION_NAME:owner "cd $PROJECT_ROOT/frontend/owner" C-m
tmux send-keys -t $SESSION_NAME:owner "echo -e '${GREEN}Owner フロントエンド起動中 (ポート 3102)...${NC}'" C-m
tmux send-keys -t $SESSION_NAME:owner "npm run dev" C-m

# 4. Admin フロントエンド
tmux new-window -t $SESSION_NAME -n admin
tmux send-keys -t $SESSION_NAME:admin "cd $PROJECT_ROOT/frontend/admin" C-m
tmux send-keys -t $SESSION_NAME:admin "echo -e '${GREEN}Admin フロントエンド起動中 (ポート 3103)...${NC}'" C-m
tmux send-keys -t $SESSION_NAME:admin "npm run dev" C-m

# 5. Prisma Studio (オプション)
tmux new-window -t $SESSION_NAME -n prisma
tmux send-keys -t $SESSION_NAME:prisma "cd $PROJECT_ROOT/backend" C-m
tmux send-keys -t $SESSION_NAME:prisma "echo -e '${GREEN}Prisma Studio 起動中 (ポート 5555)...${NC}'" C-m
tmux send-keys -t $SESSION_NAME:prisma "npx prisma studio" C-m

# 最初のウィンドウに戻る
tmux select-window -t $SESSION_NAME:backend

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ すべてのサーバーを起動しました！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}アクセスURL:${NC}"
echo -e "  • バックエンドAPI:      ${GREEN}http://localhost:3100/api/v1${NC}"
echo -e "  • Guest フロントエンド:  ${GREEN}http://localhost:3101${NC}"
echo -e "  • Owner フロントエンド:  ${GREEN}http://localhost:3102${NC}"
echo -e "  • Admin フロントエンド:  ${GREEN}http://localhost:3103${NC}"
echo -e "  • Prisma Studio:        ${GREEN}http://localhost:5555${NC}"
echo ""
echo -e "${BLUE}tmux操作:${NC}"
echo -e "  • セッションにアタッチ:   ${YELLOW}tmux attach -t ${SESSION_NAME}${NC}"
echo -e "  • セッションをデタッチ:   ${YELLOW}Ctrl+B → D${NC}"
echo -e "  • ウィンドウ切り替え:     ${YELLOW}Ctrl+B → [0-4]${NC}"
echo -e "  • すべて停止:           ${YELLOW}tmux kill-session -t ${SESSION_NAME}${NC}"
echo ""
echo -e "${BLUE}または、以下のコマンドで停止:${NC}"
echo -e "  ${YELLOW}make stop${NC}"
echo ""
