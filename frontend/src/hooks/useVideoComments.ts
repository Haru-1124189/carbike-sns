import { addDoc, collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';

export interface VideoComment {
  id: string;
  videoId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  createdAt: Date;
}

export const useVideoComments = (videoId: string) => {
  const [comments, setComments] = useState<VideoComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId) {
      setComments([]);
      setLoading(false);
      return;
    }

    const commentsQuery = query(
      collection(db, 'videoComments'),
      where('videoId', '==', videoId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as VideoComment[];

      setComments(commentsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [videoId]);

  const addComment = async (content: string, userId: string, userDisplayName: string, userPhotoURL?: string) => {
    if (!videoId || !content.trim()) return;

    try {
      await addDoc(collection(db, 'videoComments'), {
        videoId,
        userId,
        userDisplayName,
        userPhotoURL,
        content: content.trim(),
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error adding video comment:', error);
      throw error;
    }
  };

  return { comments, loading, addComment };
};
