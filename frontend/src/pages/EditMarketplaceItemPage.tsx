import { ArrowLeft, Camera, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useItem } from '../hooks/useMarketplace';
import { CreateItemData } from '../types/marketplace';

interface EditMarketplaceItemPageProps {
  itemId?: string;
  item?: any;
  onBack?: () => void;
  onComplete?: () => void;
  onBackClick?: () => void;
  onSave?: () => void;
}

export const EditMarketplaceItemPage: React.FC<EditMarketplaceItemPageProps> = ({
  itemId: propItemId,
  item: propItem,
  onBack,
  onComplete,
  onBackClick,
  onSave
}) => {
  const { user } = useAuth();
  const { item, loading: itemLoading, updateItem } = useItem(propItemId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateItemData>({
    title: '',
    description: '',
    category: 'other',
    tags: [],
    vehicleTags: [],
    compatibility: undefined,
    condition: 'used',
    price: 0,
    currency: 'JPY',
    shipping: {
      method: 'buyer_pays',
      fee: 0,
      area: ''
    },
    images: [],
    sellerType: 'individual'
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // 商品データをフォームに読み込み
  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        tags: item.tags || [],
        vehicleTags: item.vehicleTags || [],
        compatibility: item.compatibility,
        condition: item.condition,
        price: item.price,
        currency: item.currency,
        shipping: item.shipping,
        images: [],
        sellerType: item.sellerType
      });
      setImageUrls(item.images || []);
    }
  }, [item]);

  const handleInputChange = (field: keyof CreateItemData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent: keyof CreateItemData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item || !user) return;

    setLoading(true);
    setError(null);

    try {
      await updateItem(formData, imageFiles);
      alert('商品を更新しました！');
      onComplete?.();
    } catch (err) {
      console.error('商品更新エラー:', err);
      setError(err instanceof Error ? err.message : '商品の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
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

  const conditions = [
    { value: 'new', label: '新品' },
    { value: 'used', label: '中古' },
    { value: 'junk', label: 'ジャンク' }
  ];

  if (itemLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">商品情報を読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-secondary mb-4">商品が見つかりません</p>
          <button
            onClick={() => (onBackClick ?? onBack)?.()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-gray-900 text-white z-10">
        <div className="flex items-center space-x-4 px-4 py-3">
          <button
            onClick={() => (onBackClick ?? onBack)?.()}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">商品を編集</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* 商品画像 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              商品画像 *
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* 既存画像 */}
              {imageUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`商品画像 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
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
              
              {/* 新規画像アップロード */}
              {imageFiles.map((file, index) => (
                <div key={`file-${index}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`新規画像 ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
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

              {/* アップロードボタン */}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Camera className="mx-auto h-8 w-8 text-text-tertiary mb-2" />
                  <p className="text-sm text-text-secondary">画像を追加</p>
                </label>
              </div>
            </div>
          </div>

          {/* 商品名 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              商品名 *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
              placeholder="商品名を入力してください"
              required
            />
          </div>

          {/* 商品説明 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              商品説明 *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
              rows={4}
              placeholder="商品の詳細を入力してください"
              required
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              カテゴリ *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
              required
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* 対応車種 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              対応車種
            </label>
            <div className="space-y-2">
              {formData.vehicleTags.map((tag, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => {
                      const newTags = [...formData.vehicleTags];
                      newTags[index] = e.target.value;
                      handleInputChange('vehicleTags', newTags);
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                    placeholder="車種コード（例：GDB）"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = formData.vehicleTags.filter((_, i) => i !== index);
                      handleInputChange('vehicleTags', newTags);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const newTags = [...formData.vehicleTags, ''];
                  handleInputChange('vehicleTags', newTags);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm"
              >
                追加
              </button>
            </div>
          </div>

          {/* 商品状態 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              商品状態 *
            </label>
            <div className="space-y-2">
              {conditions.map(condition => (
                <label key={condition.value} className="flex items-center">
                  <input
                    type="radio"
                    name="condition"
                    value={condition.value}
                    checked={formData.condition === condition.value}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-text-primary">{condition.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 価格設定 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              価格 *
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-text-primary">¥</span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                placeholder="0"
                required
              />
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
              >
                <option value="JPY">円</option>
              </select>
            </div>
          </div>

          {/* 配送設定 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              送料負担
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="shipping-method"
                  value="buyer_pays"
                  checked={formData.shipping.method === 'buyer_pays'}
                  onChange={(e) => handleNestedInputChange('shipping', 'method', e.target.value)}
                  className="mr-2"
                />
                <span className="text-text-primary">購入者負担</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="shipping-method"
                  value="seller_pays"
                  checked={formData.shipping.method === 'seller_pays'}
                  onChange={(e) => handleNestedInputChange('shipping', 'method', e.target.value)}
                  className="mr-2"
                />
                <span className="text-text-primary">出品者負担</span>
              </label>
            </div>
          </div>

          {formData.shipping.method === 'buyer_pays' && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  送料 (¥)
                </label>
                <input
                  type="number"
                  value={formData.shipping.fee}
                  onChange={(e) => handleNestedInputChange('shipping', 'fee', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  配送地域
                </label>
                <input
                  type="text"
                  value={formData.shipping.area}
                  onChange={(e) => handleNestedInputChange('shipping', 'area', e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  placeholder="(例:全国、関東圏のみ)"
                />
              </div>
            </>
          )}

          {/* 更新ボタン */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-lg font-bold hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
            >
              {loading ? '更新中...' : '商品を更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
