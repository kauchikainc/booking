import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import logger from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/error-handler';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import roomRoutes from './routes/room.routes';
import bookingRoutes from './routes/booking.routes';
import invitationRoutes from './routes/invitation.routes';
import adminRoutes from './routes/admin.routes';

/**
 * Expressアプリケーションを作成・設定
 */
export function createApp(): Application {
  const app = express();

  // セキュリティヘッダーの設定
  app.use(helmet());

  // CORS設定
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    })
  );

  // JSONボディパーサー
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // HTTPリクエストログ
  if (config.nodeEnv === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ルート設定
  app.use('/', healthRoutes);
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/properties', propertyRoutes);
  app.use('/api/v1/rooms', roomRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api/v1', invitationRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404ハンドラー
  app.use(notFoundHandler);

  // エラーハンドラー
  app.use(errorHandler);

  logger.info('Expressアプリケーションの設定が完了しました');

  return app;
}
