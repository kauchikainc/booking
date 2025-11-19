import dotenv from 'dotenv';

// 環境変数を読み込む
dotenv.config();

/**
 * アプリケーション設定
 */
export const config = {
  // サーバー設定
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3100', 10),

  // データベース設定
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT設定
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // CORS設定
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3101'],

  // ログレベル
  logLevel: process.env.LOG_LEVEL || 'info',
};

/**
 * 必須の環境変数をチェック
 */
export function validateConfig() {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

  const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`必須の環境変数が設定されていません: ${missingEnvVars.join(', ')}`);
  }
}
