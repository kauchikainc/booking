# データベース設計

## 概要

PostgreSQLを使用した民泊・ゲストハウス予約サービスのデータベース設計。

## ER図

```
┌─────────────────┐
│     users       │ ユーザー（全種別共通）
├─────────────────┤
│ id              │ PK
│ email           │ UNIQUE
│ password_hash   │
│ role            │ ENUM(guest, owner, admin)
│ status          │ ENUM(active, inactive, suspended)
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
┌────────▼────────┐     │
│  guest_profiles │     │ 一般利用者プロフィール
├─────────────────┤     │
│ id              │ PK  │
│ user_id         │ FK ─┘
│ first_name      │
│ last_name       │
│ phone           │
│ date_of_birth   │
│ nationality     │
│ created_at      │
│ updated_at      │
└─────────────────┘
         │
         │
┌────────▼────────┐
│   bookings      │ 予約
├─────────────────┤
│ id              │ PK
│ guest_id        │ FK → guest_profiles.id
│ property_id     │ FK → properties.id
│ check_in_date   │
│ check_out_date  │
│ num_guests      │
│ total_price     │
│ status          │ ENUM(pending, confirmed, cancelled, completed)
│ special_requests│
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
┌────────▼────────┐
│     reviews     │ レビュー
├─────────────────┤
│ id              │ PK
│ booking_id      │ FK → bookings.id
│ property_id     │ FK → properties.id
│ guest_id        │ FK → guest_profiles.id
│ rating          │ INT (1-5)
│ comment         │
│ created_at      │
│ updated_at      │
└─────────────────┘


┌─────────────────┐
│ owner_profiles  │ 施設オーナープロフィール
├─────────────────┤
│ id              │ PK
│ user_id         │ FK → users.id
│ company_name    │
│ representative  │
│ phone           │
│ address         │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
┌────────▼────────┐
│   properties    │ 宿泊施設
├─────────────────┤
│ id              │ PK
│ owner_id        │ FK → owner_profiles.id
│ name            │
│ description     │
│ property_type   │ ENUM(guesthouse, hostel, private_room, entire_place)
│ address         │
│ latitude        │
│ longitude       │
│ max_guests      │
│ num_bedrooms    │
│ num_beds        │
│ num_bathrooms   │
│ price_per_night │
│ status          │ ENUM(draft, pending_review, active, inactive)
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
┌────────▼────────┐     │
│property_amenities│    │ 施設設備
├─────────────────┤     │
│ id              │ PK  │
│ property_id     │ FK ─┘
│ amenity_type    │ FK → amenity_types.id
│ created_at      │
└─────────────────┘
         │
┌────────▼────────┐
│  amenity_types  │ 設備種類マスタ
├─────────────────┤
│ id              │ PK
│ name            │ (wifi, parking, kitchen, etc.)
│ icon            │
│ category        │ ENUM(basic, comfort, safety)
│ created_at      │
└─────────────────┘


┌─────────────────┐
│ property_images │ 施設画像
├─────────────────┤
│ id              │ PK
│ property_id     │ FK → properties.id
│ image_url       │
│ display_order   │
│ is_primary      │
│ created_at      │
└─────────────────┘


┌─────────────────┐
│ availability    │ 空き枠管理
├─────────────────┤
│ id              │ PK
│ property_id     │ FK → properties.id
│ date            │
│ is_available    │
│ price_override  │ 特定日の料金上書き
│ min_nights      │ 最小宿泊日数
│ created_at      │
│ updated_at      │
└─────────────────┘
UNIQUE(property_id, date)


┌─────────────────┐
│   invitations   │ 招待管理
├─────────────────┤
│ id              │ PK
│ email           │
│ role            │ ENUM(owner, admin)
│ token           │ UNIQUE
│ invited_by      │ FK → users.id
│ status          │ ENUM(pending, accepted, expired)
│ expires_at      │
│ created_at      │
│ updated_at      │
└─────────────────┘


┌─────────────────┐
│  notifications  │ 通知
├─────────────────┤
│ id              │ PK
│ user_id         │ FK → users.id
│ type            │ ENUM(booking, review, system)
│ title           │
│ message         │
│ is_read         │
│ created_at      │
└─────────────────┘
```

