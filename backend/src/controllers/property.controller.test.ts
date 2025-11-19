import { Request, Response, NextFunction } from 'express';
import * as propertyController from './property.controller';
import * as propertyService from '../services/property.service';

// モック設定
jest.mock('../services/property.service');
jest.mock('../utils/logger');

describe('Property Controller - 検索・フィルタリング機能', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      user: undefined,
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPublishedProperties - 拡張検索機能', () => {
    it('価格範囲でフィルタリングできること（minPrice, maxPrice）', async () => {
      // テストデータ
      mockRequest.query = {
        minPrice: '5000',
        maxPrice: '15000',
      };

      const mockResult = {
        properties: [
          {
            id: '1',
            name: 'テスト物件1',
            rooms: [{ pricePerNight: 8000 }],
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      };

      (propertyService.getPublishedProperties as jest.Mock).mockResolvedValue(mockResult);

      // 実行
      await propertyController.getPublishedProperties(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // 検証
      expect(propertyService.getPublishedProperties).toHaveBeenCalledWith({
        minPrice: 5000,
        maxPrice: 15000,
        limit: 20,
        offset: 0,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('キーワード検索ができること（keyword）', async () => {
      mockRequest.query = {
        keyword: '温泉',
      };

      const mockResult = {
        properties: [
          {
            id: '1',
            name: '温泉旅館',
            description: '天然温泉が自慢の宿',
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      };

      (propertyService.getPublishedProperties as jest.Mock).mockResolvedValue(mockResult);

      await propertyController.getPublishedProperties(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(propertyService.getPublishedProperties).toHaveBeenCalledWith({
        keyword: '温泉',
        limit: 20,
        offset: 0,
      });
    });

    it('宿泊可能人数でフィルタリングできること（guests）', async () => {
      mockRequest.query = {
        guests: '4',
      };

      const mockResult = {
        properties: [
          {
            id: '1',
            name: 'ファミリールーム',
            rooms: [{ capacity: 4 }],
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      };

      (propertyService.getPublishedProperties as jest.Mock).mockResolvedValue(mockResult);

      await propertyController.getPublishedProperties(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(propertyService.getPublishedProperties).toHaveBeenCalledWith({
        guests: 4,
        limit: 20,
        offset: 0,
      });
    });

    it('エリア検索ができること（area）', async () => {
      mockRequest.query = {
        area: '東京',
      };

      const mockResult = {
        properties: [
          {
            id: '1',
            name: '東京ホテル',
            address: '東京都渋谷区...',
          },
        ],
        total: 1,
        limit: 20,
        offset: 0,
      };

      (propertyService.getPublishedProperties as jest.Mock).mockResolvedValue(mockResult);

      await propertyController.getPublishedProperties(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(propertyService.getPublishedProperties).toHaveBeenCalledWith({
        area: '東京',
        limit: 20,
        offset: 0,
      });
    });

    it('複数の検索条件を組み合わせて使用できること', async () => {
      mockRequest.query = {
        type: 'HOTEL',
        minPrice: '8000',
        maxPrice: '20000',
        guests: '2',
        keyword: '温泉',
        area: '神奈川',
        limit: '10',
        offset: '0',
      };

      const mockResult = {
        properties: [],
        total: 0,
        limit: 10,
        offset: 0,
      };

      (propertyService.getPublishedProperties as jest.Mock).mockResolvedValue(mockResult);

      await propertyController.getPublishedProperties(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(propertyService.getPublishedProperties).toHaveBeenCalledWith({
        type: 'HOTEL',
        minPrice: 8000,
        maxPrice: 20000,
        guests: 2,
        keyword: '温泉',
        area: '神奈川',
        limit: 10,
        offset: 0,
      });
    });

    it('ソート機能が使用できること（sortBy, sortOrder）', async () => {
      mockRequest.query = {
        sortBy: 'price',
        sortOrder: 'asc',
      };

      const mockResult = {
        properties: [
          { id: '1', name: '格安ホテル', rooms: [{ pricePerNight: 5000 }] },
          { id: '2', name: '中級ホテル', rooms: [{ pricePerNight: 10000 }] },
        ],
        total: 2,
        limit: 20,
        offset: 0,
      };

      (propertyService.getPublishedProperties as jest.Mock).mockResolvedValue(mockResult);

      await propertyController.getPublishedProperties(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(propertyService.getPublishedProperties).toHaveBeenCalledWith({
        sortBy: 'price',
        sortOrder: 'asc',
        limit: 20,
        offset: 0,
      });
    });

    it('無効な価格範囲の場合エラーを返すこと（minPrice > maxPrice）', async () => {
      mockRequest.query = {
        minPrice: '20000',
        maxPrice: '10000',
      };

      await propertyController.getPublishedProperties(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // バリデーションエラーが発生することを期待
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: expect.stringContaining('価格範囲が不正'),
        })
      );
    });
  });
});
