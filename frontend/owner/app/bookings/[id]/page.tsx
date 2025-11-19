'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Booking, BookingStatus } from '@/lib/types';

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const handleStatusChange = async (newStatus: BookingStatus) => {
    if (!confirm(`予約ステータスを「${getStatusLabel(newStatus)}」に変更しますか?`)) {
      return;
    }

    setUpdatingStatus(true);
    try {
      const updatedBooking = await apiClient.updateBookingStatus(bookingId, newStatus);
      setBooking(updatedBooking);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'ステータスの更新に失敗しました';
      alert(message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getStatusLabel = (status: BookingStatus) => {
    const statusMap: Record<BookingStatus, string> = {
      PENDING: '保留中',
      CONFIRMED: '確定',
      CHECKED_IN: 'チェックイン済み',
      CHECKED_OUT: 'チェックアウト済み',
      CANCELLED: 'キャンセル',
    };
    return statusMap[status];
  };

  const getStatusBadge = (status: BookingStatus) => {
    const statusMap: Record<BookingStatus, { label: string; className: string }> = {
      PENDING: { label: '保留中', className: 'bg-yellow-100 text-yellow-800' },
      CONFIRMED: { label: '確定', className: 'bg-green-100 text-green-800' },
      CHECKED_IN: { label: 'チェックイン済み', className: 'bg-blue-100 text-blue-800' },
      CHECKED_OUT: { label: 'チェックアウト済み', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'キャンセル', className: 'bg-red-100 text-red-800' },
    };

    const statusInfo = statusMap[status];

    return (
      <span className={`inline-block px-3 py-1 text-sm font-semibold rounded ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getAvailableStatusTransitions = (currentStatus: BookingStatus): BookingStatus[] => {
    const transitions: Record<BookingStatus, BookingStatus[]> = {
      PENDING: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['CHECKED_IN', 'CANCELLED'],
      CHECKED_IN: ['CHECKED_OUT'],
      CHECKED_OUT: [],
      CANCELLED: [],
    };
    return transitions[currentStatus] || [];
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/bookings')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← 予約一覧に戻る
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

              {/* 合計料金 */}
              <div className="md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">合計料金</h3>
                <p className="text-2xl font-bold text-gray-900">
                  ¥{booking.totalPrice.toLocaleString()}
                </p>
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

        {/* 物件情報カード */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">物件情報</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
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

              <div>
                <button
                  onClick={() => {
                    if (booking.room?.property.id) {
                      router.push(`/properties/${booking.room.property.id}`);
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  物件詳細を見る →
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

        {/* ステータス変更ボタン */}
        {getAvailableStatusTransitions(booking.status).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">予約の管理</h2>
            <div className="flex gap-3">
              {getAvailableStatusTransitions(booking.status).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  disabled={updatingStatus}
                  className={`px-6 py-3 rounded-lg font-medium ${
                    status === 'CANCELLED'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } disabled:bg-gray-300`}
                >
                  {updatingStatus ? '更新中...' : `${getStatusLabel(status)}に変更`}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              ※ ステータスを変更すると、ゲストに通知されます
            </p>
          </div>
        )}

        {booking.status === 'CANCELLED' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-900 mb-2">この予約はキャンセルされています</h3>
            <p className="text-red-700">
              キャンセルされた予約のステータスは変更できません。
            </p>
          </div>
        )}

        {booking.status === 'CHECKED_OUT' && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">この予約は完了しています</h2>
            <p className="text-gray-700">
              チェックアウト済みの予約のステータスは変更できません。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
