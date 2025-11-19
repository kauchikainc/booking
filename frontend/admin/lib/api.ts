import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ApiResponse,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  User,
  CreateInvitationRequest,
  Invitation,
  InvitationsResponse,
  InvitationStatus,
  UsersResponse,
  PropertiesResponse,
  PropertyStatus,
  BookingsResponse,
  BookingStatus,
  Statistics,
  UpdateUserStatusRequest,
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
   * トークンが存在するかチェック
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  /**
   * 招待を作成（管理者のみ）
   */
  async createInvitation(data: CreateInvitationRequest): Promise<Invitation> {
    const response = await this.client.post<ApiResponse<{ invitation: Invitation }>>(
      '/admin/invitations',
      data
    );
    if (response.data.success && response.data.data) {
      return response.data.data.invitation;
    }
    throw new Error('招待の作成に失敗しました');
  }

  /**
   * 招待一覧を取得（管理者のみ）
   */
  async getInvitations(
    status?: InvitationStatus,
    page: number = 1,
    limit: number = 20
  ): Promise<InvitationsResponse> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await this.client.get<ApiResponse<InvitationsResponse>>(
      `/admin/invitations?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('招待一覧の取得に失敗しました');
  }

  /**
   * 招待を削除（管理者のみ）
   */
  async deleteInvitation(id: string): Promise<void> {
    const response = await this.client.delete<ApiResponse>(
      `/admin/invitations/${id}`
    );
    if (!response.data.success) {
      throw new Error('招待の削除に失敗しました');
    }
  }

  /**
   * ユーザー一覧を取得（管理者のみ）
   */
  async getUsers(
    page: number = 1,
    limit: number = 20,
    role?: 'GUEST' | 'OWNER' | 'ADMIN',
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    search?: string
  ): Promise<UsersResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    if (search) params.append('search', search);

    const response = await this.client.get<ApiResponse<UsersResponse>>(
      `/admin/users?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('ユーザー一覧の取得に失敗しました');
  }

  /**
   * ユーザーステータスを更新（管理者のみ）
   */
  async updateUserStatus(id: string, data: UpdateUserStatusRequest): Promise<void> {
    const response = await this.client.put<ApiResponse>(
      `/admin/users/${id}/status`,
      data
    );
    if (!response.data.success) {
      throw new Error('ユーザーステータスの更新に失敗しました');
    }
  }

  /**
   * 物件一覧を取得（管理者のみ）
   */
  async getAdminProperties(
    page: number = 1,
    limit: number = 20,
    status?: PropertyStatus
  ): Promise<PropertiesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await this.client.get<ApiResponse<PropertiesResponse>>(
      `/admin/properties?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('物件一覧の取得に失敗しました');
  }

  /**
   * 物件を承認（管理者のみ）
   */
  async approveProperty(id: string): Promise<void> {
    const response = await this.client.put<ApiResponse>(
      `/admin/properties/${id}/approve`
    );
    if (!response.data.success) {
      throw new Error('物件の承認に失敗しました');
    }
  }

  /**
   * 物件を却下（管理者のみ）
   */
  async rejectProperty(id: string, reason: string): Promise<void> {
    const response = await this.client.put<ApiResponse>(
      `/admin/properties/${id}/reject`,
      { reason }
    );
    if (!response.data.success) {
      throw new Error('物件の却下に失敗しました');
    }
  }

  /**
   * 全予約一覧を取得（管理者のみ）
   */
  async getAdminBookings(
    page: number = 1,
    limit: number = 20,
    status?: BookingStatus,
    propertyId?: string
  ): Promise<BookingsResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);
    if (propertyId) params.append('propertyId', propertyId);

    const response = await this.client.get<ApiResponse<BookingsResponse>>(
      `/admin/bookings?${params.toString()}`
    );
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error('予約一覧の取得に失敗しました');
  }

  /**
   * 統計情報を取得（管理者のみ）
   */
  async getStatistics(): Promise<Statistics> {
    const response = await this.client.get<ApiResponse<{ statistics: Statistics }>>(
      '/admin/statistics'
    );
    if (response.data.success && response.data.data) {
      return response.data.data.statistics;
    }
    throw new Error('統計情報の取得に失敗しました');
  }
}

// シングルトンインスタンスをエクスポート
export const apiClient = new ApiClient();
