/**
 * APIレスポンスの共通型
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    stack?: string;
  };
}

/**
 * ユーザー型
 */
export interface User {
  id: string;
  email: string;
  role: 'GUEST' | 'OWNER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerified: boolean;
  requirePasswordChange?: boolean;
  createdAt: string;
  updatedAt: string;
  guestProfile?: GuestProfile;
  ownerProfile?: OwnerProfile;
}

/**
 * 一般利用者プロフィール型
 */
export interface GuestProfile {
  id: string;
  userId: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 施設オーナープロフィール型
 */
export interface OwnerProfile {
  id: string;
  userId: string;
  companyName: string | null;
  representative: string | null;
  businessRegistrationNumber: string | null;
  businessLicense: string | null;
  phone: string | null;
  postalCode: string | null;
  address: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 認証レスポンス型
 */
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    requirePasswordChange?: boolean;
  };
  token: string;
  expiresIn: string;
}

/**
 * 登録リクエスト型
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * ログインリクエスト型
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * プロフィール更新リクエスト型（施設オーナー）
 */
export interface UpdateProfileRequest {
  companyName?: string;
  representative?: string;
  phone?: string;
  postalCode?: string;
  address?: string;
  businessLicense?: string;
}

/**
 * パスワード変更リクエスト型
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * 物件タイプ
 */
export type PropertyType = 'HOTEL' | 'HOSTEL' | 'GUESTHOUSE' | 'APARTMENT' | 'RESORT';

/**
 * 物件ステータス
 */
export type PropertyStatus = 'DRAFT' | 'PUBLISHED' | 'SUSPENDED' | 'CLOSED';

/**
 * 物件型
 */
export interface Property {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  type: PropertyType;
  address: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  checkInTime: string;
  checkOutTime: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  images?: PropertyImage[];
  amenities?: PropertyAmenity[];
  rooms?: Room[];
}

/**
 * 物件画像型
 */
export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  caption: string | null;
  order: number;
  createdAt: string;
}

/**
 * 物件アメニティ型
 */
export interface PropertyAmenity {
  id: string;
  propertyId: string;
  name: string;
  icon: string | null;
  createdAt: string;
}

/**
 * 部屋型
 */
export interface Room {
  id: string;
  propertyId: string;
  name: string;
  description: string | null;
  size: number | null;
  capacity: number;
  bedType: string | null;
  pricePerNight: number;
  quantity: number;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';
  createdAt: string;
  updatedAt: string;
  images?: RoomImage[];
}

/**
 * 部屋画像型
 */
export interface RoomImage {
  id: string;
  roomId: string;
  url: string;
  caption: string | null;
  order: number;
  createdAt: string;
}

/**
 * 物件作成リクエスト型
 */
export interface CreatePropertyRequest {
  name: string;
  description: string;
  type: PropertyType;
  address: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  checkInTime: string;
  checkOutTime: string;
}

/**
 * 物件更新リクエスト型
 */
export interface UpdatePropertyRequest {
  name?: string;
  description?: string;
  type?: PropertyType;
  address?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  checkInTime?: string;
  checkOutTime?: string;
  status?: PropertyStatus;
}

/**
 * 物件一覧レスポンス型
 */
export interface PropertyListResponse {
  properties: Property[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * 部屋作成リクエスト型
 */
export interface CreateRoomRequest {
  propertyId: string;
  name: string;
  description?: string;
  size?: number;
  capacity: number;
  bedType?: string;
  pricePerNight: number;
  quantity?: number;
}

/**
 * 部屋更新リクエスト型
 */
export interface UpdateRoomRequest {
  name?: string;
  description?: string;
  size?: number;
  capacity?: number;
  bedType?: string;
  pricePerNight?: number;
  quantity?: number;
  status?: 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';
}

/**
 * 予約ステータス型
 */
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';

/**
 * 予約型
 */
export interface Booking {
  id: string;
  guestId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: BookingStatus;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests: string | null;
  createdAt: string;
  updatedAt: string;
  room?: {
    name: string;
    property: {
      id: string;
      name: string;
      address: string;
      checkInTime: string;
      checkOutTime: string;
    };
  };
  guest?: {
    firstName: string | null;
    lastName: string | null;
    user: {
      email: string;
    };
  };
}
