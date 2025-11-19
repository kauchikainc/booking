import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  User,
  Property,
  PropertyListResponse,
  PropertyType,
  Room,
  Booking,
  CreateBookingRequest,
} from './types';

/**
 * APIクライアントクラス
 */
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3100/api/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // リクエストインターセプター: トークンを自動的に追加
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // レスポンスインターセプター: エラーハンドリング
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          // 認証エラーの場合、トークンをクリア
          this.clearToken();
          // リダイレクトは各コンポーネントで処理する
          // （ここで強制的にリダイレクトすると無限ループの原因になる）
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * トークンを取得
   */
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  /**
   * トークンを保存
   */
  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }

  /**
   * トークンをクリア
   */
  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }

  /**
   * 一般利用者登録
   */
  async registerGuest(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      '/auth/register/guest',
      data
    );
    if (response.data.success && response.data.data) {
      this.setToken(response.data.data.token);
      return response.data.data;
    }
    throw new Error('登録に失敗しました');
  }

  /**
   * ログイン
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      data
    );
    if (response.data.success && response.data.data) {
      this.setToken(response.data.data.token);
      return response.data.data;
    }
    throw new Error('ログインに失敗しました');
  }

  /**
   * 現在のユーザー情報を取得
   */
  async getMe(): Promise<User> {
    const response = await this.client.get<ApiResponse<{ user: User }>>(
      '/auth/me'
    );
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }
    throw new Error('ユーザー情報の取得に失敗しました');
  }

  /**
   * ログアウト
   */
  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearToken();
    }
  }

  /**
   * プロフィール更新
   */
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await this.client.put<ApiResponse<{ user: User }>>(
      '/auth/profile',
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }
    throw new Error('プロフィールの更新に失敗しました');
  }

  /**
   * パスワード変更
   */
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const response = await this.client.put<ApiResponse>(
      '/auth/password',
      data
    );
    if (!response.data.success) {
      throw new Error('パスワードの変更に失敗しました');
    }
  }

  /**
   * トークンが存在するかチェック
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * 公開中の物件一覧を取得 - 拡張検索対応
   */
  async getProperties(params?: {
    type?: PropertyType;
    minPrice?: number;
    maxPrice?: number;
    guests?: number;
    keyword?: string;
    area?: string;
    sortBy?: 'price' | 'createdAt' | 'name';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<PropertyListResponse> {
    const response = await this.client.get<ApiResponse<PropertyListResponse>>(
      '/properties',
      { params }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('物件一覧の取得に失敗しました');
  }

  /**
   * 物件詳細を取得
   */
  async getProperty(id: string): Promise<Property> {
    const response = await this.client.get<ApiResponse<{ property: Property }>>(
      `/properties/${id}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data.property;
    }
    throw new Error('物件詳細の取得に失敗しました');
  }

  /**
   * 物件の部屋一覧を取得
   */
  async getRoomsByProperty(propertyId: string): Promise<Room[]> {
    const response = await this.client.get<ApiResponse<{ rooms: Room[] }>>(
      `/rooms/property/${propertyId}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data.rooms;
    }
    throw new Error('部屋一覧の取得に失敗しました');
  }

  /**
   * 部屋詳細を取得
   */
  async getRoom(id: string): Promise<Room> {
    const response = await this.client.get<ApiResponse<{ room: Room }>>(
      `/rooms/${id}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data.room;
    }
    throw new Error('部屋詳細の取得に失敗しました');
  }

  /**
   * 予約を作成
   */
  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    const response = await this.client.post<ApiResponse<{ booking: Booking }>>(
      '/bookings',
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data.booking;
    }
    throw new Error('予約の作成に失敗しました');
  }

  /**
   * 自分の予約一覧を取得
   */
  async getMyBookings(): Promise<Booking[]> {
    const response = await this.client.get<ApiResponse<{ bookings: Booking[] }>>(
      '/bookings/my'
    );
    if (response.data.success && response.data.data) {
      return response.data.data.bookings;
    }
    throw new Error('予約一覧の取得に失敗しました');
  }

  /**
   * 予約詳細を取得
   */
  async getBooking(id: string): Promise<Booking> {
    const response = await this.client.get<ApiResponse<{ booking: Booking }>>(
      `/bookings/${id}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data.booking;
    }
    throw new Error('予約詳細の取得に失敗しました');
  }

  /**
   * 予約をキャンセル
   */
  async cancelBooking(id: string): Promise<Booking> {
    const response = await this.client.post<ApiResponse<{ booking: Booking }>>(
      `/bookings/${id}/cancel`
    );
    if (response.data.success && response.data.data) {
      return response.data.data.booking;
    }
    throw new Error('予約のキャンセルに失敗しました');
  }
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient();
