import { useEffect, useState } from 'react';
import { getThreadById } from '../lib/threads';
import { ThreadDoc } from '../types';

export const useQuestion = (questionId: string) => {
  const [question, setQuestion] = useState<ThreadDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const questionData = await getThreadById(questionId);
        
        if (questionData && questionData.type === 'question') {
          setQuestion(questionData);
        } else {
          setError('質問が見つかりませんでした');
        }
      } catch (err: any) {
        console.error('Error fetching question:', err);
        setError(err.message || '質問の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    if (questionId) {
      fetchQuestion();
    }
  }, [questionId]);

  return { question, loading, error };
};