## テーブル定義

### users テーブル

全ユーザー種別の共通情報を管理。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | ユーザーID |
| email | VARCHAR(255) | NO | - | メールアドレス（ログインID） |
| password_hash | VARCHAR(255) | NO | - | パスワードハッシュ |
| role | ENUM | NO | 'guest' | ユーザー種別 |
| status | ENUM | NO | 'active' | アカウント状態 |
| email_verified | BOOLEAN | NO | false | メール認証済みフラグ |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- UNIQUE: email
- CHECK: role IN ('guest', 'owner', 'admin')
- CHECK: status IN ('active', 'inactive', 'suspended')

**インデックス:**
- PRIMARY KEY: id
- INDEX: email
- INDEX: role, status

---

### guest_profiles テーブル

一般利用者の詳細プロフィール。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | プロフィールID |
| user_id | UUID | NO | - | ユーザーID |
| first_name | VARCHAR(100) | YES | NULL | 名 |
| last_name | VARCHAR(100) | YES | NULL | 姓 |
| phone | VARCHAR(20) | YES | NULL | 電話番号 |
| date_of_birth | DATE | YES | NULL | 生年月日 |
| nationality | VARCHAR(2) | YES | NULL | 国籍（ISO 3166-1 alpha-2） |
| profile_image_url | TEXT | YES | NULL | プロフィール画像URL |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY: user_id → users.id (ON DELETE CASCADE)
- UNIQUE: user_id

**インデックス:**
- PRIMARY KEY: id
- INDEX: user_id

---

### owner_profiles テーブル

施設オーナーの詳細プロフィール。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | プロフィールID |
| user_id | UUID | NO | - | ユーザーID |
| company_name | VARCHAR(200) | YES | NULL | 会社名・屋号 |
| representative | VARCHAR(100) | YES | NULL | 代表者名 |
| phone | VARCHAR(20) | NO | - | 電話番号 |
| postal_code | VARCHAR(10) | YES | NULL | 郵便番号 |
| address | TEXT | NO | - | 住所 |
| business_license | VARCHAR(100) | YES | NULL | 事業許可番号 |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY: user_id → users.id (ON DELETE CASCADE)
- UNIQUE: user_id

**インデックス:**
- PRIMARY KEY: id
- INDEX: user_id

---

### properties テーブル

宿泊施設情報。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | 施設ID |
| owner_id | UUID | NO | - | オーナーID |
| name | VARCHAR(200) | NO | - | 施設名 |
| description | TEXT | YES | NULL | 施設説明 |
| property_type | ENUM | NO | - | 施設タイプ |
| address | TEXT | NO | - | 住所 |
| latitude | DECIMAL(10,8) | YES | NULL | 緯度 |
| longitude | DECIMAL(11,8) | YES | NULL | 経度 |
| max_guests | INTEGER | NO | - | 最大宿泊人数 |
| num_bedrooms | INTEGER | NO | 0 | 寝室数 |
| num_beds | INTEGER | NO | - | ベッド数 |
| num_bathrooms | DECIMAL(3,1) | NO | 1 | バスルーム数（0.5刻み） |
| price_per_night | INTEGER | NO | - | 1泊あたりの料金（円） |
| cleaning_fee | INTEGER | NO | 0 | 清掃料金（円） |
| status | ENUM | NO | 'draft' | 公開状態 |
| check_in_time | TIME | NO | '15:00' | チェックイン時刻 |
| check_out_time | TIME | NO | '10:00' | チェックアウト時刻 |
| cancellation_policy | TEXT | YES | NULL | キャンセルポリシー |
| house_rules | TEXT | YES | NULL | ハウスルール |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY: owner_id → owner_profiles.id (ON DELETE CASCADE)
- CHECK: property_type IN ('guesthouse', 'hostel', 'private_room', 'entire_place', 'shared_room')
- CHECK: status IN ('draft', 'pending_review', 'active', 'inactive', 'rejected')
- CHECK: max_guests > 0
- CHECK: num_beds > 0
- CHECK: price_per_night > 0

**インデックス:**
- PRIMARY KEY: id
- INDEX: owner_id
- INDEX: status
- INDEX: property_type
- INDEX: latitude, longitude (空間インデックス)

---

