import { create } from 'zustand';
import { User, RegisterRequest, LoginRequest, UpdateProfileRequest, ChangePasswordRequest } from '../types';
import { apiClient } from '../api';

/**
 * 認証ストアの状態型
 */
interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // アクション
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<import('../types').AuthResponse | undefined>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  changePassword: (data: ChangePasswordRequest) => Promise<void>;
  clearError: () => void;
}

/**
 * 認証ストア
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  /**
   * 一般利用者登録
   */
  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.registerGuest(data);
      // 登録後、ユーザー情報を取得
      const user = await apiClient.getMe();
      set({ user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : '登録に失敗しました';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * ログイン
   */
  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse = await apiClient.login(data);
      // ログイン後、ユーザー情報を取得
      const user = await apiClient.getMe();
      set({ user, isLoading: false });
      return authResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * ログアウト
   */
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.logout();
      set({ user: null, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログアウトに失敗しました';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * 現在のユーザー情報を取得
   */
  fetchUser: async () => {
    // トークンがない場合は何もしない
    if (!apiClient.hasToken()) {
      set({ user: null, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const user = await apiClient.getMe();
      set({ user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ユーザー情報の取得に失敗しました';
      set({ error: message, user: null, isLoading: false });
    }
  },

  /**
   * プロフィール更新
   */
  updateProfile: async (data: UpdateProfileRequest) => {
    set({ isLoading: true, error: null });
    try {
      const user = await apiClient.updateProfile(data);
      set({ user, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'プロフィールの更新に失敗しました';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * パスワード変更
   */
  changePassword: async (data: ChangePasswordRequest) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.changePassword(data);
      set({ isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'パスワードの変更に失敗しました';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  /**
   * エラーをクリア
   */
  clearError: () => {
    set({ error: null });
  },
}));
