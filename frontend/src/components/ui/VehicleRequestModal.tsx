import { AlertCircle, Car, X } from 'lucide-react';
import React, { useState } from 'react';
import { useVehicleCatalog } from '../../hooks/useVehicleCatalog';
import { normalizeMakerAndModel } from '../../utils/normalizer';
import { AutoCompleteInput } from './AutoCompleteInput';

interface VehicleRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: VehicleRequest) => void;
}

interface VehicleRequest {
  maker: string;
  model: string;
  year?: string;
  notes?: string;
}

// 年式の選択肢（1990年から2024年まで）
const generateYearOptions = () => {
  const years = [];
  for (let year = 2024; year >= 1990; year--) {
    years.push(year);
  }
  return years;
};

const yearOptions = generateYearOptions();

// 月の選択肢
const monthOptions = [
  { value: '1', label: '1月' },
  { value: '2', label: '2月' },
  { value: '3', label: '3月' },
  { value: '4', label: '4月' },
  { value: '5', label: '5月' },
  { value: '6', label: '6月' },
  { value: '7', label: '7月' },
  { value: '8', label: '8月' },
  { value: '9', label: '9月' },
  { value: '10', label: '10月' },
  { value: '11', label: '11月' },
  { value: '12', label: '12月' },
];

export const VehicleRequestModal: React.FC<VehicleRequestModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const { loading: catalogLoading, makers, makerToModels } = useVehicleCatalog();
  const [formData, setFormData] = useState<VehicleRequest>({
    maker: '',
    model: '',
    year: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 期間選択の状態（配列で管理）
  const [periods, setPeriods] = useState<Array<{
    startYear: string;
    startMonth: string;
    endYear: string;
    endMonth: string;
  }>>([{ startYear: '', startMonth: '', endYear: '', endMonth: '' }]);

  // 入力検証（リアルタイム）
  const isPeriodOrderValid = (p: { startYear: string; startMonth: string; endYear: string; endMonth: string }) => {
    if (!p.startYear || !p.startMonth || !p.endYear || !p.endMonth) return true; // どれか欠けていれば順序チェックスキップ
    const start = new Date(Number(p.startYear), Number(p.startMonth) - 1, 1).getTime();
    const end = new Date(Number(p.endYear), Number(p.endMonth) - 1, 1).getTime();
    return start <= end;
  };

  const hasValidStart = periods.some(p => p.startYear && p.startMonth);
  const hasOrderError = periods.some(p => !isPeriodOrderValid(p));
  const isYearPeriodValid = hasValidStart && !hasOrderError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.maker.trim() || !formData.model.trim()) {
      return;
    }

    // 期間の整合性チェック：開始 > 終了 のものが含まれていたら弾く
    if (hasOrderError) {
      alert('年式期間の開始と終了の前後関係を確認してください。開始は終了以前である必要があります。');
      return;
    }

    // 年式期間必須：少なくとも1つは開始年・開始月が入力されている必要
    if (!hasValidStart) {
      alert('年式期間は必須です。少なくとも1つの開始年・開始月を入力してください。');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // 期間を組み合わせて年式フィールドに設定
      const yearStrings = periods
        .filter(period => period.startYear && period.startMonth)
        .map(period => {
          let yearString = `${period.startYear}.${period.startMonth}`;
          if (period.endYear && period.endMonth) {
            yearString += `～${period.endYear}.${period.endMonth}`;
          } else if (period.endYear) {
            yearString += `～${period.endYear}`;
          }
          return yearString;
        });
      
      const normalized = normalizeMakerAndModel(formData.maker, formData.model);
      const submitData = {
        ...formData,
        maker: normalized.maker,
        model: normalized.model,
        year: yearStrings.join('\n')
      };
      
      await onSubmit(submitData);
      // フォームをリセット
      setFormData({
        maker: '',
        model: '',
        year: '',
        notes: ''
      });
      setPeriods([{ startYear: '', startMonth: '', endYear: '', endMonth: '' }]);
      onClose();
    } catch (error) {
      console.error('車種申請エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof VehicleRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 期間の更新
  const updatePeriod = (index: number, field: string, value: string) => {
    setPeriods(prev => {
      const newPeriods = [...prev];
      newPeriods[index] = { ...newPeriods[index], [field]: value };
      
      // 現在の期間が埋まったら次の期間を追加
      const currentPeriod = newPeriods[index];
      if (currentPeriod.startYear && currentPeriod.startMonth && 
          index === newPeriods.length - 1) {
        newPeriods.push({ startYear: '', startMonth: '', endYear: '', endMonth: '' });
      }
      
      return newPeriods;
    });
  };

  // 期間の削除
  const removePeriod = (index: number) => {
    if (periods.length > 1) {
      setPeriods(prev => prev.filter((_, i) => i !== index));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 pb-24">
      <div className="bg-surface border border-surface-light rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-surface-light">
          <div className="flex items-center gap-2">
            <Car size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-white">車種申請</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 説明 */}
          <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">車種申請について</p>
                <p>データベースに登録されていない車種を申請できます。申請後、管理者が確認して追加されます。</p>
              </div>
            </div>
          </div>

          {/* メーカー名 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              メーカー名 <span className="text-red-400">*</span>
            </label>
            <AutoCompleteInput
              value={formData.maker}
              onChange={(v) => handleInputChange('maker', v)}
              suggestions={makers}
              placeholder="例: トヨタ、ホンダ、日産"
            />
          </div>

          {/* モデル名 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              モデル名 <span className="text-red-400">*</span>
            </label>
            <AutoCompleteInput
              value={formData.model}
              onChange={(v) => handleInputChange('model', v)}
              suggestions={makerToModels[formData.maker] || []}
              placeholder="例: カローラ、シビック、RX-7"
            />
          </div>

          {/* 年式期間 */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              年式期間 <span className="text-red-400">*</span>
            </label>
            <div className="space-y-4">
              {periods.map((period, index) => (
                <div key={index} className="border border-surface-light rounded-lg p-3">
                  <div className="mb-2 text-right">
                    {periods.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePeriod(index)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        削除
                      </button>
                    )}
                  </div>
                  
                  {/* 開始期間 */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-400 mb-1">開始期間</label>
                    <div className="flex gap-2">
                      <select
                        value={period.startYear}
                        onChange={(e) => updatePeriod(index, 'startYear', e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">年</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year} className="bg-surface-light text-white">
                            {year}年
                          </option>
                        ))}
                      </select>
                      <select
                        value={period.startMonth}
                        onChange={(e) => updatePeriod(index, 'startMonth', e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">月</option>
                        {monthOptions.map((month) => (
                          <option key={month.value} value={month.value} className="bg-surface-light text-white">
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* 終了期間 */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">終了期間</label>
                    <div className="flex gap-2">
                      <select
                        value={period.endYear}
                        onChange={(e) => updatePeriod(index, 'endYear', e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">年</option>
                        {yearOptions.map((year) => (
                          <option key={year} value={year} className="bg-surface-light text-white">
                            {year}年
                          </option>
                        ))}
                      </select>
                      <select
                        value={period.endMonth}
                        onChange={(e) => updatePeriod(index, 'endMonth', e.target.value)}
                        className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                      >
                        <option value="">月</option>
                        {monthOptions.map((month) => (
                          <option key={month.value} value={month.value} className="bg-surface-light text-white">
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              開始期間を入力すると自動で次の期間が追加されます
            </p>
          </div>


          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-surface-light hover:bg-gray-600 border border-surface-light rounded-lg text-white font-medium transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!formData.maker.trim() || !formData.model.trim() || !isYearPeriodValid || isSubmitting}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {isSubmitting ? '申請中...' : '申請する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
