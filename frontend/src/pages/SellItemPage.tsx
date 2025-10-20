import { ArrowLeft, Camera, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCreateItem } from '../hooks/useMarketplace';
import { CreateItemData, Currency, ItemCategory, ItemCondition, ShippingMethod } from '../types/marketplace';

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'engine', label: 'エンジン' },
  { value: 'suspension', label: 'サスペンション' },
  { value: 'brake', label: 'ブレーキ' },
  { value: 'electrical', label: '電気' },
  { value: 'body', label: 'ボディ' },
  { value: 'tire', label: 'タイヤ' },
  { value: 'interior', label: 'インテリア' },
  { value: 'exterior', label: '外装' },
  { value: 'audio', label: 'オーディオ' },
  { value: 'tool', label: '工具' },
  { value: 'other', label: 'その他' }
];

const CONDITIONS: { value: ItemCondition; label: string }[] = [
  { value: 'new', label: '新品' },
  { value: 'used', label: '中古' },
  { value: 'junk', label: 'ジャンク' }
];

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: 'JPY', label: '円', symbol: '¥' },
  { value: 'USD', label: 'ドル', symbol: '$' },
  { value: 'EUR', label: 'ユーロ', symbol: '€' }
];

interface SellItemPageProps {
  onBack?: () => void;
  onNavigateToItemDetail?: (itemId: string) => void;
  onBackClick?: () => void;
  onSave?: () => void;
}

