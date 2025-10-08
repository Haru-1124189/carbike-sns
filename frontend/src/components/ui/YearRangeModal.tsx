import React from 'react';

interface YearRangeModalProps {
  isOpen: boolean;
  title?: string;
  yearRanges: string[];
  onClose: () => void;
  onConfirm: (range: string) => void;
}

export const YearRangeModal: React.FC<YearRangeModalProps> = ({ isOpen, title = '年式レンジを選択', yearRanges, onClose, onConfirm }) => {
  const [selected, setSelected] = React.useState<string>('');
  React.useEffect(() => { setSelected(''); }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-surface border border-surface-light rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-surface-light text-white font-bold">{title}</div>
        <div className="p-4 space-y-3">
          {yearRanges.length > 0 ? (
            <select value={selected} onChange={(e)=>setSelected(e.target.value)} className="w-full px-3 py-2 bg-surface-light border border-surface-light rounded-lg text-white">
              <option value="">選択してください</option>
              {yearRanges.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          ) : (
            <div className="text-sm text-gray-400">年式レンジが見つかりません。必要に応じて車種申請をご利用ください。</div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2 bg-surface-light text-white rounded-lg">キャンセル</button>
            <button onClick={()=>selected && onConfirm(selected)} disabled={!selected} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg disabled:opacity-50">決定</button>
          </div>
        </div>
      </div>
    </div>
  );
};


