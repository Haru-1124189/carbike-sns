import React from 'react';

interface YearRange {
  id: string;
  start_year: number;
  start_month: number;
  end_year: number;
  end_month: number;
}

interface YearRangeSelectorProps {
  yearRanges: YearRange[];
  onSelect: (yearRangeId: string, yearRange: YearRange) => void;
  onCancel: () => void;
}

export const YearRangeSelector: React.FC<YearRangeSelectorProps> = ({
  yearRanges,
  onSelect,
  onCancel
}) => {
  const formatYearRange = (range: YearRange) => {
    const formatMonth = (month: number) => {
      if (month === 0) return '';
      return `.${month}`;
    };
    
    const startStr = `${range.start_year}${formatMonth(range.start_month)}`;
    const endStr = `${range.end_year}${formatMonth(range.end_month)}`;
    
    return `${startStr}-${endStr}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface-dark border border-surface-light rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-white mb-4">
          年式レンジを選択
        </h3>
        
        <div className="space-y-2 mb-6">
          {yearRanges.map((range) => (
            <button
              key={range.id}
              onClick={() => onSelect(range.id, range)}
              className="w-full text-left p-3 bg-surface-light hover:bg-surface-light/80 rounded-lg transition-colors"
            >
              <div className="text-white font-medium">
                {formatYearRange(range)}
              </div>
            </button>
          ))}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  );
};
