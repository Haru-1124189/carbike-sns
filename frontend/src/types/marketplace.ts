import { Timestamp } from 'firebase/firestore';

// ユーザーのマーケットプレイス情報
export interface MarketplaceUser {
  uid: string;
  displayName: string;
  photoURL?: string;
  language: string;
  country: string;
  isVerifiedSeller: boolean;
  rating: number;
  ratingCount: number;
  sellerStats: {
    sold: number;
    canceled: number;
  };
  address?: {
    country: string;
    region: string;
    postal: string;
    city: string;
    prefecture?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 商品カテゴリ
export type ItemCategory = 
  | 'engine'      // エンジン
  | 'suspension'  // サスペンション
  | 'brake'       // ブレーキ
  | 'electrical'  // 電気
  | 'body'        // ボディ
  | 'tire'        // タイヤ
  | 'interior'    // インテリア
  | 'exterior'    // 外装
  | 'audio'       // オーディオ
  | 'tool'        // 工具
  | 'other';      // その他

// 商品状態
export type ItemCondition = 'new' | 'used' | 'junk';

// 商品ステータス
export type ItemStatus = 'active' | 'reserved' | 'sold' | 'paused' | 'removed';

// 通貨
export type Currency = 'JPY' | 'USD' | 'EUR';

// 配送方法
export type ShippingMethod = 'buyer_pays' | 'seller_pays';

// 出品者タイプ
export type SellerType = 'individual' | 'shop';

// 商品情報
export interface MarketplaceItem {
  id: string;
  sellerId: string;
  sellerType: SellerType; // 個人間フリマ or Shop
  title: string;
  description: string;
  category: ItemCategory;
  tags: string[]; // 自由タグ（例: ["新品同様", "即決可", "送料無料"]）
  vehicleTags: string[]; // 例: ["ZC33S", "SwiftSport"]
  compatibility?: {
    make: string;
    model: string;
    yearFrom: number;
    yearTo: number;
    code?: string;
  };
  condition: ItemCondition;
  price: number;
  currency: Currency;
  shipping: {
    method: ShippingMethod;
    fee?: number;
    area?: string;
  };
  images: string[]; // Storage パス
  thumbnail: string;
  status: ItemStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  moderated: {
    state: 'clean' | 'flagged' | 'removed';
    reason?: string;
  };
  sellerLanguage: string;
  sellerCountry: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  search: {
    keywords: string[];
    normalizedTitle: string;
  };
}

// 注文ステータス
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'canceled' | 'refunded';

// 配送追跡情報
export interface ShippingTracking {
  carrier: string;
  trackingNumber: string;
  url?: string;
}

// 配送先住所
export interface ShippingAddress {
  name: string;
  postal: string;
  region: string;
  city: string;
  address1: string;
  address2?: string;
  country: string;
  phone?: string;
}

// 注文情報
export interface MarketplaceOrder {
  id: string;
  itemId: string;
  sellerId: string;
  buyerId: string;
  amount: number;
  currency: Currency;
  marketplaceFee: number;
  stripePaymentIntentId?: string;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  shippingTracking?: ShippingTracking;
  timestamps: {
    createdAt: Timestamp;
    paidAt?: Timestamp;
    shippedAt?: Timestamp;
    completedAt?: Timestamp;
    canceledAt?: Timestamp;
  };
}

// レビュー情報
export interface MarketplaceReview {
  id: string;
  orderId: string;
  targetUserId: string;
  authorUserId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Timestamp;
}

// 通報対象タイプ
export type ReportTargetType = 'item' | 'user' | 'order';

// 通報理由
export type ReportReason = 
  | 'inappropriate_content'
  | 'fake_item'
  | 'price_manipulation'
  | 'harassment'
  | 'spam'
  | 'other';

// 通報情報
export interface MarketplaceReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reporterId: string;
  reason: ReportReason;
  description?: string;
  createdAt: Timestamp;
  state: 'open' | 'reviewed' | 'actioned';
  reviewedBy?: string;
  reviewedAt?: Timestamp;
}

// スポンサースロット（将来の広告用）
export interface SponsorSlot {
  id: string;
  position: string;
  title: string;
  image: string;
  linkUrl: string;
  countries: string[];
  languages: string[];
  active: boolean;
  impressions: number;
  clicks: number;
  createdAt: Timestamp;
}

// 出品用のフォームデータ
export interface CreateItemData {
  title: string;
  description: string;
  category: ItemCategory;
  tags: string[];
  vehicleTags: string[];
  compatibility?: {
    make: string;
    model: string;
    yearFrom: number;
    yearTo: number;
    code?: string;
  };
  condition: ItemCondition;
  price: number;
  currency: Currency;
  shipping: {
    method: ShippingMethod;
    fee?: number;
    area?: string;
  };
  images: File[];
  sellerType: SellerType; // 個人間フリマ or Shop
}

// 注文作成用のデータ
export interface CreateOrderData {
  itemId: string;
  shippingAddress: ShippingAddress;
}

// レビュー作成用のデータ
export interface CreateReviewData {
  orderId: string;
  targetUserId: string;
  rating: number;
  title: string;
  comment: string;
  recommend: boolean;
}

// 通報作成用のデータ
export interface CreateReportData {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}

// 検索フィルタ
export interface ItemSearchFilter {
  category?: ItemCategory;
  vehicleTags?: string[];
  condition?: ItemCondition;
  priceMin?: number;
  priceMax?: number;
  currency?: Currency;
  country?: string;
  language?: string;
  status?: ItemStatus;
  sellerId?: string; // 特定の出品者の商品のみを取得
  sellerType?: SellerType; // 個人間フリマ or Shopでフィルタ
}

// 並び替えオプション
export type SortOption = 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular';

// お気に入り
export interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  createdAt: Date;
}

// 検索結果
export interface ItemSearchResult {
  items: MarketplaceItem[];
  totalCount: number;
  hasMore: boolean;
}

// Stripe関連
export interface StripePaymentData {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: Currency;
}

// 統計情報
export interface MarketplaceStats {
  totalItems: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  topCategories: Array<{
    category: ItemCategory;
    count: number;
  }>;
  topVehicleTags: Array<{
    tag: string;
    count: number;
  }>;
}

// メッセージ機能の型定義
export interface MarketplaceMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  timestamp: Timestamp;
  read: boolean;
  itemId?: string; // 関連する商品ID
}

export interface MarketplaceConversation {
  id: string;
  participants: string[]; // [senderId, receiverId]
  itemId: string;
  lastMessage?: MarketplaceMessage;
  lastMessageAt: Timestamp;
  unreadCount: { [userId: string]: number };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 評価機能の型定義
export interface MarketplaceRating {
  id: string;
  itemId: string;
  orderId?: string;
  raterId: string; // 評価する人
  rateeId: string; // 評価される人
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  type: 'seller' | 'buyer'; // 出品者への評価 or 購入者への評価
  createdAt: Timestamp;
}