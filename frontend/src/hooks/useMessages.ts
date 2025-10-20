import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import { useState } from 'react';
import { db } from '../firebase/init';
import { MarketplaceConversation, MarketplaceMessage } from '../types/marketplace';

// メッセージ機能のフック
export const useMessages = () => {
  const [conversations, setConversations] = useState<MarketplaceConversation[]>([]);
  const [messages, setMessages] = useState<MarketplaceMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 会話一覧を取得
  const loadConversations = async (userId: string) => {
    try {
      setLoading(true);
      console.log('💬 会話一覧取得開始:', { userId, timestamp: new Date().toISOString() });

      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc')
      );

      const conversationsSnapshot = await getDocs(conversationsQuery);
      const conversationsData = conversationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MarketplaceConversation[];

      console.log('✅ 会話一覧取得完了:', {
        count: conversationsData.length,
        conversations: conversationsData.map(c => ({
          id: c.id,
          participants: c.participants,
          itemId: c.itemId
        })),
        timestamp: new Date().toISOString()
      });

      setConversations(conversationsData);
    } catch (error) {
      console.error('❌ 会話一覧取得エラー:', error);
      setError('会話一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 特定の会話のメッセージを取得
  const loadMessages = async (conversationId: string, currentUserId?: string) => {
    try {
      setLoading(true);
      console.log('💬 メッセージ購読開始:', { conversationId, timestamp: new Date().toISOString() });

      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', conversationId),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snap: any) => {
        const messagesData = snap.docs.map((d: any) => ({ id: d.id, ...d.data() })) as MarketplaceMessage[];
        setMessages(messagesData);

        // 新着通知（相手からの最新メッセージのみ）
        const last = messagesData[messagesData.length - 1];
        if (last && currentUserId && last.senderId !== currentUserId) {
          if (Notification && Notification.permission === 'granted') {
            new Notification('新着メッセージ', { body: last.content.substring(0, 60) });
          }
        }
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ メッセージ購読エラー:', error);
      setError('メッセージの取得に失敗しました');
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  // 通知許可のリクエスト
  const requestNotificationPermission = async () => {
    try {
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    } catch (e) {
      console.warn('通知許可のリクエストに失敗:', e);
    }
  };

  // メッセージを送信
  const sendMessage = async (
    conversationId: string,
    senderId: string,
    receiverId: string,
    content: string,
    itemId?: string
  ) => {
    try {
      console.log('📤 メッセージ送信開始:', {
        conversationId,
        senderId,
        receiverId,
        content: content.substring(0, 50) + '...',
        itemId,
        timestamp: new Date().toISOString()
      });

      // メッセージを作成
      const messageData = {
        conversationId,
        senderId,
        receiverId,
        content,
        type: 'text' as const,
        timestamp: serverTimestamp(),
        read: false,
        itemId
      };

      const messageRef = await addDoc(collection(db, 'messages'), messageData);

      // 会話の最終メッセージ情報を更新
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: {
          id: messageRef.id,
          ...messageData
        },
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${receiverId}`]: serverTimestamp(), // 受信者の未読数を増加
        updatedAt: serverTimestamp()
      });

      console.log('✅ メッセージ送信完了:', {
        messageId: messageRef.id,
        conversationId,
        timestamp: new Date().toISOString()
      });

      return messageRef.id;
    } catch (error) {
      console.error('❌ メッセージ送信エラー:', error);
      setError('メッセージの送信に失敗しました');
      return null;
    }
  };

  // 会話を作成または取得
  const getOrCreateConversation = async (
    itemId: string,
    buyerId: string,
    sellerId: string
  ) => {
    try {
      console.log('💬 会話作成/取得開始:', {
        itemId,
        buyerId,
        sellerId,
        timestamp: new Date().toISOString()
      });

      // 既存の会話を検索
      const existingConversationsQuery = query(
        collection(db, 'conversations'),
        where('itemId', '==', itemId),
        where('participants', 'array-contains', buyerId)
      );

      const existingSnapshot = await getDocs(existingConversationsQuery);
      
      if (!existingSnapshot.empty) {
        const existingConversation = existingSnapshot.docs[0];
        console.log('✅ 既存会話を取得:', {
          conversationId: existingConversation.id,
          timestamp: new Date().toISOString()
        });
        return existingConversation.id;
      }

      // 新しい会話を作成
      const conversationData = {
        participants: [buyerId, sellerId],
        itemId,
        lastMessageAt: serverTimestamp(),
        unreadCount: {
          [buyerId]: 0,
          [sellerId]: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const conversationRef = await addDoc(collection(db, 'conversations'), conversationData);

      console.log('✅ 新規会話作成完了:', {
        conversationId: conversationRef.id,
        timestamp: new Date().toISOString()
      });

      return conversationRef.id;
    } catch (error) {
      console.error('❌ 会話作成/取得エラー:', error);
      setError('会話の作成に失敗しました');
      return null;
    }
  };

  // メッセージを既読にする
  const markAsRead = async (conversationId: string, userId: string) => {
    try {
      console.log('👁️ メッセージ既読処理開始:', {
        conversationId,
        userId,
        timestamp: new Date().toISOString()
      });

      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${userId}`]: 0,
        updatedAt: serverTimestamp()
      });

      console.log('✅ メッセージ既読処理完了:', {
        conversationId,
        userId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ メッセージ既読処理エラー:', error);
    }
  };

  return {
    conversations,
    messages,
    loading,
    error,
    loadConversations,
    loadMessages,
    sendMessage,
    getOrCreateConversation,
    markAsRead,
    requestNotificationPermission
  };
};
