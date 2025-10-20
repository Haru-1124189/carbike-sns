import {
  ArrowLeft,
  Filter,
  Grid,
  List,
  ShoppingBag
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { MarketplaceItemCard } from '../components/ui/MarketplaceItemCard';
import { SearchBar } from '../components/ui/SearchBar';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { useItemSearch } from '../hooks/useMarketplace';
import { Currency, ItemCategory, ItemCondition, SortOption } from '../types/marketplace';

const CATEGORIES: { value: ItemCategory; label: string; icon: string }[] = [
  { value: 'engine', label: 'エンジン', icon: '🔧' },
  { value: 'suspension', label: 'サスペンション', icon: '🚗' },
  { value: 'brake', label: 'ブレーキ', icon: '🛑' },
  { value: 'electrical', label: '電気', icon: '⚡' },
  { value: 'body', label: 'ボディ', icon: '🚙' },
  { value: 'tire', label: 'タイヤ', icon: '🛞' },
  { value: 'interior', label: 'インテリア', icon: '🪑' },
  { value: 'exterior', label: '外装', icon: '🎨' },
  { value: 'audio', label: 'オーディオ', icon: '🔊' },
  { value: 'tool', label: '工具', icon: '🔨' },
  { value: 'other', label: 'その他', icon: '📦' }
];

const CONDITIONS: { value: ItemCondition; label: string }[] = [
  { value: 'new', label: '新品' },
  { value: 'used', label: '中古' },
  { value: 'junk', label: 'ジャンク' }
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: '新着順' },
  { value: 'price_low', label: '価格の安い順' },
  { value: 'price_high', label: '価格の高い順' },
  { value: 'popular', label: '人気順' }
];

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'JPY', label: '円', symbol: '¥' },
  { value: 'USD', label: 'ドル', symbol: '$' },
  { value: 'EUR', label: 'ユーロ', symbol: '€' }
];

interface MarketplaceHomePageProps {
  onBack?: () => void;
  onBackClick?: () => void;
  onNavigateToSell?: () => void;
  onNavigateToItemDetail?: (itemId: string) => void;
  onItemClick?: (item: any) => void;
  onSellClick?: () => void;
}

