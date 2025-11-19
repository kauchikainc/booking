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
  CreatePropertyRequest,
  UpdatePropertyRequest,
  Room,
  CreateRoomRequest,
  UpdateRoomRequest,
  Booking,
  BookingStatus,
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
          // ログインページにリダイレクト（クライアントサイドのみ）
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
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
   * 招待トークンを検証
   */
  async validateInvitationToken(token: string): Promise<{
    email: string;
    role: string;
    expiresAt: string;
  }> {
    const response = await this.client.get<ApiResponse<{
      invitation: {
        email: string;
        role: string;
        expiresAt: string;
      };
    }>>(`/invitations/validate/${token}`);
    if (response.data.success && response.data.data) {
      return response.data.data.invitation;
    }
    throw new Error('無効な招待トークンです');
  }

  /**
   * オーナー登録（招待トークン必須）
   */
  async registerOwner(data: {
    email: string;
    password: string;
    companyName: string;
    businessLicense: string;
    phone: string;
    invitationToken: string;
  }): Promise<AuthResponse> {
    const response = await this.client.post<ApiResponse<AuthResponse>>(
      '/auth/register/owner',
      data
    );
    if (response.data.success && response.data.data) {
      this.setToken(response.data.data.token);
      return response.data.data;
    }
    throw new Error('登録に失敗しました');
  }

  /**
   * オーナーの物件一覧を取得
   */
  async getMyProperties(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PropertyListResponse> {
    const response = await this.client.get<ApiResponse<PropertyListResponse>>(
      '/properties/my',
      { params }
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('物件一覧の取得に失敗しました');
  }

  /**
   * 物件を作成
   */
  async createProperty(data: CreatePropertyRequest): Promise<Property> {
    const response = await this.client.post<ApiResponse<{ property: Property }>>(
      '/properties',
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data.property;
    }
    throw new Error('物件の作成に失敗しました');
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
   * 物件を更新
   */
  async updateProperty(id: string, data: UpdatePropertyRequest): Promise<Property> {
    const response = await this.client.put<ApiResponse<{ property: Property }>>(
      `/properties/${id}`,
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data.property;
    }
    throw new Error('物件の更新に失敗しました');
  }

  /**
   * 物件を削除
   */
  async deleteProperty(id: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{ message: string }>>(
      `/properties/${id}`
    );
    if (!response.data.success) {
      throw new Error('物件の削除に失敗しました');
    }
  }

  /**
   * 物件の部屋一覧を取得（オーナー専用）
   */
  async getMyPropertyRooms(propertyId: string): Promise<Room[]> {
    const response = await this.client.get<ApiResponse<{ rooms: Room[] }>>(
      `/rooms/my/${propertyId}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data.rooms;
    }
    throw new Error('部屋一覧の取得に失敗しました');
  }

  /**
   * 部屋を作成
   */
  async createRoom(data: CreateRoomRequest): Promise<Room> {
    const response = await this.client.post<ApiResponse<{ room: Room }>>(
      '/rooms',
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data.room;
    }
    throw new Error('部屋の作成に失敗しました');
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
   * 部屋を更新
   */
  async updateRoom(id: string, data: UpdateRoomRequest): Promise<Room> {
    const response = await this.client.put<ApiResponse<{ room: Room }>>(
      `/rooms/${id}`,
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data.room;
    }
    throw new Error('部屋の更新に失敗しました');
  }

  /**
   * 部屋を削除
   */
  async deleteRoom(id: string): Promise<void> {
    const response = await this.client.delete<ApiResponse<{ message: string }>>(
      `/rooms/${id}`
    );
    if (!response.data.success) {
      throw new Error('部屋の削除に失敗しました');
    }
  }

  /**
   * オーナーの物件の予約一覧を取得
   */
  async getOwnerBookings(params?: {
    propertyId?: string;
    status?: BookingStatus;
    limit?: number;
    offset?: number;
  }): Promise<Booking[]> {
    const response = await this.client.get<ApiResponse<{ bookings: Booking[] }>>(
      '/bookings/owner',
      { params }
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
   * 予約ステータスを更新
   */
  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const response = await this.client.put<ApiResponse<{ booking: Booking }>>(
      `/bookings/${id}/status`,
      { status }
    );
    if (response.data.success && response.data.data) {
      return response.data.data.booking;
    }
    throw new Error('予約ステータスの更新に失敗しました');
  }
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient();