export const SellItemPage: React.FC<SellItemPageProps> = ({ 
  onBack, 
  onNavigateToItemDetail,
  onBackClick,
  onSave
}) => {
  const { user, userDoc } = useAuth();
  const { createItem, loading, error } = useCreateItem();

  // ユーザーのShop申請状態に基づいてsellerTypeを自動判定
  const getSellerType = (): 'individual' | 'shop' => {
    if (userDoc?.shopApplication?.status === 'approved') {
      return 'shop';
    }
    return 'individual';
  };

  const [formData, setFormData] = useState<CreateItemData>({
    title: '',
    description: '',
    category: 'other',
    tags: [],
    vehicleTags: [],
    compatibility: undefined, // undefined のまま（型に合わせる）
    condition: 'used',
    price: 0,
    currency: 'JPY',
    shipping: {
      method: 'buyer_pays',
      fee: 0,
      area: ''
    },
    images: [],
    sellerType: getSellerType()
  });

  const [vehicleTagInput, setVehicleTagInput] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleInputChange = (field: keyof CreateItemData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // sellerTypeを自動更新するuseEffect
  React.useEffect(() => {
    const newSellerType = getSellerType();
    setFormData(prev => ({
      ...prev,
      sellerType: newSellerType,
      // shopアカウントの場合は"shop"タグを自動で追加
      tags: newSellerType === 'shop' && !prev.tags.includes('shop') 
        ? [...prev.tags, 'shop']
        : prev.tags
    }));
  }, [userDoc?.shopApplication?.status]);

  const handleShippingChange = (field: keyof typeof formData.shipping, value: any) => {
    setFormData(prev => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 最大5枚まで
    const remainingSlots = 5 - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...filesToAdd]
    }));

    // プレビュー画像を作成
    const newPreviews: string[] = [];
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addVehicleTag = () => {
    if (vehicleTagInput.trim() && !formData.vehicleTags.includes(vehicleTagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        vehicleTags: [...prev.vehicleTags, vehicleTagInput.trim()]
      }));
      setVehicleTagInput('');
    }
  };

  const removeVehicleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleTags: prev.vehicleTags.filter(t => t !== tag)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('ログインが必要です');
      return;
    }

    if (formData.images.length === 0) {
      alert('商品画像を最低1枚アップロードしてください');
      return;
    }

    try {
      console.log('📦 商品出品開始:', {
        title: formData.title,
        category: formData.category,
        price: formData.price,
        currency: formData.currency,
        condition: formData.condition,
        sellerType: getSellerType(),
        imageCount: formData.images.length,
        timestamp: new Date().toISOString()
      });

      const itemId = await createItem(formData, user.uid);
      
      if (itemId) {
        console.log('✅ 商品出品完了:', {
          itemId,
          title: formData.title,
          price: `${formData.currency} ${formData.price}`,
          category: formData.category,
          condition: formData.condition,
          sellerType: getSellerType(),
          timestamp: new Date().toISOString()
        });
        
        alert(`商品「${formData.title}」の出品が完了しました！`);
        onNavigateToItemDetail?.(itemId);
      }
    } catch (error) {
      console.error('❌ 商品出品エラー:', error);
      alert('商品の出品に失敗しました。もう一度お試しください。');
    }
  };

  const currencySymbol = CURRENCIES.find(c => c.value === formData.currency)?.symbol || '¥';

  return (
    <div className="min-h-screen bg-background">
      {/* メルカリスタイルのヘッダー */}
      <div className="sticky top-0 bg-gray-900 text-white z-10">
        <div className="flex items-center space-x-4 px-4 py-3">
          <button
            onClick={() => {
              onBack?.();
              onBackClick?.();
            }}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">商品を出品</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 商品画像 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">商品画像</h2>
            <div className="grid grid-cols-3 gap-4">
              {/* 画像プレビュー */}
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-square bg-surface rounded-lg overflow-hidden">
                  <img
                    src={preview}
                    alt={`商品画像 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {/* 画像アップロードボタン */}
              {formData.images.length < 5 && (
                <label className="aspect-square bg-surface-light border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-surface transition-colors">
                  <Camera size={24} className="text-text-secondary mb-2" />
                  <span className="text-sm text-text-secondary">画像追加</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-text-secondary">
              最大5枚までアップロード可能（JPEG、PNG、WebP形式）
            </p>
          </div>

          {/* 出品者タイプ表示 */}
          {userDoc?.shopApplication?.status === 'approved' && (
            <div className="space-y-4">
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🏪</span>
                  <span className="text-blue-200 font-medium">Shop出品</span>
                </div>
                <p className="text-sm text-blue-200">
                  Shop承認済みのため、この商品はShopタブに表示されます。
                </p>
              </div>
            </div>
          )}

          {/* 商品情報 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">商品情報</h2>
            
            {/* 商品名 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                商品名 *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="商品名を入力してください"
                className="w-full bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                maxLength={100}
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                {formData.title.length}/100文字
              </p>
            </div>

            {/* 商品説明 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                商品説明 *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="商品の詳細を入力してください"
                className="w-full bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors resize-none"
                rows={4}
                maxLength={1000}
                required
              />
              <p className="text-xs text-text-secondary mt-1">
                {formData.description.length}/1000文字
              </p>
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                カテゴリ *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as ItemCategory)}
                className="w-full bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                required
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value} className="bg-surface text-text-primary">
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* タグ */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                タグ
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="タグを入力（例：新品同様、即決可、送料無料）"
                  className="flex-1 bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  追加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-primary hover:text-primary-dark"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-text-secondary mt-1">
                購入者が検索しやすいキーワードを入力してください
              </p>
            </div>

            {/* 車種タグ */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                対応車種
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={vehicleTagInput}
                  onChange={(e) => setVehicleTagInput(e.target.value)}
                  placeholder="車種コードを入力（例：ZC33S）"
                  className="flex-1 bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVehicleTag())}
                />
                <button
                  type="button"
                  onClick={addVehicleTag}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  追加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.vehicleTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeVehicleTag(tag)}
                      className="ml-2 text-primary hover:text-primary-dark"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 商品状態 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                商品状態 *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {CONDITIONS.map(condition => (
                  <label 
                    key={condition.value} 
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.condition === condition.value
                        ? 'bg-primary text-white border-primary'
                        : 'bg-surface text-text-primary border-border hover:bg-surface-light'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={condition.value}
                      checked={formData.condition === condition.value}
                      onChange={(e) => handleInputChange('condition', e.target.value as ItemCondition)}
                      className="sr-only"
                    />
                    <span className="font-medium">{condition.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* 価格設定 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">価格設定</h2>
            
            <div className="flex space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  価格 *
                </label>
                <div className="relative">
                  <span className="absolute left-0 top-1/2 transform -translate-y-1/2 text-text-secondary">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full bg-surface text-text-primary border border-border rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-primary transition-colors"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="w-24">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  通貨
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value as Currency)}
                  className="w-full bg-transparent text-text-primary border-b border-border rounded-none px-0 py-2 focus:outline-none focus:border-primary transition-colors"
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 配送設定 */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">配送設定</h2>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                送料負担
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="buyer_pays"
                    checked={formData.shipping.method === 'buyer_pays'}
                    onChange={(e) => handleShippingChange('method', e.target.value as ShippingMethod)}
                    className="mr-2"
                  />
                  <span className="text-text-primary">購入者負担</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="seller_pays"
                    checked={formData.shipping.method === 'seller_pays'}
                    onChange={(e) => handleShippingChange('method', e.target.value as ShippingMethod)}
                    className="mr-2"
                  />
                  <span className="text-text-primary">出品者負担</span>
                </label>
              </div>
            </div>

            {formData.shipping.method === 'buyer_pays' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  送料（{currencySymbol}）
                </label>
                <input
                  type="number"
                  value={formData.shipping.fee || ''}
                  onChange={(e) => handleShippingChange('fee', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                  min="0"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                配送地域
              </label>
              <input
                type="text"
                value={formData.shipping.area || ''}
                onChange={(e) => handleShippingChange('area', e.target.value)}
                placeholder="配送可能地域を入力（例：全国、関東圏のみ）"
                className="w-full bg-surface text-text-primary border border-border rounded-lg px-3 py-2 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* 出品ボタン（メルカリスタイル） */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-500 text-white py-4 rounded-lg font-bold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {loading ? '出品中...' : '商品を出品'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
