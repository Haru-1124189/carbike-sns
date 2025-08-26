import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/clients';
import { ReplyDoc } from '../types/reply';

export interface Reply {
  id: string;
  targetId: string;
  targetType: 'thread' | 'question' | 'maintenance';
  author: string;
  authorId?: string; // 投稿者のUID
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isPinned?: boolean;
  pinnedAt?: string;
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
            authorId: data.authorId, // 投稿者のUIDを追加
            authorAvatar: data.authorAvatar,
            content: data.content,
            createdAt: createdAt,
            isPinned: data.isPinned,
            pinnedAt: data.pinnedAt instanceof Timestamp 
              ? data.pinnedAt.toDate().toISOString()
              : data.pinnedAt,
          };
        });

        // 固定された返信を最初に表示し、その後は作成日時順
        const sortedReplies = replyData.sort((a, b) => {
          // 固定された返信を最初に
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          
          // 両方とも固定されている場合は固定日時順
          if (a.isPinned && b.isPinned) {
            const pinnedAtA = a.pinnedAt ? new Date(a.pinnedAt).getTime() : 0;
            const pinnedAtB = b.pinnedAt ? new Date(b.pinnedAt).getTime() : 0;
            return pinnedAtB - pinnedAtA; // 新しい固定を上に
          }
          
          // 固定されていない場合は作成日時順
          const createdAtA = new Date(a.createdAt).getTime();
          const createdAtB = new Date(b.createdAt).getTime();
          return createdAtA - createdAtB; // 古い順
        });

        setReplies(sortedReplies);
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
