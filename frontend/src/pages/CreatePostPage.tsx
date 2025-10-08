import { ArrowLeft, Camera, Car, HelpCircle, Minus, Plus, Send, Video, Wrench, X } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { ImageUpload } from '../components/ui/ImageUpload';
import { StepImageUpload } from '../components/ui/StepImageUpload';
import { carModels } from '../data/dummy';

interface CreatePostPageProps {
  postType?: string;
  onBackClick?: () => void;
}

interface MaintenanceStep {
  id: string;
  order: number;
  title: string;
  description: string;
  image: string;
  tips: string;
}

export const CreatePostPage: React.FC<CreatePostPageProps> = ({ 
  postType: initialPostType = 'general',
  onBackClick 
}) => {
  const [selectedPostType, setSelectedPostType] = useState(initialPostType);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  
  // 整備記録専用の状態
  const [selectedCar, setSelectedCar] = useState('');
  const [workTime, setWorkTime] = useState('');
  const [cost, setCost] = useState('');
  const [difficulty, setDifficulty] = useState('easy');
  const [tools, setTools] = useState<string[]>([]);
  const [parts, setParts] = useState<string[]>([]);
  const [newTool, setNewTool] = useState('');
  const [newPart, setNewPart] = useState('');
  
  // みんから風の手順管理
  const [steps, setSteps] = useState<MaintenanceStep[]>([]);

  console.log('CreatePostPage - selectedPostType:', selectedPostType);

  const getPostTypeInfo = () => {
    switch (selectedPostType) {
      case 'car':
        return { icon: Car, title: '車両紹介', placeholder: '愛車について投稿しましょう...' };
      case 'photo':
        return { icon: Camera, title: '写真', placeholder: '車・バイクの写真を投稿しましょう...' };
      case 'question':
        return { icon: HelpCircle, title: '質問', placeholder: '車・バイクについて質問しましょう...' };
      case 'video':
        return { icon: Video, title: '動画', placeholder: '車・バイクの動画を投稿しましょう...' };
      case 'maintenance':
        return { icon: Wrench, title: '整備記録', placeholder: '整備の詳細を記録しましょう...' };
      case 'general':
        return { icon: Car, title: '投稿', placeholder: '投稿内容を入力してください...' };
      default:
        return { icon: Car, title: '投稿作成', placeholder: '投稿内容を入力してください...' };
    }
  };

  const postTypeInfo = getPostTypeInfo();
  const IconComponent = postTypeInfo.icon;

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleAddTool = () => {
    if (newTool.trim() && !tools.includes(newTool.trim())) {
      setTools([...tools, newTool.trim()]);
      setNewTool('');
    }
  };

  const handleRemoveTool = (tool: string) => {
    setTools(tools.filter(t => t !== tool));
  };

  const handleAddPart = () => {
    if (newPart.trim() && !parts.includes(newPart.trim())) {
      setParts([...parts, newPart.trim()]);
      setNewPart('');
    }
  };

  const handleRemovePart = (part: string) => {
    setParts(parts.filter(p => p !== part));
  };

  // みんから風の手順管理
  const handleAddStep = () => {
    const newStep: MaintenanceStep = {
      id: `step-${Date.now()}`,
      order: steps.length + 1,
      title: '',
      description: '',
      image: '',
      tips: ''
    };
    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId).map((step, index) => ({
      ...step,
      order: index + 1
    })));
  };

  const handleUpdateStep = (stepId: string, field: keyof MaintenanceStep, value: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  const handleStepImageChange = (stepId: string, image: string) => {
    handleUpdateStep(stepId, 'image', image);
  };

  const handleSubmit = () => {
    if (content.trim()) {
      const postData = {
        title,
        content,
        postType: selectedPostType,
        images,
        tags,
        ...(selectedPostType === 'maintenance' && {
          selectedCar,
          workTime,
          cost,
          difficulty,
          tools,
          parts,
          steps
        })
      };
      console.log('投稿内容:', postData);
      onBackClick?.();
    }
  };

  const isMaintenanceForm = selectedPostType === 'maintenance';

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader 
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
      
      <main className="p-4 pb-24 pt-0 fade-in" style={{ position: 'relative', zIndex: 9999 }}>
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl hover:bg-surface-light transition-all duration-300 hover:scale-95 active:scale-95"
            >
              <ArrowLeft size={20} className="text-white transition-all duration-300" />
            </button>
            <div className="flex items-center space-x-2">
              <IconComponent size={20} className="text-primary transition-all duration-300" />
              <h1 className="text-lg font-bold text-text-primary">{postTypeInfo.title}</h1>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || (isMaintenanceForm && !selectedCar)}
            className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              content.trim() && (!isMaintenanceForm || selectedCar)
                ? 'bg-primary text-white hover:bg-primary-dark hover:scale-105 active:scale-95'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={16} className="inline mr-1 transition-all duration-300" />
            投稿
          </button>
        </div>

        

        {/* 投稿フォーム */}
        <div className="space-y-4">
          {/* タイトル入力 */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isMaintenanceForm ? "整備作業のタイトルを入力..." : "投稿のタイトルを入力..."}
              className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* 整備記録専用フィールド */}
          {isMaintenanceForm && (
            <>
              {/* 車種選択 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">対象車種</label>
                <select
                  value={selectedCar}
                  onChange={(e) => setSelectedCar(e.target.value)}
                  className="w-full bg-transparent text-text-primary border-b border-border rounded-none px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">車種を選択</option>
                  {carModels.map((car) => (
                    <option key={car} value={car}>{car}</option>
                  ))}
                </select>
              </div>

              {/* 作業時間 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">作業時間</label>
                <input
                  type="text"
                  value={workTime}
                  onChange={(e) => setWorkTime(e.target.value)}
                  placeholder="例: 2時間30分"
                  className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* 費用 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">費用</label>
                <input
                  type="text"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="例: 15,000円"
                  className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* 難易度 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">難易度</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-transparent text-text-primary border-b border-border rounded-none px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="easy">初級</option>
                  <option value="medium">中級</option>
                  <option value="hard">上級</option>
                </select>
              </div>

              {/* 工具 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">使用工具</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTool}
                    onChange={(e) => setNewTool(e.target.value)}
                    placeholder="工具名を入力"
                    className="flex-1 bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleAddTool}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <div
                      key={tool}
                      className="flex items-center space-x-2 px-3 py-1 bg-primary bg-opacity-20 text-primary rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <span className="text-sm">{tool}</span>
                      <button
                        onClick={() => handleRemoveTool(tool)}
                        className="hover:text-red-400 transition-all duration-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* パーツ */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">使用パーツ</label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newPart}
                    onChange={(e) => setNewPart(e.target.value)}
                    placeholder="パーツ名を入力"
                    className="flex-1 bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-4 py-2 focus:outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={handleAddPart}
                    className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {parts.map((part) => (
                    <div
                      key={part}
                      className="flex items-center space-x-2 px-3 py-1 bg-primary bg-opacity-20 text-primary rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <span className="text-sm">{part}</span>
                      <button
                        onClick={() => handleRemovePart(part)}
                        className="hover:text-red-400 transition-all duration-300"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 手順 */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">作業手順</label>
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className="bg-surface-light rounded-lg p-6 transition-colors hover:bg-surface"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-text-primary">手順 {step.order}</h4>
                        <button
                          onClick={() => handleRemoveStep(step.id)}
                          className="p-1 rounded-full hover:bg-red-500 hover:bg-opacity-20 transition-all duration-300 hover:scale-110"
                        >
                          <Minus size={16} className="text-red-400" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleUpdateStep(step.id, 'title', e.target.value)}
                          placeholder="手順のタイトル"
                          className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        />
                        <textarea
                          value={step.description}
                          onChange={(e) => handleUpdateStep(step.id, 'description', e.target.value)}
                          placeholder="手順の詳細説明"
                          rows={3}
                          className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        />
                        <textarea
                          value={step.tips}
                          onChange={(e) => handleUpdateStep(step.id, 'tips', e.target.value)}
                          placeholder="コツ・注意点"
                          rows={2}
                          className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-3 py-2 focus:outline-none focus:border-primary transition-colors"
                        />
                        <StepImageUpload
                          image={step.image}
                          onImageChange={(image) => handleStepImageChange(step.id, image)}
                          stepNumber={step.order}
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddStep}
                    className="w-full py-3 border-2 border-dashed border-surface-light rounded-xl text-gray-400 hover:text-white hover:border-primary transition-all duration-300 hover:scale-105"
                  >
                    <Plus size={20} className="inline mr-2" />
                    手順を追加
                  </button>
                </div>
              </div>
            </>
          )}

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 transition-all duration-300">タグ</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="タグを入力"
                className="flex-1 px-4 py-2 bg-surface border border-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-all duration-300"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all duration-300 hover:scale-105 active:scale-95"
              >
                追加
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center space-x-2 px-3 py-1 bg-primary bg-opacity-20 text-primary rounded-lg transition-all duration-300 hover:scale-105"
                >
                  <span className="text-sm">#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-400 transition-all duration-300"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 画像アップロード */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 transition-all duration-300">画像</label>
            <ImageUpload
              images={images}
              onImagesChange={handleImagesChange}
              maxImages={5}
            />
          </div>

          {/* 内容入力 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2 transition-all duration-300">
              {isMaintenanceForm ? 'メモ' : '内容'}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={postTypeInfo.placeholder}
              rows={6}
              className="w-full bg-transparent text-text-primary placeholder-text-secondary border-b border-border rounded-none px-4 py-3 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>
      </main>
    </div>
  );
};
