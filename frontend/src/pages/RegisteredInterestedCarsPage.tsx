import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { MotoIcon } from '../components/icons/MotoIcon';
import { AppHeader } from '../components/ui/AppHeader';
import { EnhancedCarApplicationForm } from '../components/ui/EnhancedCarApplicationForm';
import { InterestedCarCard } from '../components/ui/InterestedCarCard';
import { useAuth } from '../hooks/useAuth';
import { useVehicleCatalog } from '../hooks/useVehicleCatalog';
import { useVehicleYears } from '../hooks/useVehicleYears';
import { createVehicleRequestNotification } from '../lib/notifications';

interface VehicleRequest {
  maker: string;
  model: string;
  year?: string;
  notes?: string;
}

interface RegisteredInterestedCarsPageProps {
  onBackClick?: () => void;
  onRemoveCar?: (carName: string) => void;
  onAddCar?: (carName: string) => void;
  onVehicleRequest?: (request: VehicleRequest) => void;
  interestedCars?: string[];
}

export const RegisteredInterestedCarsPage: React.FC<RegisteredInterestedCarsPageProps> = ({
  onBackClick,
  onRemoveCar,
  onAddCar,
  onVehicleRequest,
  interestedCars = []
}) => {
  // const [searchQuery, setSearchQuery] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const { user, userDoc } = useAuth();
  const catalog = useVehicleCatalog();
  const [selectedMaker, setSelectedMaker] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const { years: yearRanges } = useVehicleYears(selectedMaker || undefined, selectedModel || undefined);
  const [selectedYearRange, setSelectedYearRange] = useState<string | null>(null);
  const [makerOpen, setMakerOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);

  const handleRemoveCar = (carName: string) => {
    onRemoveCar?.(carName);
  };

  const handleAddFavorite = () => {
    if (!selectedMaker || !selectedModel) {
      alert('メーカーとモデルを選択してください');
      return;
    }
    if (!selectedYearRange) {
      alert('年式レンジを選択してください');
      return;
    }
    const label = `${selectedModel} ${selectedYearRange}`;
    onAddCar?.(label);
    // reset
    setSelectedMaker('');
    setSelectedModel('');
    setSelectedYearRange(null);
    setMakerOpen(false); setModelOpen(false); setYearOpen(false);
  };

  const handleVehicleRequest = async (request: VehicleRequest) => {
    try {
      // 管理者に通知を送信
      if (user?.uid && userDoc?.displayName) {
        await createVehicleRequestNotification(
          user.uid,
          userDoc.displayName,
          request
        );
      }
      
      // 親コンポーネントの処理も実行
      await onVehicleRequest?.(request);
      
      // 成功メッセージ
      alert('車種申請を送信しました。管理者が確認後、データベースに追加されます。');
    } catch (error) {
      console.error('車種申請エラー:', error);
      alert('車種申請の送信に失敗しました。もう一度お試しください。');
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader
        onNotificationClick={() => console.log('Notifications clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="p-4 pb-24 pt-0">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackClick}
              className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">お気に入り車種</h1>
              <p className="text-sm text-gray-400">車種を登録・管理</p>
            </div>
          </div>
        </div>

        {/* メーカー / モデル / 年式レンジ ピッカー（縦3行） */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-bold text-white">メーカー / モデル</label>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white text-xs font-medium transition-all duration-300 hover:scale-105 mt-3"
            >
              申請
            </button>
          </div>

          <div className="space-y-3">
            {/* メーカー */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">メーカー</label>
              <button type="button" onClick={()=>setMakerOpen(!makerOpen)} className="w-full text-left px-3 py-2 bg-surface-light border border-surface-light rounded-lg text-white">
                {selectedMaker || '選択してください'}
              </button>
              {makerOpen && (
                <div className="mt-2 max-h-60 overflow-y-auto bg-surface-light rounded-lg border border-surface-light">
                  {catalog.makers.map((m: string) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setSelectedMaker(m); setSelectedModel(''); setSelectedYearRange(null); setMakerOpen(false); setModelOpen(true); }}
                      className={`w-full text-left px-3 py-2 border-b border-surface ${selectedMaker===m?'bg-primary text-white':'text-white hover:bg-surface'}`}
                    >{m}</button>
                  ))}
                </div>
              )}
            </div>

            {/* モデル */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">モデル</label>
              <button type="button" disabled={!selectedMaker} onClick={()=>setModelOpen(!modelOpen)} className={`w-full text-left px-3 py-2 rounded-lg border ${selectedMaker? 'bg-surface-light border-surface-light text-white':'bg-surface-light/50 border-surface text-gray-500 cursor-not-allowed'}`}>
                {selectedModel || (selectedMaker ? '選択してください' : '先にメーカーを選択してください')}
              </button>
              {modelOpen && selectedMaker && (
                <div className="mt-2 max-h-60 overflow-y-auto bg-surface-light rounded-lg border border-surface-light">
                  {(catalog.makerToModels[selectedMaker] || []).map((model: string) => (
                    <button
                      key={model}
                      type="button"
                      onClick={() => { setSelectedModel(model); setSelectedYearRange(null); setModelOpen(false); setYearOpen(true); }}
                      className={`w-full text-left px-3 py-2 border-b border-surface ${selectedModel===model?'bg-primary text-white':'text-white hover:bg-surface'}`}
                    >{model}</button>
                  ))}
                </div>
              )}
            </div>

            {/* 年式レンジ */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">年式レンジ</label>
              <button type="button" disabled={!selectedModel} onClick={()=>setYearOpen(!yearOpen)} className={`w-full text-left px-3 py-2 rounded-lg border ${selectedModel? 'bg-surface-light border-surface-light text-white':'bg-surface-light/50 border-surface text-gray-500 cursor-not-allowed'}`}>
                {selectedYearRange || (selectedModel ? '選択してください' : '先にモデルを選択してください')}
              </button>
              {yearOpen && selectedModel && (
                <div className="mt-2 max-h-60 overflow-y-auto bg-surface-light rounded-lg border border-surface-light">
                  {yearRanges.length > 0 ? (
                    yearRanges.map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => { setSelectedYearRange(yr); setYearOpen(false); }}
                        className={`w-full text-left px-3 py-2 border-b border-surface ${selectedYearRange===yr?'bg-primary text-white':'text-white hover:bg-surface'}`}
                      >{yr}</button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-400">年式レンジ情報が見つかりません。必要に応じて申請してください。</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button onClick={handleAddFavorite} className="px-4 py-2 bg-primary text-white rounded-lg">登録</button>
            </div>
          </div>
        </div>

        {/* 登録済み車種一覧 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">登録済み車種</h2>
            <span className="text-sm text-gray-400">{interestedCars.length}台</span>
          </div>
          
          {interestedCars.length > 0 ? (
            interestedCars.map((carName) => (
              <InterestedCarCard
                key={carName}
                carName={carName}
                onRemove={handleRemoveCar}
                onClick={() => console.log('Car clicked:', carName)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <MotoIcon size={48} className="text-gray-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-white mb-2">登録済み車種がありません</div>
              <div className="text-sm text-gray-400">上記の検索バーからお気に入り車種を追加してみてください</div>
            </div>
          )}
        </div>
      </main>

      {/* 車種申請モーダル（愛車登録と同一UIに統一） */}
      <EnhancedCarApplicationForm
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={(result) => {
          console.log('Car application result (favorites):', result);
          setIsRequestModalOpen(false);
          // 申請成功後に必要なら再読込
          window.location.reload();
        }}
      />
    </div>
  );
};
