import { ArrowLeft, Image, Minus, Plus, Send, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { BannerAd } from '../components/ui/BannerAd';
import { MentionTextarea } from '../components/ui/MentionTextarea';
import { useAuth } from '../hooks/useAuth';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { createMaintenancePost } from '../lib/threads';
import { uploadToStorage } from '../lib/upload';
import { MaintenanceStep } from '../types';

interface NewMaintenancePageProps {
  onBackClick?: () => void;
  onSuccess?: () => void;
}

export const NewMaintenancePage: React.FC<NewMaintenancePageProps> = ({ onBackClick }) => {
  const { user, userDoc } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [carModel, setCarModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [cost, setCost] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [category, setCategory] = useState<'engine' | 'suspension' | 'brake' | 'electrical' | 'body' | 'tire' | 'oil' | 'custom' | 'other'>('other');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [totalTime, setTotalTime] = useState('');
  const [tools, setTools] = useState<string[]>([]);
  const [newTool, setNewTool] = useState('');
  const [parts, setParts] = useState<string[]>([]);
  const [newPart, setNewPart] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [steps, setSteps] = useState<MaintenanceStep[]>([
    {
      id: '1',
      order: 1,
      title: '',
      description: '',
      tips: ''
    }
  ]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingStepImages, setUploadingStepImages] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // スワイプバック機能を有効化
  useSwipeBack({
    onSwipeBack: onBackClick
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) {
      setError('ログインが必要です');
      return;
    }

    // タイトル、内容、車種は必須
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    // メモは任意項目なので削除

    if (!carModel.trim()) {
      setError('車種を入力してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('NewMaintenancePage - Submit Debug:', {
        title,
        content,
        carModel,
        mileage: parseInt(mileage) || 0,
        cost: parseInt(cost) || 0,
        workDate,
        category,
        difficulty,
        totalTime,
        tools: tools,
        parts: parts,
        tags,
        uploadedImages,
        steps
      });

      const maintenanceData = {
        title: title.trim(),
        content: content.trim(),
        carModel: carModel.trim(),
        mileage: parseInt(mileage) || 0,
        cost: parseInt(cost) || 0,
        workDate: workDate || new Date().toISOString().split('T')[0],
        category,
        difficulty,
        totalTime: totalTime.trim(),
        tools: tools,
        parts: parts,
        tags,
        images: uploadedImages,
        steps: steps,
      };

      // 最新のユーザー名を使用（userDocが優先）
      const displayName = userDoc?.displayName || user?.displayName || 'ユーザー';

      const maintenanceId = await createMaintenancePost(maintenanceData, user.uid, displayName);
      console.log('Maintenance post created successfully:', maintenanceId);
      alert('メンテナンス記録が投稿されました！');
      onBackClick?.();
    } catch (err: any) {
      setError(err.message || '投稿に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user?.uid) return;

    setUploadingImages(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        if (file.type.startsWith('image/')) {
          return await uploadToStorage(user.uid, file, false, true);
        }
        throw new Error('画像ファイルのみアップロード可能です');
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
    } catch (err: any) {
      setError(err.message || '画像のアップロードに失敗しました');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const categories = [
    { value: 'engine', label: 'エンジン' },
    { value: 'suspension', label: 'サスペンション' },
    { value: 'brake', label: 'ブレーキ' },
    { value: 'electrical', label: '電気' },
    { value: 'body', label: 'ボディ' },
    { value: 'tire', label: 'タイヤ' },
    { value: 'oil', label: 'オイル' },
    { value: 'custom', label: 'カスタム' },
    { value: 'other', label: 'その他' }
  ];

  const difficulties = [
    { value: 'easy', label: '初級' },
    { value: 'medium', label: '中級' },
    { value: 'hard', label: '上級' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[420px] mx-auto">
        {/* バナー広告 - 最上部に固定 */}
        <div className="sticky top-0 z-50 bg-background">
          <BannerAd />
        </div>

        {/* ヘッダー - バナー広告の下 */}
        <header className="bg-background/80 backdrop-blur-md sticky top-[50px] z-40">
          <div className="max-w-[420px] mx-auto w-full flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <span className="text-base text-text-primary font-medium">整備記録</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !title.trim() || !carModel.trim()}
              className="p-2 rounded-xl bg-primary border border-primary hover:scale-95 active:scale-95 transition-transform shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="px-4 pt-6 pb-32">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 mb-8">
            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                タイトル *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="整備のタイトルを入力..."
                className="w-full p-3 bg-surface border border-surface-light rounded-xl text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            {/* 車種 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                車種 *
              </label>
              <input
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                placeholder="例: Nissan S13, Honda Civic EK9..."
                className="w-full p-3 bg-surface border border-surface-light rounded-xl text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                required
              />
            </div>

            {/* 走行距離と費用 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  走行距離 (km)
                </label>
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 bg-surface border border-surface-light rounded-xl text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  費用 (円)
                </label>
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 bg-surface border border-surface-light rounded-xl text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* 作業日 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                作業日
              </label>
              <input
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                className="w-full p-3 bg-surface border border-surface-light rounded-xl text-text-primary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* カテゴリと難易度 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  カテゴリ
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-3 bg-surface border border-surface-light rounded-xl text-text-primary focus:outline-none focus:border-primary transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  難易度
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="w-full p-3 bg-surface border border-surface-light rounded-xl text-text-primary focus:outline-none focus:border-primary transition-colors"
                >
                  {difficulties.map(diff => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 作業時間 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                作業時間
              </label>
              <input
                type="text"
                value={totalTime}
                onChange={(e) => setTotalTime(e.target.value)}
                placeholder="例: 2時間30分"
                className="w-full p-3 bg-surface border border-surface-light rounded-xl text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* 使用工具 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                使用工具
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newTool}
                  onChange={(e) => setNewTool(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newTool.trim()) {
                        setTools([...tools, newTool.trim()]);
                        setNewTool('');
                      }
                    }
                  }}
                  placeholder="工具名を入力"
                  className="flex-1 p-3 bg-surface border border-surface-light rounded-xl text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newTool.trim()) {
                      setTools([...tools, newTool.trim()]);
                      setNewTool('');
                    }
                  }}
                  className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              {tools.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {tools.map((tool, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full flex items-center space-x-1"
                    >
                      <span>{tool}</span>
                      <button
                        type="button"
                        onClick={() => setTools(tools.filter((_, i) => i !== index))}
                        className="text-primary hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 使用パーツ */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                使用パーツ
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newPart}
                  onChange={(e) => setNewPart(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (newPart.trim()) {
                        setParts([...parts, newPart.trim()]);
                        setNewPart('');
                      }
                    }
                  }}
                  placeholder="パーツ名を入力"
                  className="flex-1 p-3 bg-surface border border-surface-light rounded-xl text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newPart.trim()) {
                      setParts([...parts, newPart.trim()]);
                      setNewPart('');
                    }
                  }}
                  className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
              {parts.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {parts.map((part, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full flex items-center space-x-1"
                    >
                      <span>{part}</span>
                      <button
                        type="button"
                        onClick={() => setParts(parts.filter((_, i) => i !== index))}
                        className="text-primary hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* タグ */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                タグ
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="タグを入力..."
                  className="flex-1 p-3 bg-surface border border-surface-light rounded-xl text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary/80 transition-colors"
                >
                  追加
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full flex items-center space-x-1"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-primary hover:text-red-400 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 画像アップロード */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                画像 (サムネ)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImages}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="block w-full p-4 border-2 border-dashed border-surface-light rounded-xl text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload size={24} className="mx-auto mb-2 text-text-secondary" />
                <span className="text-text-secondary">
                  {uploadingImages ? 'アップロード中...' : '画像を選択'}
                </span>
              </label>
              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Uploaded ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 手順 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                作業手順
              </label>
              {steps.map((step, index) => (
                <div key={step.id} className="bg-surface border border-surface-light rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">手順{step.order}</h3>
                    {steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSteps = steps.filter((_, i) => i !== index);
                          // 順序を再設定
                          newSteps.forEach((s, i) => {
                            s.order = i + 1;
                          });
                          setSteps(newSteps);
                        }}
                        className="p-1 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        手順のタイトル
                      </label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const newSteps = [...steps];
                          newSteps[index] = { ...newSteps[index], title: e.target.value };
                          setSteps(newSteps);
                        }}
                        placeholder="手順のタイトルを入力"
                        className="w-full p-3 bg-surface border border-surface-light rounded-lg text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        手順の詳細説明
                      </label>
                      <MentionTextarea
                        value={step.description}
                        onChange={(value) => {
                          const newSteps = [...steps];
                          newSteps[index] = { ...newSteps[index], description: value };
                          setSteps(newSteps);
                        }}
                        placeholder="手順の詳細を入力"
                        rows={3}
                        className="w-full p-3 bg-surface border border-surface-light rounded-lg text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        コツ・注意点
                      </label>
                      <MentionTextarea
                        value={step.tips || ''}
                        onChange={(value) => {
                          const newSteps = [...steps];
                          newSteps[index] = { ...newSteps[index], tips: value };
                          setSteps(newSteps);
                        }}
                        placeholder="コツや注意点があれば入力"
                        rows={2}
                        className="w-full p-3 bg-surface border border-surface-light rounded-lg text-text-primary placeholder-gray-400 focus:border-primary transition-colors resize-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-1">
                        画像
                      </label>
                      {step.image ? (
                                                 <div className="relative">
                           <img 
                             src={step.image} 
                             alt={`Step ${step.order}`} 
                             className="w-full max-h-48 object-contain rounded-lg"
                           />
                          <button
                            type="button"
                            onClick={() => {
                              const newSteps = [...steps];
                              newSteps[index] = { ...newSteps[index], image: undefined };
                              setSteps(newSteps);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="block w-full p-4 border-2 border-dashed border-surface-light rounded-lg text-center cursor-pointer hover:border-primary transition-colors">
                          <Image size={24} className="mx-auto mb-2 text-text-secondary" />
                          <span className="text-text-secondary">
                            {uploadingStepImages[step.id] ? 'アップロード中...' : '画像追加'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingStepImages[step.id]}
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0] && user?.uid) {
                                try {
                                  setUploadingStepImages(prev => ({ ...prev, [step.id]: true }));
                                  const imageUrl = await uploadToStorage(user.uid, e.target.files[0], false, true);
                                  const newSteps = [...steps];
                                  newSteps[index] = { ...newSteps[index], image: imageUrl };
                                  setSteps(newSteps);
                                } catch (error) {
                                  console.error('手順画像のアップロードに失敗しました:', error);
                                  alert('手順画像のアップロードに失敗しました');
                                } finally {
                                  setUploadingStepImages(prev => ({ ...prev, [step.id]: false }));
                                }
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={() => {
                  const newStep: MaintenanceStep = {
                    id: Date.now().toString(),
                    order: steps.length + 1,
                    title: '',
                    description: '',
                    tips: ''
                  };
                  setSteps([...steps, newStep]);
                }}
                className="w-full p-4 border-2 border-dashed border-primary rounded-lg text-center cursor-pointer hover:bg-primary/5 transition-colors"
              >
                <Plus size={24} className="mx-auto mb-2 text-primary" />
                <span className="text-primary font-medium">手順を追加</span>
              </button>
            </div>

            {/* 内容 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                メモ
              </label>
              <MentionTextarea
                value={content}
                onChange={setContent}
                placeholder="整備の詳細を記録しましょう..."
                rows={6}
                className="w-full p-3 bg-surface border border-surface-light rounded-xl text-text-primary placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};
