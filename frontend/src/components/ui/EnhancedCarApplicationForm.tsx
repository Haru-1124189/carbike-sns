import { AlertCircle, Car, Info, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useExistingCarData } from '../../hooks/useExistingCarData';
import { createNotification } from '../../lib/notifications';
import { CarApplicationForm as CarApplicationFormType, CarApplicationResult } from '../../types/car';
import { processCarApplication } from '../../utils/carFirestore';
import {
    formatValidationErrors,
    validateFieldRealtime,
    ValidationError
} from '../../utils/carValidation';
import { Button } from './Button';
import { Card } from './Card';

interface EnhancedCarApplicationFormProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: (result: CarApplicationResult) => void;
}

export const EnhancedCarApplicationForm: React.FC<EnhancedCarApplicationFormProps> = ({
  isOpen = true,
  onClose,
  onSuccess
}) => {
  const { carData, makers, getModels, loading: dataLoading, error: dataError } = useExistingCarData();
  const { user, userDoc } = useAuth();
  
  const [formData, setFormData] = useState<CarApplicationFormType>({
    maker_name: '',
    model_name: '',
    start_year: new Date().getFullYear(),
    start_month: 1,
    end_year: new Date().getFullYear(),
    end_month: 12,
  });

  // 年式レンジの配列を管理
  const [yearRanges, setYearRanges] = useState<CarApplicationFormType[]>([
    {
      maker_name: '',
      model_name: '',
      start_year: new Date().getFullYear(),
      start_month: 1,
      end_year: new Date().getFullYear(),
      end_month: 12,
    }
  ]);

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<CarApplicationResult | null>(null);
  
  // 検索・選択用の状態
  const [searchTerm, setSearchTerm] = useState('');
  const [showMakerDropdown, setShowMakerDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isNewCar, setIsNewCar] = useState(false);

  // 年式の選択肢を生成
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - 20 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // メーカー選択時の処理
  const handleMakerSelect = (maker: string) => {
    setFormData(prev => ({ ...prev, maker_name: maker, model_name: '' }));
    setAvailableModels(getModels(maker));
    setShowMakerDropdown(false);
    setShowModelDropdown(true);
    setIsNewCar(false);
  };

  // モデル選択時の処理
  const handleModelSelect = (model: string) => {
    setFormData(prev => ({ ...prev, model_name: model }));
    setShowModelDropdown(false);
    setIsNewCar(false);
  };

  // 検索機能
  const filteredMakers = makers.filter(maker =>
    maker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredModels = availableModels.filter(model =>
    model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 新規車種モードの切り替え
  const handleNewCarMode = () => {
    setIsNewCar(true);
    setFormData(prev => ({ ...prev, maker_name: '', model_name: '' }));
    setShowMakerDropdown(false);
    setShowModelDropdown(false);
  };

  const handleInputChange = (field: keyof CarApplicationFormType, value: string | number) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // リアルタイムバリデーション
    const fieldError = validateFieldRealtime(field, value);
    if (fieldError) {
      setFieldErrors(prev => ({ ...prev, [field]: fieldError.message }));
    } else {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // 年式範囲の自動調整
    if (field === 'start_year' || field === 'start_month') {
      const startDate = new Date(
        field === 'start_year' ? value as number : newFormData.start_year,
        (field === 'start_month' ? value as number : newFormData.start_month) - 1
      );
      const endDate = new Date(newFormData.end_year, newFormData.end_month - 1);

      if (startDate > endDate) {
        setFormData(prev => ({
          ...prev,
          end_year: prev.start_year,
          end_month: prev.start_month,
        }));
      }
    }
  };

  // 年式レンジの入力処理
  const handleYearRangeChange = (index: number, field: keyof CarApplicationFormType, value: string | number) => {
    setYearRanges(prev => prev.map((range, i) => 
      i === index ? { ...range, [field]: value } : range
    ));

    // 年式レンジが完全に入力されたら次のフォームを追加
    const currentRange = yearRanges[index];
    const updatedRange = { ...currentRange, [field]: value };
    
    // 終了年月が入力されたら次のフォームを追加
    if (field === 'end_year' || field === 'end_month') {
      const isComplete = updatedRange.start_year && updatedRange.start_month && 
                        updatedRange.end_year && updatedRange.end_month;
      
      if (isComplete && index === yearRanges.length - 1) {
        // 最後の年式レンジが完了したら新しいフォームを追加
        const nextYear = updatedRange.end_year + 1;
        setYearRanges(prev => [...prev, {
          maker_name: formData.maker_name,
          model_name: formData.model_name,
          start_year: nextYear,
          start_month: 1,
          end_year: nextYear,
          end_month: 12,
        }]);
      }
    }
  };

  // 年式レンジを削除
  const removeYearRange = (index: number) => {
    if (yearRanges.length > 1) {
      setYearRanges(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 有効な年式レンジのみを取得
    const validYearRanges = yearRanges.filter(range => 
      range.start_year && range.start_month && range.end_year && range.end_month
    );

    if (validYearRanges.length === 0) {
      setErrors([{ field: 'year_ranges', message: '少なくとも1つの年式レンジを入力してください' }]);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      let lastResult: CarApplicationResult | null = null;
      
      // 各年式レンジを順次処理
      for (const yearRange of validYearRanges) {
        const applicationData = {
          ...formData,
          ...yearRange
        };
        
        const result = await processCarApplication(applicationData);
        lastResult = result;
        
        if (!result.success) {
          setSubmitResult(result);
          setIsSubmitting(false);
          return;
        }
      }
      
      // 最後の結果を表示
      if (lastResult) {
        setSubmitResult({
          ...lastResult,
          message: `${validYearRanges.length}個の年式レンジが正常に申請されました`
        });
        
        // 管理者に通知を送信
        if (user && userDoc) {
          try {
            await createNotification({
              userId: 'admin', // 管理者用の固定ID
              type: 'car_application',
              title: '車種申請が届きました',
              content: `${userDoc.displayName || user.displayName || 'ユーザー'}さんから車種申請が届きました（${formData.maker_name} ${formData.model_name}）`,
              fromUserId: user.uid,
              fromUserName: userDoc.displayName || user.displayName || 'ユーザー',
              targetId: formData.maker_name + '_' + formData.model_name,
              targetType: 'car_application',
              applicationData: {
                maker: formData.maker_name,
                model: formData.model_name,
                yearRanges: validYearRanges.map(range => ({
                  start_year: range.start_year,
                  start_month: range.start_month,
                  end_year: range.end_year,
                  end_month: range.end_month,
                }))
              }
            });
          } catch (notificationError) {
            console.error('Error sending notification to admin:', notificationError);
            // 通知エラーは申請成功を妨げない
          }
        }
        
        if (lastResult.success && onSuccess) {
          onSuccess(lastResult);
        }
      }
    } catch (error) {
      console.error('Error submitting car application:', error);
      setSubmitResult({
        success: false,
        message: '申請の送信に失敗しました。もう一度お試しください。'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      maker_name: '',
      model_name: '',
      start_year: new Date().getFullYear(),
      start_month: 1,
      end_year: new Date().getFullYear(),
      end_month: 12,
    });
    setErrors([]);
    setFieldErrors({});
    setSubmitResult(null);
    setIsNewCar(false);
    setSearchTerm('');
  };

  if (submitResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Car size={24} className="text-primary" />
                <h2 className="text-lg font-semibold text-text-primary">
                  {submitResult.success ? '申請完了' : '申請エラー'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-surface-light rounded-full transition-colors"
              >
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            <div className="mb-6">
              <div className={`p-4 rounded-lg ${
                submitResult.success 
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              }`}>
                <div className="flex items-center space-x-2">
                  {submitResult.success ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  ) : (
                    <AlertCircle size={20} className="text-red-500" />
                  )}
                  <p className={`text-sm ${
                    submitResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                  }`}>
                    {submitResult.message}
                  </p>
                </div>
              </div>

              {submitResult.success && submitResult.car && (
                <div className="mt-4 p-4 bg-surface-light rounded-lg">
                  <h3 className="font-medium text-text-primary mb-2">登録内容</h3>
                  <div className="space-y-1 text-sm text-text-secondary">
                    <p><span className="font-medium">メーカー:</span> {submitResult.car.maker_name}</p>
                    <p><span className="font-medium">モデル:</span> {submitResult.car.display_name}</p>
                    <p><span className="font-medium">年式:</span> {submitResult.car.ranges.map(range => 
                      `${range.start_year}年${range.start_month}月〜${range.end_year}年${range.end_month}月`
                    ).join(', ')}</p>
                    {submitResult.isNewCar && (
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        新しい車種として登録されました
                      </p>
                    )}
                    {submitResult.isRangeAdded && (
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        既存車種に年式レンジが追加されました
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={handleReset}
                className="flex-1"
              >
                もう一度申請
              </Button>
              <Button
                onClick={onClose}
                className="flex-1"
              >
                閉じる
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Car size={24} className="text-primary" />
              <h2 className="text-lg font-semibold text-text-primary">車種申請</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-surface-light rounded-full transition-colors"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* 情報ボックス */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <Info size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">車種申請について</p>
                <p>既存の車種データから選択するか、新しい車種を申請できます。年式レンジで区別されます。</p>
              </div>
            </div>
          </div>

          {dataLoading && (
            <div className="mb-4 p-4 bg-surface-light rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm text-text-secondary">車種データを読み込み中...</span>
              </div>
            </div>
          )}

          {dataError && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-500" />
                <span className="text-sm text-red-800 dark:text-red-200">{dataError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 車種選択モード */}
            <div className="flex space-x-2 mb-4">
              <Button
                type="button"
                variant={!isNewCar ? "primary" : "secondary"}
                onClick={() => setIsNewCar(false)}
                className="flex-1"
              >
                既存車種から選択
              </Button>
              <Button
                type="button"
                variant={isNewCar ? "primary" : "secondary"}
                onClick={handleNewCarMode}
                className="flex-1"
              >
                新規車種を申請
              </Button>
            </div>

            {!isNewCar ? (
              <>
                {/* メーカー選択 */}
                <div className="relative">
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    メーカー <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.maker_name}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, maker_name: e.target.value }));
                        setSearchTerm(e.target.value);
                        setShowMakerDropdown(true);
                        setShowModelDropdown(false);
                      }}
                      onFocus={() => setShowMakerDropdown(true)}
                      placeholder="メーカーを検索..."
                      className={`w-full px-3 py-2 pr-10 border rounded-lg bg-background text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                        fieldErrors.maker_name ? 'border-red-500' : 'border-border'
                      }`}
                    />
                    <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                  </div>
                  
                  {showMakerDropdown && filteredMakers.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredMakers.map(maker => (
                        <button
                          key={maker}
                          type="button"
                          onClick={() => handleMakerSelect(maker)}
                          className="w-full text-left px-3 py-2 hover:bg-surface-light text-text-primary"
                        >
                          {maker}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {fieldErrors.maker_name && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.maker_name}</p>
                  )}
                </div>

                {/* モデル選択 */}
                {formData.maker_name && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      モデル <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.model_name}
                        onChange={(e) => {
                          setFormData(prev => ({ ...prev, model_name: e.target.value }));
                          setSearchTerm(e.target.value);
                          setShowModelDropdown(true);
                        }}
                        onFocus={() => setShowModelDropdown(true)}
                        placeholder="モデルを検索..."
                        className={`w-full px-3 py-2 pr-10 border rounded-lg bg-background text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                          fieldErrors.model_name ? 'border-red-500' : 'border-border'
                        }`}
                      />
                      <Search size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted" />
                    </div>
                    
                    {showModelDropdown && filteredModels.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredModels.map(model => (
                          <button
                            key={model}
                            type="button"
                            onClick={() => handleModelSelect(model)}
                            className="w-full text-left px-3 py-2 hover:bg-surface-light text-text-primary"
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {fieldErrors.model_name && (
                      <p className="mt-1 text-sm text-red-500">{fieldErrors.model_name}</p>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* 新規車種入力 */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    メーカー名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.maker_name}
                    onChange={(e) => handleInputChange('maker_name', e.target.value)}
                    placeholder="例:トヨタ、ホンダ、日産"
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                      fieldErrors.maker_name ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {fieldErrors.maker_name && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.maker_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    モデル名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.model_name}
                    onChange={(e) => handleInputChange('model_name', e.target.value)}
                    placeholder="例:カローラ、シビック、RX-7"
                    className={`w-full px-3 py-2 border rounded-lg bg-background text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                      fieldErrors.model_name ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  {fieldErrors.model_name && (
                    <p className="mt-1 text-sm text-red-500">{fieldErrors.model_name}</p>
                  )}
                </div>
              </>
            )}

            {/* 年式期間 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                年式期間 <span className="text-red-500">*</span>
              </label>
              
              {yearRanges.map((yearRange, index) => (
                <div key={index} className="mb-4 p-4 bg-surface-light rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-text-primary">
                      年式レンジ {index + 1}
                    </h4>
                    {yearRanges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeYearRange(index)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        削除
                      </button>
                    )}
                  </div>
                  
                  {/* 開始期間 */}
                  <div className="mb-3">
                    <p className="text-sm text-text-secondary mb-2">開始期間</p>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <select
                          value={yearRange.start_year}
                          onChange={(e) => handleYearRangeChange(index, 'start_year', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors border-border"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}年</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={yearRange.start_month}
                          onChange={(e) => handleYearRangeChange(index, 'start_month', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors border-border"
                        >
                          {months.map(month => (
                            <option key={month} value={month}>{month}月</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 終了期間 */}
                  <div>
                    <p className="text-sm text-text-secondary mb-2">終了期間</p>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <select
                          value={yearRange.end_year}
                          onChange={(e) => handleYearRangeChange(index, 'end_year', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors border-border"
                        >
                          {years.map(year => (
                            <option key={year} value={year}>{year}年</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          value={yearRange.end_month}
                          onChange={(e) => handleYearRangeChange(index, 'end_month', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors border-border"
                        >
                          {months.map(month => (
                            <option key={month} value={month}>{month}月</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <p className="mt-2 text-xs text-text-muted">
                年式レンジで車種を区別します。1つのレンジが完了すると次のレンジが追加されます。
              </p>
            </div>

            {/* エラーメッセージ */}
            {errors.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800 dark:text-red-200">
                    <p className="font-medium mb-1">入力エラーがあります</p>
                    <ul className="list-disc list-inside space-y-1">
                      {formatValidationErrors(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ボタン */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? '申請中...' : '申請する'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};
