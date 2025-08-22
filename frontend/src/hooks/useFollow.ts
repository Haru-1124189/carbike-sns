import { useCallback, useEffect, useState } from 'react';
import {
    followUser,
    getFollowers,
    getFollowing,
    isFollowing,
    unfollowUser
} from '../lib/follows';
import { useAuth } from './useAuth';

export const useFollow = (targetUserId?: string) => {
  const { user } = useAuth();
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フォロー状態をチェック
  const checkFollowStatus = useCallback(async () => {
    if (!user?.uid || !targetUserId || user.uid === targetUserId) {
      setIsFollowingUser(false);
      return;
    }

    try {
      const following = await isFollowing(user.uid, targetUserId);
      setIsFollowingUser(following);
    } catch (error) {
      console.error('Error checking follow status:', error);
      setError('フォロー状態の確認に失敗しました');
    }
  }, [user?.uid, targetUserId]);

  // フォロワー・フォロー中リストを取得
  const fetchFollowData = useCallback(async (userId: string) => {
    try {
      const [followersList, followingList] = await Promise.all([
        getFollowers(userId),
        getFollowing(userId)
      ]);
      
      setFollowers(followersList);
      setFollowing(followingList);
    } catch (error) {
      console.error('Error fetching follow data:', error);
      setError('フォローデータの取得に失敗しました');
    }
  }, []);

  // フォローする
  const handleFollow = useCallback(async () => {
    if (!user?.uid || !targetUserId || loading) return;

    console.log('フォロー操作開始:', { 
      followerId: user.uid, 
      followingId: targetUserId 
    });

    setLoading(true);
    setError(null);

    try {
      await followUser(user.uid, targetUserId);
      setIsFollowingUser(true);
      
      // フォローデータを更新
      await fetchFollowData(targetUserId);
      
      console.log('フォロー成功');
    } catch (error: any) {
      console.error('Error following user:', error);
      setError(error.message || 'フォローに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, targetUserId, loading, fetchFollowData]);

  // アンフォローする
  const handleUnfollow = useCallback(async () => {
    if (!user?.uid || !targetUserId || loading) return;

    setLoading(true);
    setError(null);

    try {
      await unfollowUser(user.uid, targetUserId);
      setIsFollowingUser(false);
      
      // フォローデータを更新
      await fetchFollowData(targetUserId);
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      setError(error.message || 'アンフォローに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, targetUserId, loading, fetchFollowData]);

  // フォロー・アンフォローをトグル
  const toggleFollow = useCallback(async () => {
    if (isFollowingUser) {
      await handleUnfollow();
    } else {
      await handleFollow();
    }
  }, [isFollowingUser, handleFollow, handleUnfollow]);

  // 初回読み込み
  useEffect(() => {
    if (targetUserId) {
      checkFollowStatus();
      fetchFollowData(targetUserId);
    }
  }, [targetUserId, checkFollowStatus, fetchFollowData]);

  return {
    isFollowing: isFollowingUser,
    followers,
    following,
    followersCount: followers.length,
    followingCount: following.length,
    loading,
    error,
    follow: handleFollow,
    unfollow: handleUnfollow,
    toggleFollow,
    refetch: () => {
      if (targetUserId) {
        checkFollowStatus();
        fetchFollowData(targetUserId);
      }
    }
  };
};

// 現在のユーザーのフォローデータを取得
export const useMyFollowData = () => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyFollowData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);

    try {
      const [followersList, followingList] = await Promise.all([
        getFollowers(user.uid),
        getFollowing(user.uid)
      ]);
      
      setFollowers(followersList);
      setFollowing(followingList);
    } catch (error) {
      console.error('Error fetching my follow data:', error);
      setError('フォローデータの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    fetchMyFollowData();
  }, [fetchMyFollowData]);

  return {
    followers,
    following,
    followersCount: followers.length,
    followingCount: following.length,
    loading,
    error,
    refetch: fetchMyFollowData
  };
};
