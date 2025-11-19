# API仕様書

## 概要

RESTful APIによる民泊・ゲストハウス予約サービスのバックエンドAPI仕様。

### ベースURL

```
開発環境: http://localhost:3100/api/v1
本番環境: https://api.booking-service.example.com/v1
```

### 認証方式

JWT (JSON Web Token) を使用したBearer認証。

```
Authorization: Bearer <token>
```

### レスポンス形式

すべてのレスポンスはJSON形式。

#### 成功レスポンス

```json
{
  "success": true,
  "data": { ... }
}
```

#### エラーレスポンス

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": { ... }
  }
}
```

### HTTPステータスコード

| コード | 説明 |
|-------|------|
| 200 | OK - 成功 |
| 201 | Created - リソース作成成功 |
| 400 | Bad Request - リクエストが不正 |
| 401 | Unauthorized - 認証が必要 |
| 403 | Forbidden - 権限がない |
| 404 | Not Found - リソースが見つからない |
| 409 | Conflict - リソースの競合 |
| 422 | Unprocessable Entity - バリデーションエラー |
| 500 | Internal Server Error - サーバーエラー |

---

## 認証・認可 API

### POST /auth/register/guest

一般利用者の新規登録。

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "太郎",
  "lastName": "山田"
}
```

**レスポンス:** 201 Created
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "guest"
    },
    "token": "jwt-token",
    "expiresIn": 86400
  }
}
```

---

### POST /auth/register/owner

施設オーナーの登録（招待トークン必須）。

**リクエスト:**
```json
{
  "token": "invitation-token",
  "password": "SecurePassword123!",
  "companyName": "株式会社ゲストハウス",
  "representative": "山田太郎",
  "phone": "03-1234-5678",
  "address": "東京都渋谷区..."
}
```

**レスポンス:** 201 Created
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "owner@example.com",
      "role": "owner"
    },
    "token": "jwt-token",
    "expiresIn": 86400
  }
}
```

---

### POST /auth/login

ログイン。

**リクエスト:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "guest"
    },
    "token": "jwt-token",
    "expiresIn": 86400
  }
}
```

---

### POST /auth/logout

ログアウト。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "message": "ログアウトしました"
  }
}
```

---

### POST /auth/refresh

トークンのリフレッシュ。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token",
    "expiresIn": 86400
  }
}
```

---

### GET /auth/me

ログイン中のユーザー情報取得。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "guest",
      "profile": { ... }
    }
  }
}
```

---

## 施設管理 API

### GET /properties

施設一覧取得（検索・フィルタリング）。