export const MarketplaceHomePage: React.FC<MarketplaceHomePageProps> = ({ 
  onBack, 
  onBackClick,
  onNavigateToSell,
  onNavigateToItemDetail,
  onItemClick,
  onSellClick
}) => {
  const { user, userDoc } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | undefined>();
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | undefined>();
  const [priceMin, setPriceMin] = useState<number | undefined>();
  const [priceMax, setPriceMax] = useState<number | undefined>();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('JPY');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all');
  // マーケットプレイスタイプの分けを削除

  // 検索クエリのデバウンス
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchFilter = useMemo(() => ({
    category: selectedCategory,
    condition: selectedCondition,
    priceMin,
    priceMax,
    currency: selectedCurrency,
    country: 'JP',
    language: 'ja',
    status: 'active' as const,
    sellerId: undefined,
    // sellerTypeフィルタを削除
  }), [selectedCategory, selectedCondition, priceMin, priceMax, selectedCurrency, activeTab, user?.uid]);

  const { items, loading, error, hasMore, loadMore } = useItemSearch(searchFilter, sortOption);

  // デバッグ用: フィルタの状態をコンソールに出力（簡略化）
  console.log('🔍 フィルタ状態:', {
    itemsCount: items.length,
    activeTab,
    selectedCategory,
    searchQuery: searchQuery || '(空)',
    debouncedSearchQuery: debouncedSearchQuery || '(空)'
  });
  const { favoriteItems, loading: favoritesLoading, toggleFavorite, isFavorite } = useFavorites();

  // 検索クエリでフィルタリング
  const filteredItems = useMemo(() => {
    if (activeTab === 'favorites') {
      return favoriteItems;
    }
    
    if (!debouncedSearchQuery.trim()) {
      return items;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    const filtered = items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query)) ||
      item.vehicleTags.some(tag => tag.toLowerCase().includes(query))
    );
    
    return filtered;
  }, [items, favoriteItems, activeTab, debouncedSearchQuery]);

  // タブに応じて表示する商品を決定
  const displayItems = filteredItems;
  const displayLoading = activeTab === 'favorites' ? favoritesLoading : loading;
  
  // 重要な表示状態のみログ出力
  if (displayItems.length === 0 && items.length > 0) {
    console.log('⚠️ 商品が表示されない問題:', {
      itemsCount: items.length,
      displayItemsCount: displayItems.length,
      activeTab,
      debouncedSearchQuery: debouncedSearchQuery || '(空)'
    });
  }

  // Stripeで管理するため、認証チェックを削除
  
  // Stripeで管理するため、管理者チェックも削除
  
  // デバッグ用: ユーザー情報をコンソールに出力（一時的に無効化）
  // console.log('🔍 ユーザー情報デバッグ:', {
  //   user: user,
  //   userDoc: userDoc,
  //   uid: user?.uid,
  //   email: user?.email,
  //   userDocRole: (userDoc as any)?.role,
  //   userDocIsAdmin: (userDoc as any)?.isAdmin,
  //   calculatedIsAdmin: isAdmin,
  //   marketplaceProfile: marketplaceProfile
  // });

  const handleCategorySelect = (category: ItemCategory) => {
    setSelectedCategory(selectedCategory === category ? undefined : category);
  };

  const handleConditionSelect = (condition: ItemCondition) => {
    setSelectedCondition(selectedCondition === condition ? undefined : condition);
  };

  // マーケットプレイスタイプ切り替えを削除

  // アクティブタブ切り替え時の処理
  const handleActiveTabChange = (tab: 'all' | 'favorites') => {
    // まずフィルタをクリアしてからタブを切り替え
    setSelectedCategory(undefined);
    setSelectedCondition(undefined);
    setPriceMin(undefined);
    setPriceMax(undefined);
    setSelectedCurrency('JPY');
    setSearchQuery('');
    setActiveTab(tab);
  };

  const clearFilters = () => {
    console.log('🧹 フィルタクリア');
    setSelectedCategory(undefined);
    setSelectedCondition(undefined);
    setPriceMin(undefined);
    setPriceMax(undefined);
    setSelectedCurrency('JPY');
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  const currencySymbol = CURRENCIES.find(c => c.value === selectedCurrency)?.symbol || '¥';

  // Stripeで管理するため、認証チェックを削除 - 直接マーケットプレイス画面を表示

  // Stripeで管理するため、すべての認証チェックを削除

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* メルカリスタイルのヘッダー */}
      {/* 固定ヘッダー */}
      <div className="sticky top-0 bg-gray-900 text-white z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
             <div className="flex items-center space-x-4">
               <button
                 onClick={() => {
                   onBack?.();
                   // App.tsxのタブ管理を使用してホームに戻る
                   if (typeof window !== 'undefined') {
                     // タブをホームに切り替える
                     window.dispatchEvent(new CustomEvent('changeTab', { detail: 'home' }));
                   }
                 }}
                 className="p-2 hover:bg-gray-800 rounded-full transition-colors"
               >
                 <ArrowLeft size={20} className="text-white" />
               </button>
              <h1 className="text-xl font-bold text-white">Revフリマ</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                {viewMode === 'grid' ? <List size={20} className="text-white" /> : <Grid size={20} className="text-white" />}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-full transition-colors ${
                  showFilters ? 'bg-red-500 text-white' : 'hover:bg-gray-800 text-white'
                }`}
              >
                <Filter size={20} />
              </button>
                      {/* テスト用：管理者でも出品可能 */}
                      <button
                        onClick={() => onNavigateToSell?.()}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                      >
                        出品
                      </button>
            </div>
          </div>
          
        </div>
      </div>

      {/* スクロール可能なコンテンツエリア */}
      <div className="px-4 py-3">
                 {/* マーケットプレイスタイプ切り替えタブを削除 */}

            {/* サブタブ */}
            <div className="flex space-x-1 mb-4 bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => handleActiveTabChange('all')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                全ての商品
              </button>
              <button
                onClick={() => handleActiveTabChange('favorites')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'favorites'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                お気に入り
              </button>
            </div>

            {/* 検索バー */}
            <div className="relative mb-6">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="パーツ名、型式で検索..."
              />
            </div>
      </div>

        <div className="max-w-4xl mx-auto pb-24" style={{ paddingBottom: '100px' }}>

        {/* 最適化されたフィルタパネル */}
        {showFilters && (
          <div className="bg-surface border-b border-border p-4">
            {/* フィルタパネルのヘッダー */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-text-primary">フィルタ</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="フィルタを閉じる"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {/* クイックフィルタ */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-3">クイックフィルタ</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('engine');
                      setSelectedCondition('used');
                    }}
                    className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                  >
                    🔧 中古エンジン
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory('suspension');
                      setSelectedCondition('used');
                    }}
                    className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                  >
                    🚗 中古サス
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory('brake');
                      setSelectedCondition('new');
                    }}
                    className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                  >
                    🛑 新品ブレーキ
                  </button>
                  <button
                    onClick={() => {
                      setPriceMin(10000);
                      setPriceMax(50000);
                    }}
                    className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                  >
                    💰 1-5万円
                  </button>
                  <button
                    onClick={() => {
                      // shopタグのフィルタを追加（検索クエリで実装）
                      setSearchQuery('shop');
                      setDebouncedSearchQuery('shop');
                    }}
                    className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors"
                  >
                    🏪 Shop商品
                  </button>
                  <button
                    onClick={() => {
                      // 個人出品のフィルタ（shopタグがない商品）
                      setSearchQuery('個人');
                      setDebouncedSearchQuery('個人');
                    }}
                    className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                  >
                    👤 個人出品
                  </button>
                </div>
              </div>

              {/* カテゴリフィルタ */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-2">カテゴリ</h3>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(category => (
                    <button
                      key={category.value}
                      onClick={() => handleCategorySelect(category.value)}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors flex items-center space-x-2 ${
                        selectedCategory === category.value
                          ? 'bg-primary text-white'
                          : 'bg-surface-light text-text-secondary hover:bg-surface hover:text-text-primary'
                      }`}
                    >
                      <span>{category.icon}</span>
                      <span className="text-xs">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 出品者タイプフィルタ */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-2">出品者タイプ</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('shop');
                      setDebouncedSearchQuery('shop');
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      searchQuery === 'shop'
                        ? 'bg-purple-500 text-white'
                        : 'bg-surface-light text-text-secondary hover:bg-surface hover:text-text-primary'
                    }`}
                  >
                    🏪 Shop出品
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('個人');
                      setDebouncedSearchQuery('個人');
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      searchQuery === '個人'
                        ? 'bg-orange-500 text-white'
                        : 'bg-surface-light text-text-secondary hover:bg-surface hover:text-text-primary'
                    }`}
                  >
                    👤 個人出品
                  </button>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDebouncedSearchQuery('');
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                      !searchQuery
                        ? 'bg-gray-500 text-white'
                        : 'bg-surface-light text-text-secondary hover:bg-surface hover:text-text-primary'
                    }`}
                  >
                    📋 全て
                  </button>
                </div>
              </div>

              {/* 状態フィルタ */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-2">状態</h3>
                <div className="flex gap-2">
                  {CONDITIONS.map(condition => (
                    <button
                      key={condition.value}
                      onClick={() => handleConditionSelect(condition.value)}
                      className={`flex-1 py-2 rounded-lg text-sm transition-colors ${
                        selectedCondition === condition.value
                          ? 'bg-primary text-white'
                          : 'bg-surface-light text-text-secondary hover:bg-surface hover:text-text-primary'
                      }`}
                    >
                      {condition.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 価格フィルタ */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-2">価格範囲</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
                      className="bg-surface-light text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    >
                      {CURRENCIES.map(currency => (
                        <option key={currency.value} value={currency.value}>
                          {currency.symbol} {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={priceMin || ''}
                      onChange={(e) => setPriceMin(parseInt(e.target.value) || undefined)}
                      placeholder="最低価格"
                      className="flex-1 bg-surface-light text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                    <span className="text-text-secondary">〜</span>
                    <input
                      type="number"
                      value={priceMax || ''}
                      onChange={(e) => setPriceMax(parseInt(e.target.value) || undefined)}
                      placeholder="最高価格"
                      className="flex-1 bg-surface-light text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* 並び替え */}
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-2">並び替え</h3>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="w-full bg-surface-light text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* フィルタクリア */}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <div className="text-xs text-text-secondary">
                  {selectedCategory && `カテゴリ: ${CATEGORIES.find(c => c.value === selectedCategory)?.label}`}
                  {selectedCondition && ` | 状態: ${CONDITIONS.find(c => c.value === selectedCondition)?.label}`}
                  {(priceMin || priceMax) && ` | 価格: ${priceMin || '0'}〜${priceMax || '∞'}円`}
                  {debouncedSearchQuery && ` | 検索: "${debouncedSearchQuery}"`}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    フィルタをクリア
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    閉じる
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* 商品一覧 */}
        <div className="p-4 pt-6 pb-8">
          {displayLoading && displayItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-text-secondary">読み込み中...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500">{error}</p>
            </div>
          ) : displayItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag size={48} className="mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary mb-6">
                {activeTab === 'favorites' ? 'お気に入り商品がありません' : '該当する商品が見つかりません'}
              </p>
              <div className="space-y-3">
                {activeTab !== 'favorites' && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    フィルタをクリア
                  </button>
                )}
                <div>
                  <button
                    onClick={onBackClick}
                    className="px-4 py-2 bg-surface text-text-primary rounded-lg hover:bg-surface-light transition-colors border border-border"
                  >
                    ← 戻る
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* 商品グリッド/リスト */}
              <div
                id="marketplace-items"
                onScroll={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  if (hasMore && !loading && el.scrollHeight - el.scrollTop - el.clientHeight < 200) {
                    loadMore();
                  }
                }}
                className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-3 gap-3 mt-4'
                  : 'space-y-4 mt-4'
              }
                style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}
              >
                {displayItems.map((item) => (
                   <MarketplaceItemCard
                     key={item.id}
                     item={item}
                     viewMode={viewMode}
                     onClick={() => onItemClick?.(item)}
                     isFavorite={isFavorite(item.id)}
                     onToggleFavorite={(sellerType) => toggleFavorite(item.id, sellerType)}
                     showSellerType={true}
                   />
                ))}

                {/* スケルトン（読み込み中のプレースホルダー） */}
                {loading && (
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={`skel-${i}`} className={viewMode === 'grid' ? 'aspect-square rounded-lg bg-gray-800 animate-pulse' : 'h-24 rounded-lg bg-gray-800 animate-pulse'} />
                    ))}
                  </>
                )}
              </div>

              {/* もっと見るボタン（フォールバック） */}
              {hasMore && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-6 py-3 bg-surface text-text-primary rounded-lg hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? '読み込み中...' : 'もっと見る'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
};
