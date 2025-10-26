import { addDoc, collection, deleteDoc, doc, getDocs, increment, limit, orderBy, query, serverTimestamp, startAfter, updateDoc, where } from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { db } from '../firebase/init';
import { Video } from '../types';

// キャッシュ管理
const videoCache = new Map<string, { data: Video[]; timestamp: number; lastDoc: any }>();
const CACHE_DURATION = 10 * 60 * 1000; // 10分（課金削減のため延長）

interface UseVideosOptions {
  userId?: string; // ユーザーID（オプショナル）
  currentUserId?: string; // 特定ユーザーの動画のみを取得する場合に指定
}

export const useVideos = (options: UseVideosOptions = {}) => {
  const userId = options?.userId;
  const currentUserId = options?.currentUserId;
  const [videos, setVideos] = useState<Video[]>([]);
  const [userVideos, setUserVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  // 最適化された動画取得（課金削減版）
  const fetchVideos = useCallback(async (isInitial = false) => {
    try {
      setLoading(true);
      
      // キャッシュチェック
      const cacheKey = `videos_all_${lastDoc?.id || 'initial'}`;
      const cached = videoCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log('📦 動画キャッシュから取得');
        setVideos(cached.data);
        setLastDoc(cached.lastDoc);
        setLoading(false);
        return;
      }

      console.log('🔍 動画をFirestoreから取得');
      
      const baseQuery = query(
        collection(db, 'videos'),
        orderBy('createdAt', 'desc'),
        limit(15) // 20 → 15に削減（課金削減）
      );

      const paginatedQuery = isInitial 
        ? baseQuery 
        : query(baseQuery, startAfter(lastDoc));

      const snapshot = await getDocs(paginatedQuery);
      const videoList: Video[] = [];
      let lastDocSnapshot = null;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'active') {
          // currentUserIdが指定されている場合、そのユーザーの動画のみを表示
          if (!currentUserId || data.authorId === currentUserId) {
            videoList.push({ id: doc.id, ...data } as Video);
          }
        }
        lastDocSnapshot = doc;
      });

      const result = {
        data: videoList,
        hasMore: snapshot.docs.length === 15,
        lastDoc: lastDocSnapshot
      };

      // キャッシュに保存
      videoCache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now(),
        lastDoc: result.lastDoc
      });

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
  }, [lastDoc, currentUserId]);

  // 初期読み込み
  useEffect(() => {
    fetchVideos(true);
  }, []);

  // ⚠️ リアルタイム更新を削除（課金削減）
  // 必要に応じてユーザーが手動で更新できるようにする

  // ユーザーの動画を取得（最適化版）
  useEffect(() => {
    if (!userId) return;

    const cacheKey = `videos_user_${userId}`;
    const cached = videoCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 ユーザー動画キャッシュから取得');
      setUserVideos(cached.data);
      return;
    }

    const q = query(
      collection(db, 'videos'),
      where('authorId', '==', userId), // Firestoreでフィルタリング（課金削減）
      orderBy('createdAt', 'desc'),
      limit(50) // リミット追加
    );

    getDocs(q).then((snapshot) => {
      const userVideoList: Video[] = [];
      snapshot.forEach((doc) => {
        userVideoList.push({ id: doc.id, ...doc.data() } as Video);
      });
      
      // キャッシュに保存
      videoCache.set(cacheKey, {
        data: userVideoList,
        timestamp: Date.now(),
        lastDoc: null
      });
      
      setUserVideos(userVideoList);
    }).catch((err) => {
      console.error('Error fetching user videos:', err);
      setError(err.message);
    });

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
        channelId: userId,
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
