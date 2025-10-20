import {
    collection,
    doc,
    getDoc,
    getDocs,
    increment,
    query,
    serverTimestamp,
    updateDoc,
    where,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase/init';
import { FollowRequest } from '../types';
import { getFollowRelation } from './follows';
import { createNotificationWithCheck } from './notifications';

// フォロー申請を送信
export const sendFollowRequest = async (
    requesterId: string, 
    targetUserId: string, 
    message?: string
): Promise<void> => {
    console.log('sendFollowRequest called:', { requesterId, targetUserId, message });
    
    if (requesterId === targetUserId) {
        throw new Error('自分自身にフォロー申請することはできません');
    }

    // ユーザーの存在確認
    try {
        const requesterDoc = await getDoc(doc(db, 'users', requesterId));
        const targetDoc = await getDoc(doc(db, 'users', targetUserId));
        
        if (!requesterDoc.exists()) {
            throw new Error(`申請者（${requesterId}）が存在しません`);
        }
        
        if (!targetDoc.exists()) {
            throw new Error(`申請対象（${targetUserId}）が存在しません`);
        }
        
        console.log('ユーザー存在確認完了');
    } catch (error) {
        console.error('ユーザー存在確認エラー:', error);
        throw error;
    }

    // 既にフォローしているかチェック
    const existingFollow = await getFollowRelation(requesterId, targetUserId);
    if (existingFollow) {
        throw new Error('既にフォローしています');
    }

    // 既に申請中かチェック
    const existingRequest = await getFollowRequest(requesterId, targetUserId);
    if (existingRequest) {
        throw new Error('既にフォロー申請を送信しています');
    }

    try {
        // フォロー申請を作成
        const requestRef = doc(collection(db, 'followRequests'));
        await updateDoc(requestRef, {
            requesterId,
            targetUserId,
            status: 'pending',
            message: message || '',
            createdAt: serverTimestamp(),
            respondedAt: null,
            respondedBy: null
        });

        console.log('フォロー申請作成完了');

        // フォロー申請通知を作成
        const requesterData = await getDoc(doc(db, 'users', requesterId));
        const requesterName = requesterData.data()?.displayName || 'ユーザー';
        
        await createNotificationWithCheck(
            {
                userId: targetUserId,
                type: 'follow_request',
                title: 'フォロー申請',
                content: `${requesterName}さんからフォロー申請が届きました`,
                fromUserId: requesterId,
                fromUserName: requesterName,
                data: {
                    requestId: requestRef.id,
                    message: message || ''
                }
            },
            'followRequestNotifications'
        );

        console.log('フォロー申請通知作成完了');
    } catch (error) {
        console.error('Error sending follow request:', error);
        throw new Error(`フォロー申請の送信に失敗しました: ${error}`);
    }
};

// フォロー申請を承認
export const approveFollowRequest = async (requestId: string): Promise<void> => {
    console.log('approveFollowRequest called:', { requestId });
    
    try {
        // 申請データを取得
        const requestRef = doc(db, 'followRequests', requestId);
        const requestDoc = await getDoc(requestRef);
        
        if (!requestDoc.exists()) {
            throw new Error('フォロー申請が見つかりません');
        }
        
        const requestData = requestDoc.data() as FollowRequest;
        
        if (requestData.status !== 'pending') {
            throw new Error('この申請は既に処理されています');
        }

        const batch = writeBatch(db);

        // 申請を承認済みに更新
        batch.update(requestRef, {
            status: 'approved',
            respondedAt: serverTimestamp(),
            respondedBy: requestData.targetUserId
        });

        // フォロー関係を作成
        const followRef = doc(collection(db, 'follows'));
        batch.set(followRef, {
            followerId: requestData.requesterId,
            followingId: requestData.targetUserId,
            createdAt: serverTimestamp()
        });

        // フォロワー数を増加
        const targetUserRef = doc(db, 'users', requestData.targetUserId);
        batch.update(targetUserRef, {
            followersCount: increment(1),
            updatedAt: serverTimestamp()
        });

        // フォロー数を増加
        const requesterUserRef = doc(db, 'users', requestData.requesterId);
        batch.update(requesterUserRef, {
            followingCount: increment(1),
            updatedAt: serverTimestamp()
        });

        await batch.commit();
        console.log('フォロー申請承認完了');

        // 承認通知を作成
        const targetUserData = await getDoc(doc(db, 'users', requestData.targetUserId));
        const targetUserName = targetUserData.data()?.displayName || 'ユーザー';
        
        await createNotificationWithCheck(
            {
                userId: requestData.requesterId,
                type: 'follow_approved',
                title: 'フォロー申請が承認されました',
                content: `${targetUserName}さんがあなたのフォロー申請を承認しました`,
                fromUserId: requestData.targetUserId,
                fromUserName: targetUserName
            },
            'followApprovalNotifications'
        );

        console.log('フォロー承認通知作成完了');
    } catch (error) {
        console.error('Error approving follow request:', error);
        throw new Error(`フォロー申請の承認に失敗しました: ${error}`);
    }
};

// フォロー申請を拒否
export const rejectFollowRequest = async (requestId: string): Promise<void> => {
    console.log('rejectFollowRequest called:', { requestId });
    
    try {
        // 申請データを取得
        const requestRef = doc(db, 'followRequests', requestId);
        const requestDoc = await getDoc(requestRef);
        
        if (!requestDoc.exists()) {
            throw new Error('フォロー申請が見つかりません');
        }
        
        const requestData = requestDoc.data() as FollowRequest;
        
        if (requestData.status !== 'pending') {
            throw new Error('この申請は既に処理されています');
        }

        // 申請を拒否済みに更新
        await updateDoc(requestRef, {
            status: 'rejected',
            respondedAt: serverTimestamp(),
            respondedBy: requestData.targetUserId
        });

        console.log('フォロー申請拒否完了');

        // 拒否通知を作成
        const targetUserData = await getDoc(doc(db, 'users', requestData.targetUserId));
        const targetUserName = targetUserData.data()?.displayName || 'ユーザー';
        
        await createNotificationWithCheck(
            {
                userId: requestData.requesterId,
                type: 'follow_rejected',
                title: 'フォロー申請が拒否されました',
                content: `${targetUserName}さんがあなたのフォロー申請を拒否しました`,
                fromUserId: requestData.targetUserId,
                fromUserName: targetUserName
            },
            'followRejectionNotifications'
        );

        console.log('フォロー拒否通知作成完了');
    } catch (error) {
        console.error('Error rejecting follow request:', error);
        throw new Error(`フォロー申請の拒否に失敗しました: ${error}`);
    }
};

// フォロー申請を取得
export const getFollowRequest = async (
    requesterId: string, 
    targetUserId: string
): Promise<FollowRequest | null> => {
    try {
        const q = query(
            collection(db, 'followRequests'),
            where('requesterId', '==', requesterId),
            where('targetUserId', '==', targetUserId)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }
        
        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        } as FollowRequest;
    } catch (error) {
        console.error('Error getting follow request:', error);
        return null;
    }
};

