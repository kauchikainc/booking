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
  businessRegistrationNumber: string | null;
  phone: string | null;
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
 * 招待ステータス型
 */
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

/**
 * 招待型
 */
export interface Invitation {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN';
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
  invitedByUser: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * 招待作成リクエスト型
 */
export interface CreateInvitationRequest {
  email: string;
  role: 'OWNER' | 'ADMIN';
  expiresInDays?: number;
}

/**
 * 招待一覧レスポンス型
 */
export interface InvitationsResponse {
  invitations: Invitation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * ページネーション型
 */
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * ユーザー一覧レスポンス型
 */
export interface UsersResponse {
  users: User[];
  pagination: Pagination;
}

/**
 * 物件ステータス型
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
  type: 'HOTEL' | 'HOSTEL' | 'GUESTHOUSE' | 'APARTMENT' | 'RESORT';
  address: string;
  postalCode: string | null;
  latitude: number | null;
  longitude: number | null;
  checkInTime: string;
  checkOutTime: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    email: string;
    ownerProfile?: OwnerProfile;
  };
  rooms?: Room[];
  _count?: {
    rooms: number;
    bookings: number;
  };
}

/**
 * 物件一覧レスポンス型
 */
export interface PropertiesResponse {
  properties: Property[];
  pagination: Pagination;
}

/**
 * 部屋ステータス型
 */
export type RoomStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'INACTIVE';

/**
 * 部屋型
 */
export interface Room {
  id: string;
  propertyId: string;
  name: string;
  description: string;
  size: number | null;
  capacity: number;
  bedType: string | null;
  pricePerNight: number;
  quantity: number;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
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
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  totalPrice: number;
  status: BookingStatus;
  specialRequests: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  guest?: {
    id: string;
    email: string;
    guestProfile?: GuestProfile;
  };
  room?: Room & {
    property?: Property;
  };
}

/**
 * 予約一覧レスポンス型
 */
export interface BookingsResponse {
  bookings: Booking[];
  pagination: Pagination;
}

/**
 * 統計情報型
 */
export interface Statistics {
  totalUsers: number;
  totalGuests: number;
  totalOwners: number;
  totalAdmins: number;
  totalProperties: number;
  activeProperties: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
}

/**
 * ユーザーステータス更新リクエスト型
 */
export interface UpdateUserStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}
