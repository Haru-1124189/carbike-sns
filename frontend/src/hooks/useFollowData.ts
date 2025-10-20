import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase/init';

interface UserData {
  id: string;
  displayName: string;
  username?: string;
  avatar?: string;
  bio?: string;
}

export const useFollowData = (userId: string) => {
  const [following, setFollowing] = useState<UserData[]>([]);
  const [followers, setFollowers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        // フォロー中のユーザーを取得
        const followingQuery = query(
          collection(db, 'follows'),
          where('followerId', '==', userId)
        );
        const followingSnapshot = await getDocs(followingQuery);
        
        const followingUsers: UserData[] = [];
        for (const followDoc of followingSnapshot.docs) {
          const followingId = followDoc.data().followingId;
          const userDoc = await getDoc(doc(db, 'users', followingId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            followingUsers.push({
              id: userDoc.id,
              displayName: userData.displayName || 'ユーザー',
              username: userData.username,
              avatar: userData.photoURL,
              bio: userData.bio
            });
          }
        }
        setFollowing(followingUsers);

        // フォロワーを取得
        const followersQuery = query(
          collection(db, 'follows'),
          where('followingId', '==', userId)
        );
        const followersSnapshot = await getDocs(followersQuery);
        
        const followersUsers: UserData[] = [];
        for (const followDoc of followersSnapshot.docs) {
          const followerId = followDoc.data().followerId;
          const userDoc = await getDoc(doc(db, 'users', followerId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            followersUsers.push({
              id: userDoc.id,
              displayName: userData.displayName || 'ユーザー',
              username: userData.username,
              avatar: userData.photoURL,
              bio: userData.bio
            });
          }
        }
        setFollowers(followersUsers);

      } catch (err) {
        console.error('Error fetching follow data:', err);
        setError(err instanceof Error ? err.message : 'エラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, [userId]);

  return {
    following,
    followers,
    loading,
    error
  };
};