### amenity_types テーブル

設備・アメニティのマスタデータ。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | 設備タイプID |
| name | VARCHAR(100) | NO | - | 設備名 |
| slug | VARCHAR(100) | NO | - | URLスラグ |
| icon | VARCHAR(50) | YES | NULL | アイコン名 |
| category | ENUM | NO | - | カテゴリ |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |

**制約:**
- UNIQUE: name
- UNIQUE: slug
- CHECK: category IN ('basic', 'comfort', 'safety', 'accessibility')

**インデックス:**
- PRIMARY KEY: id
- INDEX: category

**初期データ例:**
- wifi, parking, kitchen, air_conditioning, heating, washer, dryer, tv, iron, hair_dryer, shampoo, first_aid_kit, fire_extinguisher, smoke_alarm, carbon_monoxide_alarm, etc.

---

### property_amenities テーブル

施設と設備の関連。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | ID |
| property_id | UUID | NO | - | 施設ID |
| amenity_type_id | UUID | NO | - | 設備タイプID |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |

**制約:**
- FOREIGN KEY: property_id → properties.id (ON DELETE CASCADE)
- FOREIGN KEY: amenity_type_id → amenity_types.id (ON DELETE CASCADE)
- UNIQUE: property_id, amenity_type_id

**インデックス:**
- PRIMARY KEY: id
- INDEX: property_id
- INDEX: amenity_type_id

---

### property_images テーブル

施設の画像。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | 画像ID |
| property_id | UUID | NO | - | 施設ID |
| image_url | TEXT | NO | - | 画像URL |
| display_order | INTEGER | NO | 0 | 表示順序 |
| is_primary | BOOLEAN | NO | false | メイン画像フラグ |
| caption | VARCHAR(200) | YES | NULL | キャプション |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |

**制約:**
- FOREIGN KEY: property_id → properties.id (ON DELETE CASCADE)

**インデックス:**
- PRIMARY KEY: id
- INDEX: property_id, display_order
- INDEX: property_id, is_primary

---

### availability テーブル

施設の空き枠管理。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | ID |
| property_id | UUID | NO | - | 施設ID |
| date | DATE | NO | - | 日付 |
| is_available | BOOLEAN | NO | true | 予約可能フラグ |
| price_override | INTEGER | YES | NULL | 特定日の料金上書き |
| min_nights | INTEGER | YES | NULL | 最小宿泊日数 |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY: property_id → properties.id (ON DELETE CASCADE)
- UNIQUE: property_id, date
- CHECK: price_override IS NULL OR price_override > 0
- CHECK: min_nights IS NULL OR min_nights > 0

**インデックス:**
- PRIMARY KEY: id
- INDEX: property_id, date
- INDEX: date

---

### bookings テーブル

予約情報。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | 予約ID |
| guest_id | UUID | NO | - | ゲストID |
| property_id | UUID | NO | - | 施設ID |
| check_in_date | DATE | NO | - | チェックイン日 |
| check_out_date | DATE | NO | - | チェックアウト日 |
| num_guests | INTEGER | NO | - | 宿泊人数 |
| num_nights | INTEGER | NO | - | 宿泊日数 |
| subtotal | INTEGER | NO | - | 小計（宿泊料金） |
| cleaning_fee | INTEGER | NO | 0 | 清掃料金 |
| service_fee | INTEGER | NO | 0 | サービス料 |
| total_price | INTEGER | NO | - | 合計金額 |
| status | ENUM | NO | 'pending' | 予約状態 |
| special_requests | TEXT | YES | NULL | 特別なリクエスト |
| cancelled_at | TIMESTAMP | YES | NULL | キャンセル日時 |
| cancellation_reason | TEXT | YES | NULL | キャンセル理由 |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY: guest_id → guest_profiles.id
- FOREIGN KEY: property_id → properties.id
- CHECK: status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')
- CHECK: check_out_date > check_in_date
- CHECK: num_guests > 0
- CHECK: num_nights > 0
- CHECK: total_price > 0

**インデックス:**
- PRIMARY KEY: id
- INDEX: guest_id
- INDEX: property_id
- INDEX: status
- INDEX: check_in_date, check_out_date
- INDEX: created_at

---

### reviews テーブル

