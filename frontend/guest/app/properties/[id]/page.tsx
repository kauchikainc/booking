'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Property, PropertyType, Room, Booking, PaymentMethod } from '@/lib/types';
import Navbar from '@/components/Navbar';
import PaymentModal from '@/components/PaymentModal';

// 物件タイプの日本語ラベル
const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOTEL: 'ホテル',
  HOSTEL: 'ホステル',
  GUESTHOUSE: 'ゲストハウス',
  APARTMENT: 'アパートメント',
  RESORT: 'リゾート',
};

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProperty(params.id as string);
    }
  }, [params.id]);

  const loadProperty = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProperty(id);
      setProperty(data);
    } catch (err) {
      setError('物件情報の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-gray-600 mb-4">{error || '物件が見つかりません'}</p>
          <Link
            href="/properties"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            物件一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <div className="mb-6">
          <Link
            href="/properties"
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            施設一覧に戻る
          </Link>
        </div>
        {/* メイン画像 */}
        <div className="mb-6">
          <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <svg
              className="w-32 h-32 text-white opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 物件情報 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h2>
                  <span className="inline-block px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 rounded-full">
                    {PROPERTY_TYPE_LABELS[property.type]}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-900">{property.address}</p>
                    {property.postalCode && (
                      <p className="text-sm text-gray-500">〒{property.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-900">
                    チェックイン: {property.checkInTime} / チェックアウト: {property.checkOutTime}
                  </p>
                </div>
              </div>
            </div>

            {/* 説明 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">施設について</h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{property.description}</p>
            </div>

            {/* アメニティ */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">設備・アメニティ</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 部屋一覧 */}
            {property.rooms && property.rooms.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">お部屋タイプ</h2>
                <div className="space-y-4">
                  {property.rooms.map((room) => (
                    <div key={room.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="text-lg font-semibold text-gray-900">{room.name}</h2>
                          {room.description && (
                            <p className="text-sm text-gray-600 mt-1">{room.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            ¥{room.pricePerNight.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">/ 泊</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
                        {room.capacity && (
                          <span>👥 定員{room.capacity}名</span>
                        )}
                        {room.bedType && (
                          <span>🛏️ {room.bedType}</span>
                        )}
                        {room.size && (
                          <span>📐 {room.size}㎡</span>
                        )}
                        <span>残り{room.quantity}室</span>
                      </div>
                      <button
                        onClick={() => {
                          if (!apiClient.hasToken()) {
                            router.push('/login');
                            return;
                          }
                          setSelectedRoom(room);
                          setShowBookingModal(true);
                        }}
                        className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        この部屋を予約
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">予約する</h2>

              {property.rooms && property.rooms.length > 0 ? (
                <>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">料金（1泊あたり）</div>
                    <div className="text-3xl font-bold text-gray-900">
                      ¥{Math.min(...property.rooms.map(r => r.pricePerNight)).toLocaleString()}
                      <span className="text-lg text-gray-500">〜</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">
                    左側の部屋リストから、お好みの部屋を選んで予約してください。
                  </p>
                </>
              ) : (
                <div className="text-center text-gray-500">
                  <p>現在予約を受け付けておりません</p>
                </div>
              )}

              {/* 施設情報 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">施設情報</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>チェックイン</span>
                    <span className="font-medium">{property.checkInTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>チェックアウト</span>
                    <span className="font-medium">{property.checkOutTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 予約モーダル */}
      {showBookingModal && selectedRoom && (
        <BookingModal
          room={selectedRoom}
          property={property}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedRoom(null);
          }}
          onBookingCreated={(bookingId) => {
            setShowBookingModal(false);
            setSelectedRoom(null);
            router.push(`/bookings/${bookingId}`);
          }}
        />
      )}
    </div>
  );
}

// 予約モーダルコンポーネント
function BookingModal({
  room,
  property,
  onClose,
  onBookingCreated,
}: {
  room: Room;
  property: Property;
  onClose: () => void;
  onBookingCreated: (bookingId: string) => void;
}) {
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: '1',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  // ログイン済みユーザーの情報を取得して自動補完
  useEffect(() => {
    async function loadUserInfo() {
      try {
        setLoadingUserInfo(true);
        const user = await apiClient.getMe();

        // ゲストプロフィール情報があれば自動補完
        if (user.guestProfile) {
          const profile = user.guestProfile;
          const firstName = profile.firstName || '';
          const lastName = profile.lastName || '';
          const fullName = `${lastName} ${firstName}`.trim();

          setFormData((prev) => ({
            ...prev,
            guestName: fullName || '',
            guestEmail: user.email || '',
            guestPhone: profile.phone || '',
          }));
        } else {
          // プロフィール情報がない場合はメールアドレスのみ
          setFormData((prev) => ({
            ...prev,
            guestEmail: user.email || '',
          }));
        }
      } catch (err) {
        // エラーは無視（ログインしていない場合など）
        console.error('ユーザー情報の取得に失敗:', err);
      } finally {
        setLoadingUserInfo(false);
      }
    }

    loadUserInfo();
  }, []);

  // 料金の概算を計算
  useEffect(() => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      if (nights > 0) {
        setEstimatedPrice(room.pricePerNight * nights);
      } else {
        setEstimatedPrice(null);
      }
    } else {
      setEstimatedPrice(null);
    }
  }, [formData.checkInDate, formData.checkOutDate, room.pricePerNight]);

  /**
   * 予約情報の入力を確定して、決済画面へ進む
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 必須項目のバリデーション
    if (!formData.checkInDate || !formData.checkOutDate || !formData.guestName || !formData.guestEmail || !formData.guestPhone) {
      setError('必須項目を入力してください');
      return;
    }

    // 決済画面へ進む
    setShowPaymentModal(true);
  };

  /**
   * 決済情報を受け取って予約を作成
   */
  const handlePaymentConfirm = async (paymentMethod: PaymentMethod, cardLast4?: string) => {
    setSubmitting(true);
    setError(null);

    try {
      const booking = await apiClient.createBooking({
        roomId: room.id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        numberOfGuests: parseInt(formData.numberOfGuests),
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        specialRequests: formData.specialRequests || undefined,
        paymentMethod,
        cardLast4,
      });
      onBookingCreated(booking.id);
    } catch (err: any) {
      setError(err.message || '予約の作成に失敗しました');
      setShowPaymentModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  // 今日の日付を取得（YYYY-MM-DD形式）
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">予約フォーム</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={submitting}
            >
              ✕
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">{property.name}</h2>
            <p className="text-gray-700">{room.name}</p>
            <p className="text-sm text-gray-600 mt-1">
              ¥{room.pricePerNight.toLocaleString()} / 泊
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  チェックイン日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkInDate}
                  onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={today}
                />
                <p className="text-xs text-gray-500 mt-1">
                  チェックイン: {property.checkInTime}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  チェックアウト日 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.checkOutDate}
                  onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min={formData.checkInDate || today}
                />
                <p className="text-xs text-gray-500 mt-1">
                  チェックアウト: {property.checkOutTime}
                </p>
              </div>
            </div>

            {estimatedPrice !== null && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  概算料金: <span className="font-bold text-lg">¥{estimatedPrice.toLocaleString()}</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                宿泊人数 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.numberOfGuests}
                onChange={(e) => setFormData({ ...formData, numberOfGuests: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num}名
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                代表者氏名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="example@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                電話番号 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="090-1234-5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                特別なリクエスト
              </label>
              <textarea
                value={formData.specialRequests}
                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="特別なご要望があればご記入ください"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={submitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
                disabled={submitting || !estimatedPrice}
              >
                {submitting ? '処理中...' : '決済情報入力へ'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 決済モーダル */}
      {showPaymentModal && estimatedPrice && (
        <PaymentModal
          totalPrice={estimatedPrice}
          onClose={() => setShowPaymentModal(false)}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </div>
  );
}
