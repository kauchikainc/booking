import { Request, Response, NextFunction } from 'express';
import * as propertyService from '../services/property.service';
import logger from '../utils/logger';

/**
 * 物件を作成（オーナーのみ）
 * POST /api/v1/properties
 */
export async function createProperty(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        },
      });
    }

    const property = await propertyService.createProperty(req.user.userId, req.body);

    logger.info('物件が作成されました', { propertyId: property.id, ownerId: req.user.userId });

    res.status(201).json({
      success: true,
      data: { property },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * 公開中の物件一覧を取得（全ユーザー）- 拡張検索対応
 * GET /api/v1/properties
 */
export async function getPublishedProperties(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      type,
      minPrice,
      maxPrice,
      guests,
      keyword,
      area,
      sortBy,
      sortOrder,
      limit,
      offset,
    } = req.query;

    // 価格範囲のバリデーション
    if (minPrice && maxPrice) {
      const min = parseInt(minPrice as string);
      const max = parseInt(maxPrice as string);
      if (min > max) {
        return next(
          new Error('価格範囲が不正です。最低価格は最高価格以下である必要があります。')
        );
      }
    }

    const result = await propertyService.getPublishedProperties({
      type: type as any,
      minPrice: minPrice ? parseInt(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
      guests: guests ? parseInt(guests as string) : undefined,
      keyword: keyword as string,
      area: area as string,
      sortBy: sortBy as 'price' | 'createdAt' | 'name',
      sortOrder: sortOrder as 'asc' | 'desc',
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * オーナーの物件一覧を取得（オーナーのみ）
 * GET /api/v1/properties/my
 */
export async function getOwnerProperties(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        },
      });
    }

    const { status, limit, offset } = req.query;

    const result = await propertyService.getOwnerProperties(req.user.userId, {
      status: status as any,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * 物件詳細を取得
 * GET /api/v1/properties/:id
 */
export async function getPropertyById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const property = await propertyService.getPropertyById(id, req.user?.userId);

    res.status(200).json({
      success: true,
      data: { property },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * 物件を更新（オーナーのみ）
 * PUT /api/v1/properties/:id
 */
export async function updateProperty(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        },
      });
    }

    const { id } = req.params;
    const property = await propertyService.updateProperty(id, req.user.userId, req.body);

    logger.info('物件が更新されました', { propertyId: id, ownerId: req.user.userId });

    res.status(200).json({
      success: true,
      data: { property },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * 物件を削除（オーナーのみ）
 * DELETE /api/v1/properties/:id
 */
export async function deleteProperty(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '認証が必要です',
        },
      });
    }

    const { id } = req.params;
    await propertyService.deleteProperty(id, req.user.userId);

    logger.info('物件が削除されました', { propertyId: id, ownerId: req.user.userId });

    res.status(200).json({
      success: true,
      data: {
        message: '物件を削除しました',
      },
    });
  } catch (error) {
    return next(error);
  }
}
