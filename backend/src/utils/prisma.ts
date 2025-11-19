import { PrismaClient } from '@prisma/client';
import logger from './logger';

/**
 * Prismaクライアントのシングルトンインスタンス
 * 開発環境でのホットリロード時に複数のインスタンスが作成されないようにする
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Prismaクライアントの接続確認
prisma
  .$connect()
  .then(() => {
    logger.info('✅ データベースに接続しました');
  })
  .catch((error) => {
    logger.error('❌ データベース接続エラー:', error);
    process.exit(1);
  });

// アプリケーション終了時にPrismaクライアントを切断
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('データベース接続を切断しました');
});

export default prisma;
