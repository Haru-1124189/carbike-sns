import { useCallback, useEffect, useState } from 'react';
import {
    approveFollowRequest,
    cancelFollowRequest,
    getFollowRequest,
    getReceivedFollowRequests,
    getSentFollowRequests,
    rejectFollowRequest,
    sendFollowRequest
} from '../lib/followRequests';
import { getUserPrivacySettings } from '../lib/privacy';
import { FollowRequest } from '../types';
import { useAuth } from './useAuth';

export const useFollowRequests = (targetUserId?: string) => {
    const { user } = useAuth();
    const [followRequest, setFollowRequest] = useState<FollowRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // フォロー申請状態をチェック
    const checkFollowRequestStatus = useCallback(async () => {
        if (!user?.uid || !targetUserId || user.uid === targetUserId) {
            setFollowRequest(null);
            return;
        }

        try {
            const request = await getFollowRequest(user.uid, targetUserId);
            setFollowRequest(request);
        } catch (error) {
            console.error('Error checking follow request status:', error);
            setError('フォロー申請状態の確認に失敗しました');
        }
    }, [user?.uid, targetUserId]);

    // フォロー申請を送信
    const sendRequest = useCallback(async (message?: string) => {
        if (!user?.uid || !targetUserId || loading) return;

        setLoading(true);
        setError(null);

        try {
            await sendFollowRequest(user.uid, targetUserId, message);
            await checkFollowRequestStatus(); // 状態を更新
            console.log('フォロー申請送信成功');
        } catch (error: any) {
            console.error('Error sending follow request:', error);
            setError(error.message || 'フォロー申請の送信に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [user?.uid, targetUserId, loading, checkFollowRequestStatus]);

    // フォロー申請をキャンセル
    const cancelRequest = useCallback(async () => {
        if (!followRequest?.id || loading) return;

        setLoading(true);
        setError(null);

        try {
            await cancelFollowRequest(followRequest.id);
            await checkFollowRequestStatus(); // 状態を更新
            console.log('フォロー申請キャンセル成功');
        } catch (error: any) {
            console.error('Error cancelling follow request:', error);
            setError(error.message || 'フォロー申請のキャンセルに失敗しました');
        } finally {
            setLoading(false);
        }
    }, [followRequest?.id, loading, checkFollowRequestStatus]);

    // 初回読み込み
    useEffect(() => {
        if (targetUserId) {
            checkFollowRequestStatus();
        }
    }, [targetUserId, checkFollowRequestStatus]);

    return {
        followRequest,
        loading,
        error,
        sendRequest,
        cancelRequest,
        refetch: checkFollowRequestStatus
    };
};

// 受信したフォロー申請を管理
export const useReceivedFollowRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<FollowRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 受信したフォロー申請を取得
    const fetchRequests = useCallback(async () => {
        if (!user?.uid) return;

        setLoading(true);
        setError(null);

        try {
            const receivedRequests = await getReceivedFollowRequests(user.uid);
            setRequests(receivedRequests);
        } catch (error) {
            console.error('Error fetching received follow requests:', error);
            setError('フォロー申請の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    // フォロー申請を承認
    const approveRequest = useCallback(async (requestId: string) => {
        setLoading(true);
        setError(null);

        try {
            await approveFollowRequest(requestId);
            await fetchRequests(); // リストを更新
            console.log('フォロー申請承認成功');
        } catch (error: any) {
            console.error('Error approving follow request:', error);
            setError(error.message || 'フォロー申請の承認に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [fetchRequests]);

    // フォロー申請を拒否
    const rejectRequest = useCallback(async (requestId: string) => {
        setLoading(true);
        setError(null);

        try {
            await rejectFollowRequest(requestId);
            await fetchRequests(); // リストを更新
            console.log('フォロー申請拒否成功');
        } catch (error: any) {
            console.error('Error rejecting follow request:', error);
            setError(error.message || 'フォロー申請の拒否に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [fetchRequests]);

    // 初回読み込み
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests,
        loading,
        error,
        approveRequest,
        rejectRequest,
        refetch: fetchRequests
    };
};

// 送信したフォロー申請を管理
export const useSentFollowRequests = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<FollowRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 送信したフォロー申請を取得
    const fetchRequests = useCallback(async () => {
        if (!user?.uid) return;

        setLoading(true);
        setError(null);

        try {
            const sentRequests = await getSentFollowRequests(user.uid);
            setRequests(sentRequests);
        } catch (error) {
            console.error('Error fetching sent follow requests:', error);
            setError('フォロー申請の取得に失敗しました');
        } finally {
            setLoading(false);
        }
    }, [user?.uid]);

    // フォロー申請をキャンセル
    const cancelRequest = useCallback(async (requestId: string) => {
        setLoading(true);
        setError(null);

        try {
            await cancelFollowRequest(requestId);
            await fetchRequests(); // リストを更新
            console.log('フォロー申請キャンセル成功');
        } catch (error: any) {
            console.error('Error cancelling follow request:', error);
            setError(error.message || 'フォロー申請のキャンセルに失敗しました');
        } finally {
            setLoading(false);
        }
    }, [fetchRequests]);

    // 初回読み込み
    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests,
        loading,
        error,
        cancelRequest,
        refetch: fetchRequests
    };
};

// 鍵アカウントかどうかをチェック
export const useIsPrivateAccount = (userId?: string) => {
    const [isPrivate, setIsPrivate] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    const checkPrivacy = useCallback(async () => {
        if (!userId) {
            setIsPrivate(false);
            return;
        }

        setLoading(true);
        try {
            const privacy = await getUserPrivacySettings(userId);
            setIsPrivate(privacy);
        } catch (error) {
            console.error('Error checking privacy settings:', error);
            setIsPrivate(false);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        checkPrivacy();
    }, [checkPrivacy]);

    return { isPrivate, loading };
};
