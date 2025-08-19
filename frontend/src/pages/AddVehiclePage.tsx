import { ArrowLeft, Bike, Camera, Car } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { BannerAd } from '../components/ui/BannerAd';

interface AddVehiclePageProps {
  onBackClick?: () => void;
}

export const AddVehiclePage: React.FC<AddVehiclePageProps> = ({ onBackClick }) => {
  const [vehicleName, setVehicleName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'car' | 'bike' | null>(null);
  const [customContent, setCustomContent] = useState('');

  const handleImageUpload = () => {
    // 実際のアプリではファイル選択ダイアログを開く
    console.log('Image upload clicked');
    // ダミー画像を設定
    setSelectedImage('/images/cars/s13.jpg');
  };

  const handleSave = () => {
    console.log('Save vehicle:', { 
      name: vehicleName, 
      image: selectedImage, 
      type: selectedType,
      customContent: customContent 
    });
    onBackClick?.();
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <BannerAd />
      <AppHeader 
        user={{ id: "1", name: "RevLinkユーザー", avatar: "/images/avatars/user1.jpg", cars: [], interestedCars: [] }}
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />
      
      <main className="p-4 pb-20 pt-0">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBackClick}
                className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <h1 className="text-lg font-bold text-white">愛車を追加</h1>
            </div>
            <button
              onClick={handleSave}
              disabled={!vehicleName.trim() || !selectedType}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                vehicleName.trim() && selectedType
                  ? 'bg-primary text-white hover:scale-95 active:scale-95'
                  : 'bg-surface-light text-gray-400 cursor-not-allowed'
              }`}
            >
              保存
            </button>
          </div>

          {/* 車両画像 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">車両画像</label>
            <div
              onClick={handleImageUpload}
              className={`w-full h-48 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                selectedImage
                  ? 'border-surface-light'
                  : 'border-surface-light hover:border-primary'
              } flex items-center justify-center relative overflow-hidden`}
            >
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt="車両画像"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="bg-white bg-opacity-90 rounded-full p-2">
                      <Camera size={20} className="text-black" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-surface-light rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Camera size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-400">画像をタップして選択</p>
                </div>
              )}
            </div>
          </div>

          {/* 車両名 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">車両名</label>
            <input
              type="text"
              value={vehicleName}
              onChange={(e) => setVehicleName(e.target.value)}
              placeholder="例: Nissan S13"
              className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20"
            />
          </div>

          {/* 車種選択 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">車種</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedType('car')}
                className={`p-4 rounded-xl border-2 transition-colors flex flex-col items-center space-y-2 ${
                  selectedType === 'car'
                    ? 'border-primary bg-primary bg-opacity-20'
                    : 'border-surface-light hover:border-primary'
                }`}
              >
                <Car size={24} className={selectedType === 'car' ? 'text-primary' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${
                  selectedType === 'car' ? 'text-primary' : 'text-white'
                }`}>
                  車
                </span>
              </button>
              
              <button
                onClick={() => setSelectedType('bike')}
                className={`p-4 rounded-xl border-2 transition-colors flex flex-col items-center space-y-2 ${
                  selectedType === 'bike'
                    ? 'border-primary bg-primary bg-opacity-20'
                    : 'border-surface-light hover:border-primary'
                }`}
              >
                <Bike size={24} className={selectedType === 'bike' ? 'text-primary' : 'text-gray-400'} />
                <span className={`text-sm font-medium ${
                  selectedType === 'bike' ? 'text-primary' : 'text-white'
                }`}>
                  バイク
                </span>
              </button>
            </div>
          </div>

          {/* 年式 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">年式</label>
            <select className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20">
              <option value="">選択してください</option>
              {Array.from({ length: 30 }, (_, i) => 2024 - i).map((year) => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>

          {/* カスタム内容 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">カスタム内容</label>
            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="車両についてのカスタム内容を入力してください（例: カスタム内容、特別な装備、思い出など）"
              rows={3}
              className="w-full px-4 py-3 bg-surface border border-surface-light rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-20 resize-none"
            />
                     </div>
       </main>
    </div>
  );
};
