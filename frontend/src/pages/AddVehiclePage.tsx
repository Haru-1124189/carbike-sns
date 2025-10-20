import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { EnhancedCarApplicationForm } from '../components/ui/EnhancedCarApplicationForm';
import { SingleImageUpload } from '../components/ui/SingleImageUpload';
import { YearRangeModal } from '../components/ui/YearRangeModal';
import { useAuth } from '../hooks/useAuth';
import { useVehicleCatalog } from '../hooks/useVehicleCatalog';
import { useVehicles } from '../hooks/useVehicles';
import { useVehicleYears } from '../hooks/useVehicleYears';
import { createVehicleRequestNotification } from '../lib/notifications';
import { VehicleModel } from '../types/vehicleData';

interface VehicleRequest {
  maker: string;
  model: string;
  year?: string;
  notes?: string;
}

interface AddVehiclePageProps {
  onBackClick?: () => void;
  onVehicleRequest?: (request: VehicleRequest) => void;
}

export const AddVehiclePage: React.FC<AddVehiclePageProps> = ({ onBackClick, onVehicleRequest }) => {
  const [vehicleName, setVehicleName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<'car' | 'bike' | null>(null);
  const [selectedVehicleModel, setSelectedVehicleModel] = useState<VehicleModel | null>(null);
  const [selectedMaker, setSelectedMaker] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedYearRange, setSelectedYearRange] = useState<string | null>(null);
  const [showYearRangeModal, setShowYearRangeModal] = useState(false);
  const catalog = useVehicleCatalog();
  const [makerOpen, setMakerOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const [customContent, setCustomContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  
  const { addVehicle } = useVehicles();
  const { user, userDoc } = useAuth();

  const handleImageChange = (image: string | null) => {
    setSelectedImage(image);
  };

  const handleMakerChange = (maker: string) => {
    setSelectedMaker(maker);
    setSelectedModel('');
    setSelectedYearRange(null);
    setMakerOpen(false);
    setModelOpen(true);
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    setVehicleName(model);
    setSelectedYearRange(null);
    setModelOpen(false);
    setYearOpen(true);
  };

  // VehicleModelの構造差異を吸収（displayNameなどから推測）
  const makerGuess = selectedMaker;
  const modelGuess = selectedModel || vehicleName;
  const { years: yearRanges } = useVehicleYears(makerGuess || undefined, modelGuess || undefined);

  const handleSave = async () => {
    if (!vehicleName.trim() || !selectedType) {
      alert('車両名と車種を入力してください。');
      return;
    }
    if (!selectedYearRange) {
      alert('年式レンジを選択してください。');
      return;
    }

    try {
      setIsSaving(true);
      
      const vehicleData: any = {
        name: vehicleName.trim(),
        type: selectedType
      };

      // 値が存在する場合のみ追加
      if (selectedImage) {
        vehicleData.image = selectedImage;
      }
      if (selectedYearRange) {
        vehicleData.yearRange = selectedYearRange;
      }
      if (customContent.trim()) {
        vehicleData.customContent = customContent.trim();
      }

      await addVehicle(vehicleData);
      
      // 成功時にフィードバック
      alert('車両を登録しました！');
      
      // 少し待ってからページを戻る（データの同期を待つ）
      setTimeout(() => {
        onBackClick?.();
      }, 500);
    } catch (error) {
      console.error('車両の保存に失敗しました:', error);
      
      // より詳細なエラーメッセージを表示
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      alert(`車両の保存に失敗しました:\n${errorMessage}\n\nブラウザのコンソールでより詳細な情報を確認してください。`);
    } finally {
      setIsSaving(false);
    }
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
              <h1 className="text-lg font-bold text-white">愛車を追加</h1>
            </div>
            
            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={!vehicleName.trim() || !selectedType || isSaving}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                vehicleName.trim() && selectedType && !isSaving
                  ? 'bg-primary text-white hover:scale-95 active:scale-95'
                  : 'bg-surface-light text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>

          {/* 車両画像 */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">画像 / 動画</label>
            <SingleImageUpload
              image={selectedImage}
              onImageChange={handleImageChange}
              aspectRatio="landscape"
              placeholder="画像/動画をタップして選択（動画は30秒以内）"
            />
          </div>

          {/* メーカー → モデル ピッカー（縦スクロール） */}
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

            {/* メーカー（縦リスト） */}
            <div className="mb-3 space-y-3">
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
                        onClick={() => handleMakerChange(m)}
                        className={`w-full text-left px-3 py-2 border-b border-surface ${selectedMaker===m?'bg-primary text-white':'text-white hover:bg-surface'}`}
                      >{m}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* モデル（縦リスト） */}
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
                        onClick={() => handleModelChange(model)}
                        className={`w-full text-left px-3 py-2 border-b border-surface ${selectedModel===model?'bg-primary text-white':'text-white hover:bg-surface'}`}
                      >{model}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* 年式レンジ（縦リスト） */}
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
            </div>

            {/* 新規申請ボタン */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                新規申請
              </button>
            </div>
          </div>

          {/* 車両名/車種タイプ/年式レンジ（下部）は非表示に変更 */}

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

       {/* 車種申請モーダル */}
       <EnhancedCarApplicationForm
         isOpen={isRequestModalOpen}
         onClose={() => setIsRequestModalOpen(false)}
         onSuccess={(result) => {
           console.log('Car application result:', result);
           setIsRequestModalOpen(false);
           // 成功時はデータをリフレッシュ
           window.location.reload();
         }}
       />

      {/* 年式レンジモーダル */}
      <YearRangeModal
        isOpen={showYearRangeModal}
        yearRanges={yearRanges}
        onClose={()=>setShowYearRangeModal(false)}
        onConfirm={(r)=>{ setSelectedYearRange(r); setShowYearRangeModal(false); }}
      />
    </div>
  );
};
