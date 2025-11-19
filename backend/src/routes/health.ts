import { Router, Request, Response } from 'express';

const router = Router();

/**
 * ヘルスチェックエンドポイント
 * GET /health
 */
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

export default router;
