import { ArrowLeft, Bike, Car } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { SingleImageUpload } from '../components/ui/SingleImageUpload';
import { useVehicles } from '../hooks/useVehicles';
import { Vehicle } from '../types';

interface EditVehiclePageProps {
  vehicle: Vehicle;
  onBackClick: () => void;
  onSaveSuccess?: () => void;
}

export const EditVehiclePage: React.FC<EditVehiclePageProps> = ({
  vehicle,
  onBackClick,
  onSaveSuccess
}) => {
  const [vehicleName, setVehicleName] = useState(vehicle.name);
  const [selectedType, setSelectedType] = useState<'car' | 'bike'>(vehicle.type);
  const [selectedImage, setSelectedImage] = useState<string | undefined>(vehicle.image);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(vehicle.year);
  const [customContent, setCustomContent] = useState(vehicle.customContent || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const { updateVehicle } = useVehicles();

  // 年式の選択肢（2000年から現在まで）
  const years = Array.from({ length: 25 }, (_, i) => 2024 - i);

  const handleSave = async () => {
    if (!vehicleName.trim() || !selectedType) {
      alert('車両名と車種を入力してください。');
      return;
    }

    try {
      setIsSaving(true);
      
      console.log('車両更新開始:', {
        name: vehicleName.trim(),
        type: selectedType,
        image: selectedImage,
        year: selectedYear,
        customContent: customContent.trim()
      });
      
      const vehicleData: any = {
        name: vehicleName.trim(),
        type: selectedType
      };

      // 値が存在する場合のみ追加
      if (selectedImage) {
        vehicleData.image = selectedImage;
      }
      if (selectedYear) {
        vehicleData.year = selectedYear;
      }
      if (customContent.trim()) {
        vehicleData.customContent = customContent.trim();
      }

      await updateVehicle(vehicle.id, vehicleData);

      console.log('車両更新成功');
      
      alert('車両を更新しました！');
      onSaveSuccess ? onSaveSuccess() : onBackClick();
    } catch (error) {
      console.error('車両の更新に失敗しました:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      alert(`車両の更新に失敗しました:\n${errorMessage}\n\nブラウザのコンソールでより詳細な情報を確認してください。`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        onNotificationClick={() => {}}
        onProfileClick={() => {}}
      />

      <main className="px-4 pb-24 pt-0">
        {/* ヘッダー */}
        <div className="flex items-center space-x-3 mb-6">
          <button
            onClick={onBackClick}
            className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">愛車編集</h1>
        </div>

        {/* 車両名 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            車両名 *
          </label>
          <input
            type="text"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            placeholder="例: スイフト、CB400SF"
            className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* 車種 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            車種 *
          </label>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setSelectedType('car')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border transition-all ${
                selectedType === 'car'
                  ? 'bg-primary border-primary text-white'
                  : 'bg-surface border-surface-light text-gray-400 hover:text-white'
              }`}
            >
              <Car size={20} />
              <span>車</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedType('bike')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border transition-all ${
                selectedType === 'bike'
                  ? 'bg-primary border-primary text-white'
                  : 'bg-surface border-surface-light text-gray-400 hover:text-white'
              }`}
            >
              <Bike size={20} />
              <span>バイク</span>
            </button>
          </div>
        </div>

        {/* 画像アップロード */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            車両画像
          </label>
          <SingleImageUpload
            image={selectedImage || null}
            onImageChange={(image) => setSelectedImage(image || undefined)}
            placeholder="車両の画像をアップロード"
          />
        </div>

        {/* 年式 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-2">
            年式
          </label>
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
          >
            <option value="">年式を選択</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>

        {/* カスタム内容 */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-white mb-2">
            カスタム内容
          </label>
          <textarea
            value={customContent}
            onChange={(e) => setCustomContent(e.target.value)}
            placeholder="カスタム内容やメモを入力してください"
            rows={4}
            className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={isSaving || !vehicleName.trim() || !selectedType}
          className="w-full py-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? '更新中...' : '更新'}
        </button>
      </main>
    </div>
  );
};
