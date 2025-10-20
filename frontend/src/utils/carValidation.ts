import { CarApplicationForm } from '../types/car';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * 車種申請フォームのバリデーション
 */
export function validateCarApplicationForm(formData: CarApplicationForm): ValidationResult {
  const errors: ValidationError[] = [];

  // メーカー名のバリデーション
  if (!formData.maker_name || !formData.maker_name.trim()) {
    errors.push({
      field: 'maker_name',
      message: 'メーカー名は必須です'
    });
  } else if (formData.maker_name.trim().length < 2) {
    errors.push({
      field: 'maker_name',
      message: 'メーカー名は2文字以上で入力してください'
    });
  } else if (formData.maker_name.trim().length > 50) {
    errors.push({
      field: 'maker_name',
      message: 'メーカー名は50文字以内で入力してください'
    });
  }

  // モデル名のバリデーション
  if (!formData.model_name || !formData.model_name.trim()) {
    errors.push({
      field: 'model_name',
      message: 'モデル名は必須です'
    });
  } else if (formData.model_name.trim().length < 2) {
    errors.push({
      field: 'model_name',
      message: 'モデル名は2文字以上で入力してください'
    });
  } else if (formData.model_name.trim().length > 50) {
    errors.push({
      field: 'model_name',
      message: 'モデル名は50文字以内で入力してください'
    });
  }

  // 年式のバリデーション
  const currentYear = new Date().getFullYear();
  const minYear = 1900;
  const maxYear = currentYear + 2; // 2年先まで許可

  // 開始年のバリデーション
  if (!formData.start_year || formData.start_year < minYear || formData.start_year > maxYear) {
    errors.push({
      field: 'start_year',
      message: `開始年は${minYear}年から${maxYear}年の間で入力してください`
    });
  }

  // 開始月のバリデーション
  if (!formData.start_month || formData.start_month < 1 || formData.start_month > 12) {
    errors.push({
      field: 'start_month',
      message: '開始月は1月から12月の間で入力してください'
    });
  }

  // 終了年のバリデーション
  if (!formData.end_year || formData.end_year < minYear || formData.end_year > maxYear) {
    errors.push({
      field: 'end_year',
      message: `終了年は${minYear}年から${maxYear}年の間で入力してください`
    });
  }

  // 終了月のバリデーション
  if (!formData.end_month || formData.end_month < 1 || formData.end_month > 12) {
    errors.push({
      field: 'end_month',
      message: '終了月は1月から12月の間で入力してください'
    });
  }

  // 年式範囲のバリデーション（開始 <= 終了）
  if (formData.start_year && formData.start_month && formData.end_year && formData.end_month) {
    const startDate = new Date(formData.start_year, formData.start_month - 1);
    const endDate = new Date(formData.end_year, formData.end_month - 1);

    if (startDate > endDate) {
      errors.push({
        field: 'year_range',
        message: '開始年月は終了年月より前である必要があります'
      });
    }

    // 年式範囲が長すぎる場合の警告（エラーではなく警告）
    const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth()) + 1;
    
    if (monthsDiff > 120) { // 10年以上
      errors.push({
        field: 'year_range',
        message: '年式範囲が長すぎる可能性があります（10年以内を推奨）'
      });
    }
  }

  // 特殊文字のバリデーション
  const specialCharRegex = /[<>{}[\]\\|`~!@#$%^&*()+=\\/]/;
  
  if (formData.maker_name && specialCharRegex.test(formData.maker_name)) {
    errors.push({
      field: 'maker_name',
      message: 'メーカー名に特殊文字は使用できません'
    });
  }

  if (formData.model_name && specialCharRegex.test(formData.model_name)) {
    errors.push({
      field: 'model_name',
      message: 'モデル名に特殊文字は使用できません'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 個別フィールドのバリデーション
 */
export function validateField(field: string, value: any): ValidationError | null {
  switch (field) {
    case 'maker_name':
      if (!value || !value.trim()) {
        return { field, message: 'メーカー名は必須です' };
      }
      if (value.trim().length < 2) {
        return { field, message: 'メーカー名は2文字以上で入力してください' };
      }
      if (value.trim().length > 50) {
        return { field, message: 'メーカー名は50文字以内で入力してください' };
      }
      break;

    case 'model_name':
      if (!value || !value.trim()) {
        return { field, message: 'モデル名は必須です' };
      }
      if (value.trim().length < 2) {
        return { field, message: 'モデル名は2文字以上で入力してください' };
      }
      if (value.trim().length > 50) {
        return { field, message: 'モデル名は50文字以内で入力してください' };
      }
      break;

    case 'start_year':
    case 'end_year':
      const currentYear = new Date().getFullYear();
      const minYear = 1900;
      const maxYear = currentYear + 2;
      
      if (!value || value < minYear || value > maxYear) {
        return { 
          field, 
          message: `${field === 'start_year' ? '開始' : '終了'}年は${minYear}年から${maxYear}年の間で入力してください` 
        };
      }
      break;

    case 'start_month':
    case 'end_month':
      if (!value || value < 1 || value > 12) {
        return { 
          field, 
          message: `${field === 'start_month' ? '開始' : '終了'}月は1月から12月の間で入力してください` 
        };
      }
      break;
  }

  return null;
}

/**
 * リアルタイムバリデーション（入力中）
 */
export function validateFieldRealtime(field: string, value: any): ValidationError | null {
  // リアルタイムバリデーションは基本的なバリデーションのみ
  switch (field) {
    case 'maker_name':
    case 'model_name':
      if (value && value.length > 50) {
        return { field, message: '50文字以内で入力してください' };
      }
      break;

    case 'start_year':
    case 'end_year':
      const currentYear = new Date().getFullYear();
      if (value && (value < 1900 || value > currentYear + 2)) {
        return { field, message: '年式の範囲外です' };
      }
      break;

    case 'start_month':
    case 'end_month':
      if (value && (value < 1 || value > 12)) {
        return { field, message: '月の範囲外です' };
      }
      break;
  }

  return null;
}

/**
 * フォーム全体の状態をチェック
 */
export function getFormStatus(formData: Partial<CarApplicationForm>): {
  isComplete: boolean;
  missingFields: string[];
  hasErrors: boolean;
} {
  const requiredFields: (keyof CarApplicationForm)[] = [
    'maker_name', 'model_name', 'start_year', 'start_month', 'end_year', 'end_month'
  ];

  const missingFields = requiredFields.filter(field => 
    !formData[field] || 
    (typeof formData[field] === 'string' && !formData[field]!.toString().trim())
  );

  const isComplete = missingFields.length === 0;
  
  // 基本的なバリデーションを実行
  const validation = validateCarApplicationForm(formData as CarApplicationForm);
  const hasErrors = validation.errors.length > 0;

  return {
    isComplete,
    missingFields,
    hasErrors
  };
}

/**
 * エラーメッセージをユーザーフレンドリーに変換
 */
export function formatValidationError(error: ValidationError): string {
  const fieldNames: Record<string, string> = {
    maker_name: 'メーカー名',
    model_name: 'モデル名',
    start_year: '開始年',
    start_month: '開始月',
    end_year: '終了年',
    end_month: '終了月',
    year_range: '年式範囲'
  };

  const fieldName = fieldNames[error.field] || error.field;
  return `${fieldName}: ${error.message}`;
}

/**
 * 複数のエラーをまとめて表示用にフォーマット
 */
export function formatValidationErrors(errors: ValidationError[]): string[] {
  return errors.map(formatValidationError);
}
