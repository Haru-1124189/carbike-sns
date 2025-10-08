import React, { useEffect, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';

export const AdminAliasEditorPage: React.FC = () => {
  const [makerMap, setMakerMap] = useState<Record<string,string>>({});
  const [modelMap, setModelMap] = useState<Record<string,string>>({});
  const [key, setKey] = useState('');
  const [val, setVal] = useState('');
  const [target, setTarget] = useState<'maker'|'model'>('maker');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('aliasOverrides');
      if (raw) {
        const parsed = JSON.parse(raw);
        setMakerMap(parsed.maker || {});
        setModelMap(parsed.model || {});
      }
    } catch {}
  }, []);

  const save = () => {
    const data = { maker: makerMap, model: modelMap };
    localStorage.setItem('aliasOverrides', JSON.stringify(data));
    alert('保存しました');
  };

  const add = () => {
    if (!key || !val) return;
    if (target === 'maker') setMakerMap({ ...makerMap, [key]: val });
    else setModelMap({ ...modelMap, [key]: val });
    setKey(''); setVal('');
  };

  const remove = (t: 'maker'|'model', k: string) => {
    if (t === 'maker') {
      const m = { ...makerMap }; delete m[k]; setMakerMap(m);
    } else {
      const m = { ...modelMap }; delete m[k]; setModelMap(m);
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader />
      <main className="p-4 pb-24">
        <h1 className="text-lg font-bold text-white mb-4">別名辞書 編集</h1>
        <div className="bg-surface border border-surface-light rounded-xl p-4 mb-6">
          <div className="flex gap-2 mb-3">
            <select value={target} onChange={(e)=>setTarget(e.target.value as any)} className="px-2 py-2 bg-surface-light border border-surface-light rounded text-white">
              <option value="maker">メーカー</option>
              <option value="model">モデル</option>
            </select>
            <input value={key} onChange={(e)=>setKey(e.target.value)} placeholder="別名（キー）" className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded text-white" />
            <input value={val} onChange={(e)=>setVal(e.target.value)} placeholder="正規名（値）" className="flex-1 px-3 py-2 bg-surface-light border border-surface-light rounded text-white" />
            <button onClick={add} className="px-3 py-2 bg-primary text-white rounded">追加</button>
            <button onClick={save} className="px-3 py-2 bg-primary/70 text-white rounded">保存</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm text-gray-300 mb-2">メーカー</h2>
              {Object.entries(makerMap).map(([k,v]) => (
                <div key={k} className="flex items-center justify-between bg-surface-light rounded px-3 py-2 mb-2">
                  <span className="text-sm text-white">{k} → {v}</span>
                  <button onClick={()=>remove('maker', k)} className="text-red-400 text-sm">削除</button>
                </div>
              ))}
            </div>
            <div>
              <h2 className="text-sm text-gray-300 mb-2">モデル</h2>
              {Object.entries(modelMap).map(([k,v]) => (
                <div key={k} className="flex items-center justify-between bg-surface-light rounded px-3 py-2 mb-2">
                  <span className="text-sm text-white">{k} → {v}</span>
                  <button onClick={()=>remove('model', k)} className="text-red-400 text-sm">削除</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};