// ユーザーのフォロー申請一覧を取得（受信）
export const getReceivedFollowRequests = async (userId: string): Promise<FollowRequest[]> => {
    try {
        const q = query(
            collection(db, 'followRequests'),
            where('targetUserId', '==', userId),
            where('status', '==', 'pending')
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FollowRequest[];
    } catch (error) {
        console.error('Error getting received follow requests:', error);
        return [];
    }
};

// ユーザーのフォロー申請一覧を取得（送信）
export const getSentFollowRequests = async (userId: string): Promise<FollowRequest[]> => {
    try {
        const q = query(
            collection(db, 'followRequests'),
            where('requesterId', '==', userId)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FollowRequest[];
    } catch (error) {
        console.error('Error getting sent follow requests:', error);
        return [];
    }
};

// フォロー申請をキャンセル
export const cancelFollowRequest = async (requestId: string): Promise<void> => {
    try {
        const requestRef = doc(db, 'followRequests', requestId);
        await updateDoc(requestRef, {
            status: 'rejected', // キャンセルは拒否扱い
            respondedAt: serverTimestamp(),
            respondedBy: 'cancelled'
        });
        
        console.log('フォロー申請キャンセル完了');
    } catch (error) {
        console.error('Error cancelling follow request:', error);
        throw new Error('フォロー申請のキャンセルに失敗しました');
    }
};
