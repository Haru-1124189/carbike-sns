import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft, Camera, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/init';
import { useAuth } from '../hooks/useAuth';
import { CreateItemData, Currency, ItemCategory, ItemCondition, MarketplaceItem, ShippingMethod } from '../types/marketplace';

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

const SHIPPING_METHODS: { value: ShippingMethod; label: string }[] = [
  { value: 'seller_pays', label: '出品者負担' },
  { value: 'buyer_pays', label: '購入者負担' }
];

interface EditItemPageProps {
  itemId: string;
  onBack?: () => void;
  onSave?: () => void;
}

export const EditItemPage: React.FC<EditItemPageProps> = ({ 
  itemId,
  onBack, 
  onSave
}) => {
  const { user, userDoc } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [item, setItem] = useState<MarketplaceItem | null>(null);

  // フォームデータの状態管理
  const [formData, setFormData] = useState<Partial<CreateItemData>>({
    title: '',
    description: '',
    price: 0,
    currency: 'JPY',
    category: 'other',
    condition: 'used',
    images: [],
    tags: [],
    vehicleTags: [],
    shipping: {
      method: 'buyer_pays',
      fee: 0,
      area: ''
    }
  });

  // 画像プレビューの状態管理
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // 商品データを読み込み
  useEffect(() => {
    const loadItem = async () => {
      try {
        const itemDoc = await getDoc(doc(db, 'items', itemId));
        if (itemDoc.exists()) {
          const itemData = itemDoc.data() as MarketplaceItem;
          setItem(itemData);
           setFormData({
             title: itemData.title,
             description: itemData.description,
             price: itemData.price,
             currency: itemData.currency,
             category: itemData.category,
             condition: itemData.condition,
             // imagesは既存のURL文字列なので、編集時は空配列で開始
             images: [],
             tags: itemData.tags || [],
             vehicleTags: itemData.vehicleTags || [],
             shipping: {
               method: itemData.shipping?.method || 'buyer_pays',
               fee: itemData.shipping?.fee || 0,
               area: itemData.shipping?.area || ''
             }
           });
          setImagePreviews(itemData.images || []);
        }
        setLoading(false);
      } catch (error) {
        console.error('商品データの読み込みエラー:', error);
        setLoading(false);
      }
    };

    loadItem();
  }, [itemId]);

  const handleInputChange = (field: keyof CreateItemData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: File[] = [];
      const newPreviews: string[] = [];
      
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          newImages.push(file);
          
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            newPreviews.push(result);
            
            if (newPreviews.length === files.length) {
              setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), ...newImages]
              }));
              setImagePreviews(prev => [...prev, ...newPreviews]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index) || []
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }));
    }
  };

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !item) {
      alert('ログインが必要です');
      return;
    }

    if (formData.images?.length === 0) {
      alert('商品画像を最低1枚アップロードしてください');
      return;
    }

    try {
      setSaving(true);
      console.log('📝 商品編集開始:', {
        itemId,
        title: formData.title,
        category: formData.category,
        price: formData.price,
        currency: formData.currency,
        condition: formData.condition,
        timestamp: new Date().toISOString()
      });

       // Firestoreの商品データを更新
       await updateDoc(doc(db, 'items', itemId), {
         title: formData.title,
         description: formData.description,
         price: formData.price,
         currency: formData.currency,
         category: formData.category,
         condition: formData.condition,
         tags: formData.tags,
         vehicleTags: formData.vehicleTags,
         shipping: formData.shipping,
         updatedAt: new Date()
       });

      console.log('✅ 商品編集完了:', {
        itemId,
        title: formData.title,
        price: `${formData.currency} ${formData.price}`,
        category: formData.category,
        condition: formData.condition,
        timestamp: new Date().toISOString()
      });
      
      alert(`商品「${formData.title}」の編集が完了しました！`);
      onSave?.();
    } catch (error) {
      console.error('❌ 商品編集エラー:', error);
      alert('商品の編集に失敗しました。もう一度お試しください。');
    } finally {
      setSaving(false);
    }
  };

  const currencySymbol = CURRENCIES.find(c => c.value === formData.currency)?.symbol || '¥';

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">商品データを読み込み中...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-text-primary">商品が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-lg font-semibold text-text-primary">商品を編集</h1>
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
              
              {/* 画像追加ボタン */}
              <div className="aspect-square bg-surface-light rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:bg-surface transition-colors">
                <label className="cursor-pointer flex flex-col items-center space-y-2">
                  <Camera size={24} className="text-text-secondary" />
                  <span className="text-xs text-text-secondary">画像を追加</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

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
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                placeholder="商品名を入力してください"
                required
              />
            </div>

            {/* 商品説明 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                商品説明
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary h-24 resize-none"
                placeholder="商品の詳細を入力してください"
              />
            </div>

            {/* 価格 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  価格 *
                </label>
                <input
                  type="number"
                  value={formData.price || 0}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  通貨
                </label>
                <select
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value as Currency)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency.value} value={currency.value}>
                      {currency.symbol} {currency.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* カテゴリ・状態 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  カテゴリ *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as ItemCategory)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                  required
                >
                  {CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  状態 *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value as ItemCondition)}
                  className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                  required
                >
                  {CONDITIONS.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

             {/* 配送方法 */}
             <div>
               <label className="block text-sm font-medium text-text-primary mb-2">
                 配送方法
               </label>
               <select
                 value={formData.shipping?.method || 'buyer_pays'}
                 onChange={(e) => handleInputChange('shipping', { ...formData.shipping, method: e.target.value as ShippingMethod })}
                 className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
               >
                 {SHIPPING_METHODS.map(method => (
                   <option key={method.value} value={method.value}>
                     {method.label}
                   </option>
                 ))}
               </select>
             </div>

             {/* 配送料 */}
             <div>
               <label className="block text-sm font-medium text-text-primary mb-2">
                 配送料 ({currencySymbol})
               </label>
               <input
                 type="number"
                 value={formData.shipping?.fee || 0}
                 onChange={(e) => handleInputChange('shipping', { ...formData.shipping, fee: parseInt(e.target.value) || 0 })}
                 className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                 placeholder="0"
               />
             </div>

             {/* 配送エリア */}
             <div>
               <label className="block text-sm font-medium text-text-primary mb-2">
                 配送エリア
               </label>
               <input
                 type="text"
                 value={formData.shipping?.area || ''}
                 onChange={(e) => handleInputChange('shipping', { ...formData.shipping, area: e.target.value })}
                 className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                 placeholder="例: 東京都"
               />
             </div>
          </div>

          {/* タグ */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">タグ</h2>
            
            {/* タグ入力 */}
            <div>
              <input
                type="text"
                placeholder="タグを入力してEnterキーを押してください"
                className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    handleTagAdd(input.value);
                    input.value = '';
                  }
                }}
              />
            </div>

            {/* タグ表示 */}
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary text-white rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-2 hover:text-red-200"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 送信ボタン */}
          <div className="space-y-3">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '商品を更新'}
            </button>
            
            <button
              type="button"
              onClick={onBack}
              className="w-full bg-surface text-text-primary py-3 rounded-lg font-medium hover:bg-surface-light transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
