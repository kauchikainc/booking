'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Booking, BookingStatus, Property } from '@/lib/types';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | ''>('');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [bookingsData, propertiesData] = await Promise.all([
          apiClient.getOwnerBookings(),
          apiClient.getMyProperties(),
        ]);
        setBookings(bookingsData);
        setProperties(propertiesData.properties);
      } catch (err: any) {
        console.error('データの取得に失敗:', err);
        setError(err.message || 'データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    if (!confirm(`予約ステータスを「${getStatusLabel(newStatus)}」に変更しますか?`)) {
      return;
    }

    setUpdatingStatus(bookingId);
    try {
      const updatedBooking = await apiClient.updateBookingStatus(bookingId, newStatus);
      setBookings(
        bookings.map((booking) =>
          booking.id === bookingId ? updatedBooking : booking
        )
      );
    } catch (err: any) {
      alert(err.message || 'ステータスの更新に失敗しました');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(
      date.getDate()
    ).padStart(2, '0')}`;
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
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${statusInfo.className}`}>
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

  const filteredBookings = bookings.filter((booking) => {
    if (selectedProperty && booking.room?.property.id !== selectedProperty) {
      return false;
    }
    if (selectedStatus && booking.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  const calculateNights = (checkInDate: string, checkOutDate: string) => {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button
            onClick={() => router.push('/properties')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            物件一覧に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">予約管理</h2>

          {/* フィルター */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  物件で絞り込み
                </label>
                <select
                  value={selectedProperty}
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべての物件</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータスで絞り込み
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as BookingStatus | '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">すべてのステータス</option>
                  <option value="PENDING">保留中</option>
                  <option value="CONFIRMED">確定</option>
                  <option value="CHECKED_IN">チェックイン済み</option>
                  <option value="CHECKED_OUT">チェックアウト済み</option>
                  <option value="CANCELLED">キャンセル</option>
                </select>
              </div>
            </div>
          </div>

          {/* 予約統計 */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">総予約数</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">保留中</p>
              <p className="text-2xl font-bold text-yellow-700">
                {bookings.filter((b) => b.status === 'PENDING').length}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">確定</p>
              <p className="text-2xl font-bold text-green-700">
                {bookings.filter((b) => b.status === 'CONFIRMED').length}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">チェックイン済</p>
              <p className="text-2xl font-bold text-blue-700">
                {bookings.filter((b) => b.status === 'CHECKED_IN').length}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">完了</p>
              <p className="text-2xl font-bold text-gray-700">
                {bookings.filter((b) => b.status === 'CHECKED_OUT').length}
              </p>
            </div>
          </div>
        </div>

        {/* 予約一覧 */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">
              {selectedProperty || selectedStatus ? '該当する予約がありません' : 'まだ予約がありません'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-1">
                      {booking.room?.property.name || '物件名不明'}
                    </h2>
                    <p className="text-gray-600">{booking.room?.name || '部屋情報なし'}</p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">チェックイン</p>
                    <p className="text-gray-900 font-medium">{formatDate(booking.checkInDate)}</p>
                    <p className="text-sm text-gray-500">
                      {booking.room?.property.checkInTime || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">チェックアウト</p>
                    <p className="text-gray-900 font-medium">{formatDate(booking.checkOutDate)}</p>
                    <p className="text-sm text-gray-500">
                      {booking.room?.property.checkOutTime || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">宿泊数 / 人数</p>
                    <p className="text-gray-900 font-medium">
                      {calculateNights(booking.checkInDate, booking.checkOutDate)}泊 / {booking.numberOfGuests}名
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">合計料金</p>
                    <p className="text-gray-900 font-semibold text-lg">
                      ¥{booking.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">ゲスト名</p>
                    <p className="text-gray-900">{booking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">メールアドレス</p>
                    <p className="text-gray-900">{booking.guestEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">電話番号</p>
                    <p className="text-gray-900">{booking.guestPhone}</p>
                  </div>
                </div>

                {booking.specialRequests && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">特別なリクエスト</p>
                    <p className="text-gray-900 whitespace-pre-wrap">{booking.specialRequests}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    詳細を見る
                  </button>

                  {getAvailableStatusTransitions(booking.status).length > 0 && (
                    <div className="flex gap-2">
                      {getAvailableStatusTransitions(booking.status).map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(booking.id, status)}
                          disabled={updatingStatus === booking.id}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            status === 'CANCELLED'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          } disabled:bg-gray-300 disabled:text-gray-500`}
                        >
                          {updatingStatus === booking.id
                            ? '更新中...'
                            : `${getStatusLabel(status)}に変更`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