**クエリパラメータ:**
- `page`: ページ番号（デフォルト: 1）
- `limit`: 1ページあたりの件数（デフォルト: 20、最大: 100）
- `location`: 場所（住所の部分一致）
- `propertyType`: 施設タイプ（guesthouse, hostel, private_room, entire_place, shared_room）
- `minPrice`: 最低価格
- `maxPrice`: 最高価格
- `maxGuests`: 最大宿泊人数
- `checkIn`: チェックイン日（YYYY-MM-DD）
- `checkOut`: チェックアウト日（YYYY-MM-DD）
- `amenities`: アメニティID（カンマ区切り）
- `sortBy`: ソート基準（price, rating, createdAt）
- `order`: ソート順（asc, desc）

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "properties": [
      {
        "id": "uuid",
        "name": "東京ゲストハウス",
        "description": "...",
        "propertyType": "guesthouse",
        "address": "東京都渋谷区...",
        "maxGuests": 4,
        "numBedrooms": 2,
        "numBeds": 2,
        "numBathrooms": 1,
        "pricePerNight": 8000,
        "cleaningFee": 2000,
        "primaryImage": "https://...",
        "rating": 4.5,
        "reviewCount": 42,
        "amenities": ["wifi", "kitchen", "parking"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

---

### GET /properties/:id

施設詳細取得。

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "property": {
      "id": "uuid",
      "owner": {
        "id": "uuid",
        "companyName": "株式会社ゲストハウス"
      },
      "name": "東京ゲストハウス",
      "description": "...",
      "propertyType": "guesthouse",
      "address": "東京都渋谷区...",
      "latitude": 35.6585805,
      "longitude": 139.7454329,
      "maxGuests": 4,
      "numBedrooms": 2,
      "numBeds": 2,
      "numBathrooms": 1,
      "pricePerNight": 8000,
      "cleaningFee": 2000,
      "checkInTime": "15:00",
      "checkOutTime": "10:00",
      "cancellationPolicy": "...",
      "houseRules": "...",
      "images": [
        {
          "id": "uuid",
          "url": "https://...",
          "isPrimary": true,
          "caption": "リビングルーム"
        }
      ],
      "amenities": [
        {
          "id": "uuid",
          "name": "Wi-Fi",
          "slug": "wifi",
          "icon": "wifi",
          "category": "basic"
        }
      ],
      "rating": 4.5,
      "reviewCount": 42,
      "reviews": [
        {
          "id": "uuid",
          "guest": {
            "firstName": "太郎",
            "profileImage": "https://..."
          },
          "rating": 5,
          "comment": "とても快適でした",
          "createdAt": "2025-10-01T12:00:00Z"
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-10-01T00:00:00Z"
    }
  }
}
```

---

### POST /properties

施設の新規登録（オーナーのみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "name": "東京ゲストハウス",
  "description": "渋谷駅から徒歩5分...",
  "propertyType": "guesthouse",
  "address": "東京都渋谷区...",
  "latitude": 35.6585805,
  "longitude": 139.7454329,
  "maxGuests": 4,
  "numBedrooms": 2,
  "numBeds": 2,
  "numBathrooms": 1,
  "pricePerNight": 8000,
  "cleaningFee": 2000,
  "checkInTime": "15:00",
  "checkOutTime": "10:00",
  "cancellationPolicy": "...",
  "houseRules": "...",
  "amenityIds": ["uuid1", "uuid2"]
}
```

**レスポンス:** 201 Created
```json
{
  "success": true,
  "data": {
    "property": {
      "id": "uuid",
      "name": "東京ゲストハウス",
      "status": "draft",
      ...
    }
  }
}
```

---

### PUT /properties/:id

施設情報の更新（オーナー・管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:** POST /propertiesと同じ形式

**レスポンス:** 200 OK

---

### DELETE /properties/:id

施設の削除（オーナー・管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "message": "施設を削除しました"
  }
}
```

---

### POST /properties/:id/images

施設画像のアップロード（オーナーのみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:** multipart/form-data
- `image`: 画像ファイル
- `caption`: キャプション（任意）
- `isPrimary`: メイン画像フラグ（true/false）

**レスポンス:** 201 Created
```json
{
  "success": true,
  "data": {
    "image": {
      "id": "uuid",
      "url": "https://...",
      "caption": "リビングルーム",
      "isPrimary": true
    }
  }
}
```

---

### DELETE /properties/:propertyId/images/:imageId

施設画像の削除（オーナーのみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK

---

### GET /properties/:id/availability

施設の空き状況取得。

**クエリパラメータ:**
- `startDate`: 開始日（YYYY-MM-DD）
- `endDate`: 終了日（YYYY-MM-DD）

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "availability": [
      {
        "date": "2025-11-20",
        "isAvailable": true,
        "price": 8000
      },
      {
        "date": "2025-11-21",
        "isAvailable": false,
        "price": null
      }
    ]
  }
}
```

---

### PUT /properties/:id/availability

施設の空き状況更新（オーナーのみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "dates": [
    {
      "date": "2025-11-20",
      "isAvailable": true,
      "priceOverride": 10000
    },
    {
      "date": "2025-11-21",
      "isAvailable": false
    }
  ]
}
```

**レスポンス:** 200 OK

---

## 予約管理 API

### POST /bookings

予約の作成（一般利用者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "propertyId": "uuid",
  "checkInDate": "2025-11-20",
  "checkOutDate": "2025-11-22",
  "numGuests": 2,
  "specialRequests": "遅めのチェックインを希望します"
}
```