レビュー・評価。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | レビューID |
| booking_id | UUID | NO | - | 予約ID |
| property_id | UUID | NO | - | 施設ID |
| guest_id | UUID | NO | - | ゲストID |
| rating | INTEGER | NO | - | 総合評価（1-5） |
| cleanliness_rating | INTEGER | YES | NULL | 清潔さ評価 |
| accuracy_rating | INTEGER | YES | NULL | 正確性評価 |
| location_rating | INTEGER | YES | NULL | 立地評価 |
| value_rating | INTEGER | YES | NULL | コスパ評価 |
| comment | TEXT | YES | NULL | コメント |
| owner_response | TEXT | YES | NULL | オーナー返信 |
| owner_responded_at | TIMESTAMP | YES | NULL | オーナー返信日時 |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY: booking_id → bookings.id
- FOREIGN KEY: property_id → properties.id
- FOREIGN KEY: guest_id → guest_profiles.id
- UNIQUE: booking_id
- CHECK: rating BETWEEN 1 AND 5
- CHECK: cleanliness_rating IS NULL OR cleanliness_rating BETWEEN 1 AND 5
- CHECK: accuracy_rating IS NULL OR accuracy_rating BETWEEN 1 AND 5
- CHECK: location_rating IS NULL OR location_rating BETWEEN 1 AND 5
- CHECK: value_rating IS NULL OR value_rating BETWEEN 1 AND 5

**インデックス:**
- PRIMARY KEY: id
- INDEX: property_id
- INDEX: guest_id
- INDEX: created_at

---

### invitations テーブル

オーナーや管理者の招待管理。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | 招待ID |
| email | VARCHAR(255) | NO | - | 招待先メールアドレス |
| role | ENUM | NO | - | 招待先のロール |
| token | VARCHAR(255) | NO | - | 招待トークン |
| invited_by | UUID | NO | - | 招待者ID |
| status | ENUM | NO | 'pending' | 招待状態 |
| expires_at | TIMESTAMP | NO | - | 有効期限 |
| accepted_at | TIMESTAMP | YES | NULL | 承認日時 |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |
| updated_at | TIMESTAMP | NO | NOW() | 更新日時 |

**制約:**
- FOREIGN KEY: invited_by → users.id
- UNIQUE: token
- CHECK: role IN ('owner', 'admin')
- CHECK: status IN ('pending', 'accepted', 'expired', 'cancelled')

**インデックス:**
- PRIMARY KEY: id
- INDEX: email
- INDEX: token
- INDEX: status, expires_at

---

### notifications テーブル

ユーザー通知。

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | UUID | NO | gen_random_uuid() | 通知ID |
| user_id | UUID | NO | - | ユーザーID |
| type | ENUM | NO | - | 通知タイプ |
| title | VARCHAR(200) | NO | - | タイトル |
| message | TEXT | NO | - | メッセージ |
| link_url | TEXT | YES | NULL | リンクURL |
| is_read | BOOLEAN | NO | false | 既読フラグ |
| created_at | TIMESTAMP | NO | NOW() | 作成日時 |

**制約:**
- FOREIGN KEY: user_id → users.id (ON DELETE CASCADE)
- CHECK: type IN ('booking', 'review', 'system', 'message')

**インデックス:**
- PRIMARY KEY: id
- INDEX: user_id, is_read
- INDEX: created_at

---

## データベース初期化スクリプト

データベースの初期化は以下の順序で実行：

1. スキーマ作成（`schema.sql`）
2. マスタデータ投入（`seeds/amenity_types.sql`）
3. 初期管理者アカウント作成（`seeds/initial_admin.sql`）

## バックアップ戦略

- 日次: フルバックアップ
- 時間毎: 差分バックアップ
- WAL（Write-Ahead Logging）によるポイントインタイムリカバリ対応

## セキュリティ対策

1. **パスワードハッシュ化**: bcryptを使用（コスト係数: 12）
2. **接続の暗号化**: SSL/TLS必須
3. **最小権限の原則**: アプリケーションユーザーは必要最小限の権限のみ
4. **SQLインジェクション対策**: パラメータ化クエリ必須
5. **個人情報の暗号化**: クレジットカード情報などは暗号化して保存（将来対応）
