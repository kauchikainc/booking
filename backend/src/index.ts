import { createApp } from './app';
import { config, validateConfig } from './config';
import logger from './utils/logger';

/**
 * サーバーを起動
 */
async function startServer() {
  try {
    // 環境変数のバリデーション（本番環境のみ）
    if (config.nodeEnv === 'production') {
      validateConfig();
    }

    // Expressアプリケーションを作成
    const app = createApp();

    // サーバーを起動
    const server = app.listen(config.port, () => {
      logger.info(`🚀 サーバーが起動しました`);
      logger.info(`📍 環境: ${config.nodeEnv}`);
      logger.info(`🌐 ポート: ${config.port}`);
      logger.info(`✅ ヘルスチェック: http://localhost:${config.port}/health`);
    });

    // グレースフルシャットダウン
    const gracefulShutdown = (signal: string) => {
      logger.info(`${signal} を受信しました。サーバーをシャットダウンします...`);
      server.close(() => {
        logger.info('サーバーが正常にシャットダウンしました');
        process.exit(0);
      });

      // 10秒後に強制終了
      setTimeout(() => {
        logger.error('強制的にシャットダウンします');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('サーバーの起動に失敗しました', error);
    process.exit(1);
  }
}

// サーバーを起動
startServer();
