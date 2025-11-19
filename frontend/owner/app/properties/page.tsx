'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/lib/store/auth';
import { Property, PropertyStatus } from '@/lib/types';

// ステータス表示用のバッジコンポーネント
function StatusBadge({ status }: { status: PropertyStatus }) {
  const styles = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
    PUBLISHED: 'bg-green-100 text-green-700 border-green-300',
    SUSPENDED: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    CLOSED: 'bg-red-100 text-red-700 border-red-300',
  };

  const labels = {
    DRAFT: '下書き',
    PUBLISHED: '公開中',
    SUSPENDED: '一時停止',
    CLOSED: '閉鎖',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function PropertiesPage() {
  const router = useRouter();
  const { user, fetchUser, isLoading: authLoading } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PropertyStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (!authLoading && !apiClient.hasToken()) {
      router.push('/login');
      return;
    }

    if (!user && apiClient.hasToken()) {
      fetchUser();
    }
  }, [user, authLoading, fetchUser, router]);

  useEffect(() => {
    if (user) {
      loadProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = filter !== 'ALL' ? { status: filter } : undefined;
      const data = await apiClient.getMyProperties(params);
      setProperties(data.properties);
    } catch (err) {
      setError('物件一覧の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      await apiClient.deleteProperty(id);
      await loadProperties();
      alert('物件を削除しました');
    } catch (err) {
      alert('物件の削除に失敗しました');
      console.error(err);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ページタイトル */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">物件管理</h1>
          <p className="text-sm text-gray-600 mt-2">
            {user.ownerProfile?.companyName || user.email}
          </p>
        </div>
        {/* アクションバー */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-2">
            {(['ALL', 'DRAFT', 'PUBLISHED', 'SUSPENDED', 'CLOSED'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  filter === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {status === 'ALL' ? '全て' : status}
              </button>
            ))}
          </div>
          <Link
            href="/properties/new"
            className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
          >
            + 新規物件登録
          </Link>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* ローディング */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">物件がありません</p>
            <Link
              href="/properties/new"
              className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition"
            >
              最初の物件を登録する
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {property.name}
                    </h2>
                    <StatusBadge status={property.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {property.description}
                  </p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>種別: {property.type}</p>
                    <p>住所: {property.address}</p>
                    <p className="text-xs">
                      チェックイン: {property.checkInTime} / チェックアウト: {property.checkOutTime}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/properties/${property.id}`}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700 transition text-center"
                    >
                      詳細
                    </Link>
                    <Link
                      href={`/properties/${property.id}/edit`}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200 transition text-center"
                    >
                      編集
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id, property.name)}
                      className="px-4 py-2 bg-red-50 text-red-700 text-sm font-medium rounded hover:bg-red-100 transition"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
