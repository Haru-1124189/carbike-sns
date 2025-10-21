import { addDoc, collection, deleteDoc, doc, getDocs, increment, limit, onSnapshot, orderBy, query, serverTimestamp, startAfter, updateDoc } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../firebase/init';
import { Video } from '../types';

export const useVideos = (userId?: string) => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  // 最適化された動画取得
  const fetchVideos = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      
      const baseQuery = query(
        collection(db, 'videos'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );

      const paginatedQuery = isInitial 
        ? baseQuery 
        : query(baseQuery, startAfter(lastDoc));

      // executePaginatedQueryの代わりに直接Firestoreクエリを実行
      const snapshot = await getDocs(paginatedQuery);
      const videoList: Video[] = [];
      let lastDocSnapshot = null;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'active') {
          videoList.push({ id: doc.id, ...data } as Video);
        }
        lastDocSnapshot = doc;
      });

      const result = {
        data: videoList,
        hasMore: snapshot.docs.length === 20, // 20件取得した場合はまだデータがある可能性
        lastDoc: lastDocSnapshot
      };

      if (isInitial) {
        setVideos(result.data);
      } else {
        setVideos(prev => [...prev, ...result.data]);
      }

      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching videos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [lastDoc]);

  // 初期読み込み
  useEffect(() => {
    fetchVideos(true);
  }, []);

  // リアルタイム更新（最初の20件のみ）
  useEffect(() => {
    const q = query(
      collection(db, 'videos'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoList: Video[] = [];
      snapshot.forEach((doc) => {
        const videoData = doc.data();
        if (videoData.status === 'active') {
          videoList.push({ id: doc.id, ...videoData } as Video);
        }
      });
      
      // リアルタイム更新は最初の20件のみ
      setVideos(prev => {
        const existingIds = new Set(prev.map(v => v.id));
        const newVideos = videoList.filter(v => !existingIds.has(v.id));
        return [...newVideos, ...prev].slice(0, 20);
      });
    }, (err) => {
      console.error('Error in real-time update:', err);
    });

    return () => unsubscribe();
  }, []);

  // ユーザーの動画を取得
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'videos'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userVideoList: Video[] = [];
      snapshot.forEach((doc) => {
        const videoData = doc.data();
        // クライアントサイドでauthorIdフィルタリング
        if (videoData.authorId === userId) {
          userVideoList.push({ id: doc.id, ...videoData } as Video);
        }
      });
      setUserVideos(userVideoList);
    }, (err) => {
      console.error('Error fetching user videos:', err);
      setError(err.message);
    });

    return () => unsubscribe();
  }, [userId]);

  // 動画をアップロード
  const uploadVideo = async (videoData: any, authorName: string) => {
    if (!userId) {
      throw new Error('ユーザーIDが必要です');
    }

    setLoading(true);
    setError(null);

    try {
      const newVideo = {
        title: videoData.title,
        description: videoData.description,
        thumbnailUrl: videoData.thumbnailUrl,
        videoUrl: videoData.videoUrl,
        duration: videoData.duration,
        tags: videoData.tags || [],
        category: videoData.category,
        visibility: videoData.visibility || 'public',
        ageRestriction: videoData.ageRestriction || false,
        authorId: userId,
        author: authorName,
        channelId: userId, // ユーザーIDをチャンネルIDとして使用
        views: 0,
        likes: 0,
        status: 'active' as const,
        createdAt: serverTimestamp(),
        uploadedAt: new Date().toLocaleDateString('ja-JP'),
      };

      const docRef = await addDoc(collection(db, 'videos'), newVideo);
      return docRef.id;
    } catch (err: any) {
      console.error('Error uploading video:', err);
      setError(err.message);
      throw new Error('動画のアップロードに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 動画を更新
  const updateVideo = async (videoId: string, updates: Partial<Video>) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'videos', videoId);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error('Error updating video:', err);
      setError(err.message);
      throw new Error('動画の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 動画を削除
  const deleteVideo = async (videoId: string) => {
    setLoading(true);
    setError(null);

    try {
      const docRef = doc(db, 'videos', videoId);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.error('Error deleting video:', err);
      setError(err.message);
      throw new Error('動画の削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 動画の視聴回数を増加
  const incrementViews = async (videoId: string) => {
    try {
      const docRef = doc(db, 'videos', videoId);
      await updateDoc(docRef, {
        views: increment(1),
      });
    } catch (err) {
      console.error('Error incrementing views:', err);
    }
  };

  // メモ化された値
  const memoizedVideos = useMemo(() => videos, [videos]);
  const memoizedUserVideos = useMemo(() => userVideos, [userVideos]);

  return {
    videos: memoizedVideos,
    userVideos: memoizedUserVideos,
    loading,
    error,
    hasMore,
    loadMore: () => fetchVideos(false),
    uploadVideo,
    updateVideo,
    deleteVideo,
    incrementViews,
  };
};
