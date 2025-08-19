import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/clients';
import { ReplyDoc } from '../types/reply';

export interface Reply {
  id: string;
  threadId: string;
  author: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export const useReplies = (threadId: string) => {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!threadId) {
      setReplies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'replies'),
      where('threadId', '==', threadId),
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
            id: data.id,
            threadId: data.threadId,
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
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [threadId]);

  return { replies, loading, error };
};
