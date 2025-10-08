import { useEffect, useState } from 'react';
import { subscribeTouringChatMessages } from '../lib/touring';
import { TouringChatMessage } from '../types';

export const useTouringChatMessages = (chatRoomId: string | null) => {
  const [messages, setMessages] = useState<TouringChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('useTouringChatMessages useEffect called with chatRoomId:', chatRoomId);

    if (!chatRoomId) {
      console.log('No chatRoomId provided, clearing messages');
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeTouringChatMessages(chatRoomId, (fetchedMessages) => {
      console.log('useTouringChatMessages callback received messages:', fetchedMessages);
      setMessages(fetchedMessages);
      setLoading(false);
      setError(null);
    }, (error) => {
      console.error('useTouringChatMessages error:', error);
      setError(error.message || 'メッセージの取得に失敗しました');
      setLoading(false);
    });

    return () => {
      console.log('useTouringChatMessages cleanup');
      unsubscribe();
    };
  }, [chatRoomId]);

  const refreshMessages = async () => {
    console.log('Touring chat messages refreshed');
  };

  return {
    messages,
    loading,
    error,
    refreshMessages
  };
};