**レスポンス:** 201 Created
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "property": {
        "id": "uuid",
        "name": "東京ゲストハウス"
      },
      "checkInDate": "2025-11-20",
      "checkOutDate": "2025-11-22",
      "numGuests": 2,
      "numNights": 2,
      "subtotal": 16000,
      "cleaningFee": 2000,
      "serviceFee": 1800,
      "totalPrice": 19800,
      "status": "pending",
      "specialRequests": "遅めのチェックインを希望します",
      "createdAt": "2025-11-16T12:00:00Z"
    }
  }
}
```

---

### GET /bookings

予約一覧取得。

**ヘッダー:** `Authorization: Bearer <token>`

**クエリパラメータ:**
- `page`: ページ番号
- `limit`: 1ページあたりの件数
- `status`: 予約状態でフィルタリング
- `propertyId`: 施設IDでフィルタリング（オーナー・管理者のみ）

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "property": {
          "id": "uuid",
          "name": "東京ゲストハウス",
          "primaryImage": "https://..."
        },
        "checkInDate": "2025-11-20",
        "checkOutDate": "2025-11-22",
        "numGuests": 2,
        "totalPrice": 19800,
        "status": "confirmed",
        "createdAt": "2025-11-16T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### GET /bookings/:id

予約詳細取得。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "guest": {
        "id": "uuid",
        "firstName": "太郎",
        "lastName": "山田",
        "email": "user@example.com",
        "phone": "090-1234-5678"
      },
      "property": {
        "id": "uuid",
        "name": "東京ゲストハウス",
        "address": "東京都渋谷区...",
        "primaryImage": "https://...",
        "checkInTime": "15:00",
        "checkOutTime": "10:00"
      },
      "checkInDate": "2025-11-20",
      "checkOutDate": "2025-11-22",
      "numGuests": 2,
      "numNights": 2,
      "subtotal": 16000,
      "cleaningFee": 2000,
      "serviceFee": 1800,
      "totalPrice": 19800,
      "status": "confirmed",
      "specialRequests": "遅めのチェックインを希望します",
      "createdAt": "2025-11-16T12:00:00Z",
      "updatedAt": "2025-11-16T14:00:00Z"
    }
  }
}
```

---

### PUT /bookings/:id/status

予約状態の更新（オーナー・管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "status": "confirmed"
}
```

**レスポンス:** 200 OK

---

### POST /bookings/:id/cancel

予約のキャンセル。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "reason": "予定が変更になったため"
}
```

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "status": "cancelled",
      "cancelledAt": "2025-11-17T10:00:00Z",
      "cancellationReason": "予定が変更になったため"
    }
  }
}
```

---

## レビュー API

### POST /reviews

レビューの投稿（予約完了後のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "bookingId": "uuid",
  "rating": 5,
  "cleanlinessRating": 5,
  "accuracyRating": 4,
  "locationRating": 5,
  "valueRating": 4,
  "comment": "とても快適に過ごせました。ホストの対応も素晴らしかったです。"
}
```

**レスポンス:** 201 Created
```json
{
  "success": true,
  "data": {
    "review": {
      "id": "uuid",
      "property": {
        "id": "uuid",
        "name": "東京ゲストハウス"
      },
      "rating": 5,
      "comment": "とても快適に過ごせました...",
      "createdAt": "2025-11-25T12:00:00Z"
    }
  }
}
```

---

### GET /properties/:id/reviews

施設のレビュー一覧取得。

**クエリパラメータ:**
- `page`: ページ番号
- `limit`: 1ページあたりの件数
- `sortBy`: ソート基準（createdAt, rating）
- `order`: ソート順（asc, desc）

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "guest": {
          "firstName": "太郎",
          "profileImage": "https://..."
        },
        "rating": 5,
        "cleanlinessRating": 5,
        "accuracyRating": 4,
        "locationRating": 5,
        "valueRating": 4,
        "comment": "とても快適に過ごせました...",
        "ownerResponse": "ご利用ありがとうございました。",
        "ownerRespondedAt": "2025-11-26T10:00:00Z",
        "createdAt": "2025-11-25T12:00:00Z"
      }
    ],
    "statistics": {
      "averageRating": 4.5,
      "totalReviews": 42,
      "ratingDistribution": {
        "5": 25,
        "4": 10,
        "3": 5,
        "2": 1,
        "1": 1
      }
    },
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 42,
      "totalPages": 5
    }
  }
}
```

---

### POST /reviews/:id/response

オーナーの返信（オーナーのみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "response": "ご利用ありがとうございました。またのお越しをお待ちしております。"
}
```

**レスポンス:** 200 OK

---

## ユーザー管理 API

### GET /users/profile

自分のプロフィール取得。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "guest",
      "firstName": "太郎",
      "lastName": "山田",
      "phone": "090-1234-5678",
      "dateOfBirth": "1990-01-01",
      "nationality": "JP",
      "profileImage": "https://...",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

---

### PUT /users/profile

プロフィール更新。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "firstName": "太郎",
  "lastName": "山田",
  "phone": "090-1234-5678",
  "dateOfBirth": "1990-01-01"
}
```

**レスポンス:** 200 OK

---

### POST /users/profile/image

プロフィール画像のアップロード。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:** multipart/form-data
- `image`: 画像ファイル

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "profileImage": "https://..."
  }
}
```

---

## 管理者向け API

