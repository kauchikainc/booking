'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Booking } from '@/lib/types';
import Navbar from '@/components/Navbar';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        setLoading(true);
        const data = await apiClient.getBooking(bookingId);
        setBooking(data);
      } catch (err: unknown) {
        console.error('予約詳細の取得に失敗:', err);
        const message = err instanceof Error ? err.message : '予約詳細の取得に失敗しました';
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchBooking();
  }, [bookingId]);

  const handleCancelBooking = async () => {
    if (!confirm('この予約をキャンセルしてもよろしいですか?')) {
      return;
    }

    setCancelling(true);
    try {
      await apiClient.cancelBooking(bookingId);
      setBooking((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '予約のキャンセルに失敗しました';
      alert(message);
    } finally {
      setCancelling(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '保留中', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '確定', className: 'bg-green-100 text-green-800' },
      CHECKED_IN: { label: 'チェックイン済み', className: 'bg-blue-100 text-blue-800' },
      CHECKED_OUT: { label: 'チェックアウト済み', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const calculateNights = () => {
    if (!booking) return 0;
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    return Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || '予約が見つかりません'}</p>
          <button
            onClick={() => router.push('/bookings')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            予約一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/bookings')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            予約一覧に戻る
          </button>
          <div className="flex justify-between items-start">
            <h2 className="text-3xl font-bold text-gray-900">予約詳細</h2>
            {getStatusBadge(booking.status)}
          </div>
        </div>

        {/* 予約情報カード */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {booking.room?.property.name || '物件名不明'}
            </h2>
            <p className="text-gray-600">{booking.room?.name || '部屋情報なし'}</p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* チェックイン情報 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">チェックイン</h3>
                <p className="text-lg text-gray-900">
                  {formatDate(booking.checkInDate)}
                </p>
                <p className="text-sm text-gray-600">
                  {booking.room?.property.checkInTime || '-'}
                </p>
              </div>

              {/* チェックアウト情報 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">チェックアウト</h3>
                <p className="text-lg text-gray-900">
                  {formatDate(booking.checkOutDate)}
                </p>
                <p className="text-sm text-gray-600">
                  {booking.room?.property.checkOutTime || '-'}
                </p>
              </div>

              {/* 宿泊数 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">宿泊数</h3>
                <p className="text-lg text-gray-900">{calculateNights()}泊</p>
              </div>

              {/* 宿泊人数 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">宿泊人数</h3>
                <p className="text-lg text-gray-900">{booking.numberOfGuests}名</p>
              </div>

              {/* 料金詳細 */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">料金詳細</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      ¥{booking.room?.pricePerNight?.toLocaleString() || '-'} × {calculateNights()}泊
                    </span>
                    <span className="text-gray-900">
                      ¥{((booking.room?.pricePerNight || 0) * calculateNights()).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 flex justify-between">
                    <span className="font-semibold text-gray-900">合計</span>
                    <span className="text-2xl font-bold text-gray-900">
                      ¥{booking.totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 支払い情報 */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">支払い情報</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">支払い方法</span>
                    <span className="text-gray-900 font-medium">
                      {booking.paymentMethod === 'ONSITE' ? '現地払い' : 'クレジットカード'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">支払いステータス</span>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${
                      booking.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      booking.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.paymentStatus === 'COMPLETED' ? '支払い済み' :
                       booking.paymentStatus === 'FAILED' ? '支払い失敗' : '未払い'}
                    </span>
                  </div>
                  {booking.paymentMethod === 'CREDIT_CARD' && booking.cardLast4 && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">カード番号（下4桁）</span>
                      <span className="text-gray-900 font-mono">**** **** **** {booking.cardLast4}</span>
                    </div>
                  )}
                  {booking.paymentMethod === 'ONSITE' && booking.paymentStatus === 'PENDING' && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        チェックイン時に施設にてお支払いください
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ゲスト情報カード */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">ゲスト情報</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">代表者氏名</h3>
                <p className="text-gray-900">{booking.guestName}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">メールアドレス</h3>
                <p className="text-gray-900">{booking.guestEmail}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">電話番号</h3>
                <p className="text-gray-900">{booking.guestPhone}</p>
              </div>

              {booking.specialRequests && (
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">特別なリクエスト</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{booking.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 部屋情報カード */}
        {booking.room && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">部屋情報</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">部屋名</h3>
                  <p className="text-gray-900">{booking.room.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">部屋タイプ</h3>
                  <p className="text-gray-900">{booking.room.bedType || '-'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">広さ</h3>
                  <p className="text-gray-900">{booking.room.size ? `${booking.room.size}㎡` : '-'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">定員</h3>
                  <p className="text-gray-900">{booking.room.capacity}名</p>
                </div>

                {booking.room.description && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">部屋の説明</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{booking.room.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 物件情報カード */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">物件情報</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">施設名</h3>
                <p className="text-lg text-gray-900 font-semibold">
                  {booking.room?.property.name || '-'}
                </p>
              </div>

              {booking.room?.property.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">施設の説明</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {booking.room.property.description}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">住所</h3>
                <p className="text-gray-900">{booking.room?.property.address || '-'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">チェックイン時刻</h3>
                  <p className="text-gray-900">{booking.room?.property.checkInTime || '-'}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">チェックアウト時刻</h3>
                  <p className="text-gray-900">{booking.room?.property.checkOutTime || '-'}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    if (booking.room?.propertyId) {
                      router.push(`/properties/${booking.room.propertyId}`);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  物件詳細を見る
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 予約情報カード */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">予約情報</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">予約番号</h3>
                <p className="text-gray-900 font-mono text-sm">{booking.id}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">予約日時</h3>
                <p className="text-gray-900">
                  {new Date(booking.createdAt).toLocaleString('ja-JP')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">最終更新日時</h3>
                <p className="text-gray-900">
                  {new Date(booking.updatedAt).toLocaleString('ja-JP')}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">予約ステータス</h3>
                <p className="text-gray-900">{getStatusBadge(booking.status)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* キャンセルポリシー・重要事項 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">キャンセルポリシー・重要事項</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-yellow-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  キャンセルポリシー
                </h3>
                <ul className="text-sm text-yellow-900 space-y-1 ml-7">
                  <li>• チェックイン7日前まで：無料キャンセル可</li>
                  <li>• チェックイン6日前〜3日前：宿泊料金の50%</li>
                  <li>• チェックイン2日前〜当日：宿泊料金の100%</li>
                  <li>• 連絡なしの不泊（No-Show）：宿泊料金の100%</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  注意事項
                </h3>
                <ul className="text-sm text-blue-900 space-y-1 ml-7">
                  <li>• チェックイン時に身分証明書の提示が必要です</li>
                  <li>• 施設内は全面禁煙です</li>
                  <li>• ペットの同伴はできません</li>
                  <li>• 予約人数を超えての宿泊はできません</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">予約の管理</h2>
            <div className="space-y-4">
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="w-full md:w-auto px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 transition"
              >
                {cancelling ? 'キャンセル処理中...' : 'この予約をキャンセル'}
              </button>
              <p className="text-sm text-gray-600">
                ※ キャンセル後の返金については、上記のキャンセルポリシーに従います
              </p>
            </div>
          </div>
        )}

        {booking.status === 'CANCELLED' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">この予約はキャンセルされています</h3>
            <p className="text-red-700">
              返金については、物件のキャンセルポリシーに基づいて処理されます。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
