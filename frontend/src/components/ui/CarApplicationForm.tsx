import { AlertCircle, Car, Info, X } from 'lucide-react';
import React, { useState } from 'react';
import { CarApplicationForm as CarApplicationFormType, CarApplicationResult } from '../../types/car';
import { processCarApplication } from '../../utils/carFirestore';
import {
    formatValidationErrors,
    validateCarApplicationForm,
    validateFieldRealtime,
    ValidationError
} from '../../utils/carValidation';
import { Button } from './Button';
import { Card } from './Card';

interface CarApplicationFormProps {
  onClose: () => void;
  onSuccess?: (result: CarApplicationResult) => void;
}

export const CarApplicationForm: React.FC<CarApplicationFormProps> = ({
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CarApplicationFormType>({
    maker_name: '',
    model_name: '',
    start_year: new Date().getFullYear(),
    start_month: 1,
    end_year: new Date().getFullYear(),
    end_month: 12,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<CarApplicationResult | null>(null);

  // 年式の選択肢を生成
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 30 }, (_, i) => currentYear - 20 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

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
        // 開始年月が終了年月より後の場合、終了年月を調整
        setFormData(prev => ({
          ...prev,
          end_year: prev.start_year,
          end_month: prev.start_month,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // バリデーション
    const validation = validateCarApplicationForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    try {
      const result = await processCarApplication(formData);
      setSubmitResult(result);
      
      if (result.success && onSuccess) {
        onSuccess(result);
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
                <p>データベースに登録されていない車種を申請できます。申請後、管理者が確認して追加されます。</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* メーカー名 */}
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

            {/* モデル名 */}
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

            {/* 年式期間 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                年式期間 <span className="text-red-500">*</span>
              </label>
              
              {/* 開始期間 */}
              <div className="mb-3">
                <p className="text-sm text-text-secondary mb-2">開始期間</p>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <select
                      value={formData.start_year}
                      onChange={(e) => handleInputChange('start_year', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                        fieldErrors.start_year ? 'border-red-500' : 'border-border'
                      }`}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}年</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={formData.start_month}
                      onChange={(e) => handleInputChange('start_month', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                        fieldErrors.start_month ? 'border-red-500' : 'border-border'
                      }`}
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
                      value={formData.end_year}
                      onChange={(e) => handleInputChange('end_year', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                        fieldErrors.end_year ? 'border-red-500' : 'border-border'
                      }`}
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}年</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <select
                      value={formData.end_month}
                      onChange={(e) => handleInputChange('end_month', parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                        fieldErrors.end_month ? 'border-red-500' : 'border-border'
                      }`}
                    >
                      {months.map(month => (
                        <option key={month} value={month}>{month}月</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-xs text-text-muted">
                開始期間を入力すると自動で次の期間が追加されます
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