### POST /admin/invitations

オーナー・管理者の招待（管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "email": "owner@example.com",
  "role": "owner"
}
```

**レスポンス:** 201 Created
```json
{
  "success": true,
  "data": {
    "invitation": {
      "id": "uuid",
      "email": "owner@example.com",
      "role": "owner",
      "token": "invitation-token",
      "expiresAt": "2025-11-23T12:00:00Z"
    }
  }
}
```

---

### GET /admin/users

ユーザー一覧取得（管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**クエリパラメータ:**
- `page`: ページ番号
- `limit`: 1ページあたりの件数
- `role`: ロールでフィルタリング
- `status`: ステータスでフィルタリング
- `search`: メールアドレス・名前で検索

**レスポンス:** 200 OK

---

### PUT /admin/users/:id/status

ユーザーのステータス更新（管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "status": "suspended"
}
```

**レスポンス:** 200 OK

---

### GET /admin/properties

全施設一覧取得（管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**クエリパラメータ:**
- `page`: ページ番号
- `limit`: 1ページあたりの件数
- `status`: ステータスでフィルタリング

**レスポンス:** 200 OK

---

### PUT /admin/properties/:id/approve

施設の承認（管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "property": {
      "id": "uuid",
      "status": "active"
    }
  }
}
```

---

### PUT /admin/properties/:id/reject

施設の却下（管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**リクエスト:**
```json
{
  "reason": "情報が不十分です"
}
```

**レスポンス:** 200 OK

---

### GET /admin/statistics

統計情報取得（管理者のみ）。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "statistics": {
      "totalUsers": 1500,
      "totalGuests": 1450,
      "totalOwners": 48,
      "totalAdmins": 2,
      "totalProperties": 120,
      "activeProperties": 100,
      "totalBookings": 3500,
      "totalRevenue": 28000000,
      "averageBookingValue": 8000
    }
  }
}
```

---

## 通知 API

### GET /notifications

通知一覧取得。

**ヘッダー:** `Authorization: Bearer <token>`

**クエリパラメータ:**
- `page`: ページ番号
- `limit`: 1ページあたりの件数
- `isRead`: 既読フラグでフィルタリング

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "booking",
        "title": "予約が確定しました",
        "message": "東京ゲストハウスの予約が確定しました。",
        "linkUrl": "/bookings/uuid",
        "isRead": false,
        "createdAt": "2025-11-16T14:00:00Z"
      }
    ],
    "unreadCount": 5,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "totalPages": 2
    }
  }
}
```

---

### PUT /notifications/:id/read

通知を既読にする。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK

---

### PUT /notifications/read-all

全通知を既読にする。

**ヘッダー:** `Authorization: Bearer <token>`

**レスポンス:** 200 OK

---

## アメニティマスタ API

### GET /amenities

アメニティ一覧取得。

**レスポンス:** 200 OK
```json
{
  "success": true,
  "data": {
    "amenities": [
      {
        "id": "uuid",
        "name": "Wi-Fi",
        "slug": "wifi",
        "icon": "wifi",
        "category": "basic"
      },
      {
        "id": "uuid",
        "name": "駐車場",
        "slug": "parking",
        "icon": "parking",
        "category": "basic"
      }
    ]
  }
}
```

---

## エラーコード一覧

| コード | 説明 |
|-------|------|
| VALIDATION_ERROR | バリデーションエラー |
| UNAUTHORIZED | 認証が必要 |
| FORBIDDEN | 権限がない |
| NOT_FOUND | リソースが見つからない |
| DUPLICATE_EMAIL | メールアドレスが既に登録されている |
| INVALID_CREDENTIALS | メールアドレスまたはパスワードが間違っている |
| INVALID_TOKEN | トークンが無効 |
| TOKEN_EXPIRED | トークンの有効期限切れ |
| BOOKING_CONFLICT | 予約が重複している |
| PROPERTY_NOT_AVAILABLE | 施設が予約可能でない |
| REVIEW_ALREADY_EXISTS | 既にレビュー済み |
| BOOKING_NOT_COMPLETED | 予約が完了していない |
| INTERNAL_ERROR | サーバー内部エラー |

---

## レート制限

API呼び出しには以下のレート制限があります。

- 認証なし: 100リクエスト/時間
- 一般利用者: 1000リクエスト/時間
- オーナー: 2000リクエスト/時間
- 管理者: 5000リクエスト/時間

レート制限に達した場合、429 Too Many Requestsが返されます。

**レスポンスヘッダー:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1700000000
```
