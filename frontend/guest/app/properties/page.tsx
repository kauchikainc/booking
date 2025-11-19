'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import { Property, PropertyType } from '@/lib/types';
import Navbar from '@/components/Navbar';

// 物件タイプの日本語ラベル
const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  HOTEL: 'ホテル',
  HOSTEL: 'ホステル',
  GUESTHOUSE: 'ゲストハウス',
  APARTMENT: 'アパートメント',
  RESORT: 'リゾート',
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // フィルター状態
  const [filter, setFilter] = useState<PropertyType | 'ALL'>('ALL');
  const [keyword, setKeyword] = useState('');
  const [area, setArea] = useState('');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [guests, setGuests] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'price' | 'createdAt' | 'name'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [total, setTotal] = useState(0);

  // 検索フィルター表示状態
  const [showFilters, setShowFilters] = useState(false);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string | number> = {};

      if (filter !== 'ALL') params.type = filter;
      if (keyword) params.keyword = keyword;
      if (area) params.area = area;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (guests) params.guests = guests;
      if (sortBy) params.sortBy = sortBy;
      if (sortOrder) params.sortOrder = sortOrder;

      const data = await apiClient.getProperties(params);
      setProperties(data.properties);
      setTotal(data.total);
    } catch (err) {
      setError('物件一覧の読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sortBy, sortOrder]);

  // 検索実行
  const handleSearch = () => {
    loadProperties();
  };

  // フィルターリセット
  const handleResetFilters = () => {
    setKeyword('');
    setArea('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setGuests(undefined);
    setFilter('ALL');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  // 最低料金を取得
  const getMinPrice = (property: Property): number | null => {
    if (!property.rooms || property.rooms.length === 0) return null;
    const prices = property.rooms.map(r => r.pricePerNight);
    return Math.min(...prices);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">宿泊施設を探す</h2>
          <p className="mt-2 text-gray-600">あなたにぴったりの宿泊施設を見つけましょう</p>
        </div>

        {/* 検索バーと詳細フィルターボタン */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 flex-wrap">
            {/* キーワード検索 */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="キーワードで検索（例：温泉、駅近）"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* エリア検索 */}
            <div className="w-48">
              <input
                type="text"
                placeholder="エリア（例：東京）"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 検索ボタン */}
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              検索
            </button>

            {/* 詳細フィルターボタン */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              詳細フィルター
            </button>
          </div>

          {/* 詳細フィルター（展開式） */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 価格範囲 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">価格範囲（円/泊）</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="最低"
                      value={minPrice || ''}
                      onChange={(e) => setMinPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="self-center">〜</span>
                    <input
                      type="number"
                      placeholder="最高"
                      value={maxPrice || ''}
                      onChange={(e) => setMaxPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* 人数 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">宿泊人数</label>
                  <input
                    type="number"
                    placeholder="人数"
                    min="1"
                    value={guests || ''}
                    onChange={(e) => setGuests(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* ソート */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">並び順</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [by, order] = e.target.value.split('-');
                      setSortBy(by as 'price' | 'createdAt' | 'name');
                      setSortOrder(order as 'asc' | 'desc');
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="createdAt-desc">新着順</option>
                    <option value="createdAt-asc">古い順</option>
                    <option value="price-asc">価格が安い順</option>
                    <option value="price-desc">価格が高い順</option>
                    <option value="name-asc">名前順（A-Z）</option>
                    <option value="name-desc">名前順（Z-A）</option>
                  </select>
                </div>

                {/* リセットボタン */}
                <div className="self-end">
                  <button
                    onClick={handleResetFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    フィルターをリセット
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 物件タイプフィルター */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(['ALL', 'HOTEL', 'HOSTEL', 'GUESTHOUSE', 'APARTMENT', 'RESORT'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition ${
                  filter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {type === 'ALL' ? '全て' : PROPERTY_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
            <p className="text-gray-600">該当する宿泊施設がありません</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {total}件の宿泊施設が見つかりました
              </div>
              {(keyword || area || minPrice || maxPrice || guests || filter !== 'ALL') && (
                <button
                  onClick={handleResetFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  すべてのフィルターをクリア
                </button>
              )}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-xl transition group"
                >
                  {/* 画像プレースホルダー */}
                  <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-t-lg flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-white opacity-50"
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

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-1">
                        {property.name}
                      </h2>
                      <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-full whitespace-nowrap ml-2">
                        {PROPERTY_TYPE_LABELS[property.type]}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {property.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-500 mb-4">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="line-clamp-1">{property.address}</span>
                      </div>

                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          チェックイン {property.checkInTime} / チェックアウト {property.checkOutTime}
                        </span>
                      </div>
                    </div>

                    {getMinPrice(property) && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-baseline">
                          <span className="text-2xl font-bold text-gray-900">
                            ¥{getMinPrice(property)?.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">〜 / 泊</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
