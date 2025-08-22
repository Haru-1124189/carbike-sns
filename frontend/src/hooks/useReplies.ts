import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/clients';
import { ReplyDoc } from '../types/reply';

export interface Reply {
  id: string;
  targetId: string;
  targetType: 'thread' | 'question' | 'maintenance';
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export const useReplies = (targetId: string, targetType: 'thread' | 'question' | 'maintenance') => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetId) {
      setReplies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'replies'),
        where('targetId', '==', targetId),
        where('targetType', '==', targetType),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'asc')
      );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const replyData: Reply[] = snapshot.docs.map((doc) => {
          const data = doc.data() as ReplyDoc;
          
          // Firestore Timestampを文字列に変換
          const createdAt = data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate().toISOString()
            : data.createdAt;

          return {
            id: doc.id, // ドキュメントのIDを使用
            targetId: data.targetId,
            targetType: data.targetType,
            author: data.authorName,
            authorAvatar: data.authorAvatar,
            content: data.content,
            createdAt: createdAt,
          };
        });

        setReplies(replyData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching replies:', err);
        console.error('Error code:', err.code);
        console.error('Error details:', err);
        setError(err.message);
        setLoading(false);
      }
    );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up query:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, [targetId, targetType]);

  return { replies, loading, error };
};
