import { arrayRemove, arrayUnion, doc, getDoc, updateDoc } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { db } from '../firebase/clients';
import { useAuth } from '../hooks/useAuth';
import { validateMuteWord } from '../utils/muteWords';

interface MutedWordsPageProps {
  onBackClick?: () => void;
}

export const MutedWordsPage: React.FC<MutedWordsPageProps> = ({ onBackClick }) => {
  const { user } = useAuth();
  const [words, setWords] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Firestoreからミュートワードを読み込み
  useEffect(() => {
    const loadMutedWords = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setWords(userData.mutedWords || []);
        }
      } catch (error) {
        console.error('Error loading muted words:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMutedWords();
  }, [user?.uid]);

  const addWord = async () => {
    const word = input.trim();
    if (!word || !user?.uid) return;

    // バリデーション
    const validation = validateMuteWord(word);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // 重複チェック
    if (words.includes(word)) {
      alert('このキーワードは既に登録されています');
      return;
    }

    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        mutedWords: arrayUnion(word)
      });
      
      setWords(prev => [...prev, word]);
      setInput('');
      console.log('Muted word added:', word);
    } catch (error) {
      console.error('Error adding muted word:', error);
      alert('キーワードの追加に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const removeWord = async (word: string) => {
    if (!user?.uid) return;

    setSaving(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        mutedWords: arrayRemove(word)
      });
      
      setWords(prev => prev.filter(w => w !== word));
      console.log('Muted word removed:', word);
    } catch (error) {
      console.error('Error removing muted word:', error);
      alert('キーワードの削除に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background container-mobile">
      <AppHeader onNotificationClick={() => {}} onProfileClick={() => {}} />
              <main className="p-4 pb-24">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={onBackClick} className="p-2 rounded-xl bg-surface border border-surface-light hover:scale-95 active:scale-95 transition-transform shadow-sm">
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">ミュートワード</h1>
        </div>
        <div className="bg-surface rounded-xl border border-surface-light p-4 shadow-sm mb-4">
          <label className="block text-xs text-gray-400 mb-1">キーワードを追加</label>
          <div className="flex space-x-2">
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && addWord()}
              disabled={saving}
              className="flex-1 bg-transparent border border-surface-light rounded-lg p-2 text-sm text-white focus:outline-none focus:border-primary disabled:opacity-50" 
              placeholder="例: ネガティブ" 
            />
            <button 
              onClick={addWord} 
              disabled={saving || !input.trim()}
              className="px-3 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/80 transition-colors"
            >
              {saving ? '追加中...' : '追加'}
            </button>
          </div>
        </div>

        {/* ローディング状態 */}
        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-400">ミュートワードを読み込み中...</div>
          </div>
        )}

        {/* ミュートワードリスト */}
        {!loading && (
          <div className="space-y-2">
            {words.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">登録されたミュートワードはありません</div>
                <div className="text-xs text-gray-500">
                  キーワードを追加すると、そのキーワードを含む投稿が非表示になります
                </div>
              </div>
            ) : (
              words.map(w => (
                <div key={w} className="flex items-center justify-between bg-surface rounded-xl border border-surface-light p-3 shadow-sm">
                  <span className="text-sm text-white">{w}</span>
                  <button 
                    onClick={() => removeWord(w)} 
                    disabled={saving}
                    className="text-xs text-gray-300 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    削除
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};


