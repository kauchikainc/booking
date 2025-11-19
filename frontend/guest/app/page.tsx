'use client';

import Link from 'next/link';

/**
 * ルートページ（ランディングページ）
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              宿泊予約システム
            </Link>
            <div className="flex gap-4">
              <Link
                href="/properties"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                宿泊施設を探す
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                ログイン
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ヒーローセクション */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            理想の宿泊先を見つけよう
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ホテル、ホステル、ゲストハウスなど、様々な宿泊施設から
            <br />
            あなたにぴったりの場所を見つけましょう
          </p>
          <Link
            href="/properties"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition shadow-lg"
          >
            宿泊施設を探す →
          </Link>
        </div>

        {/* 特徴セクション */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">簡単検索</h3>
            <p className="text-gray-600">
              タイプ別フィルターで、あなたの希望に合った宿泊施設をすぐに見つけられます
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">安心予約</h3>
            <p className="text-gray-600">
              詳細な施設情報と料金が一目でわかる、透明性の高い予約システム
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">24時間対応</h3>
            <p className="text-gray-600">
              いつでもどこでも、お好きな時間に宿泊施設を探して予約できます
            </p>
          </div>
        </div>

        {/* CTAセクション */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            今すぐ始めましょう
          </h2>
          <p className="text-gray-600 mb-8">
            無料でアカウントを作成して、お得な情報やマイページ機能をご利用いただけます
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              新規登録
            </Link>
            <Link
              href="/properties"
              className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
            >
              宿泊施設を見る
            </Link>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>&copy; 2025 宿泊予約システム. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
