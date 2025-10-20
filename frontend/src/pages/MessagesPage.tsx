import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMessages } from '../hooks/useMessages';

interface MessagesPageProps {
  onBack?: () => void;
  onBackClick?: () => void;
  conversationId?: string;
  itemId?: string;
  sellerId?: string;
}

export const MessagesPage: React.FC<MessagesPageProps> = ({
  onBack,
  onBackClick,
  conversationId: propConversationId,
  itemId,
  sellerId
}) => {
  const { user } = useAuth();
  // useUserNameフックは引数が必要なので、直接使用せずにユーザー名を取得する関数を作成
  const getUserNameById = (userId: string) => {
    // 一時的な実装 - 実際のユーザー名取得は後で実装
    return `ユーザー${userId.slice(-4)}`;
  };
  const {
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
  } = useMessages();

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(propConversationId || null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // 会話一覧を読み込み
  useEffect(() => {
    if (user?.uid) {
      loadConversations(user.uid);
    }
  }, [user?.uid, loadConversations]);

  // 特定の会話のメッセージを読み込み
  useEffect(() => {
    if (currentConversationId) {
      loadMessages(currentConversationId, user?.uid);
      if (user?.uid) {
        markAsRead(currentConversationId, user.uid);
      }
    }
  }, [currentConversationId, loadMessages, markAsRead, user?.uid]);

  // 通知許可
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // 商品詳細ページから直接メッセージを開始する場合
  useEffect(() => {
    const initializeConversation = async () => {
      if (itemId && sellerId && user?.uid && !currentConversationId) {
        const conversationId = await getOrCreateConversation(itemId, user.uid, sellerId);
        if (conversationId) {
          setCurrentConversationId(conversationId);
        }
      }
    };

    initializeConversation();
  }, [itemId, sellerId, user?.uid, currentConversationId, getOrCreateConversation]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversationId || !user?.uid) return;

    try {
      setSending(true);
      
      // 現在の会話から受信者IDを取得
      const currentConversation = conversations.find(c => c.id === currentConversationId);
      if (!currentConversation) return;

      const receiverId = currentConversation.participants.find(p => p !== user.uid);
      if (!receiverId) return;

      const messageId = await sendMessage(
        currentConversationId,
        user.uid,
        receiverId,
        newMessage.trim(),
        itemId
      );

      if (messageId) {
        setNewMessage('');
        console.log('✅ メッセージ送信成功:', { messageId });
      }
    } catch (error) {
      console.error('❌ メッセージ送信エラー:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}時間前`;
    
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // 会話一覧表示
  if (!currentConversationId) {
    return (
      <div className="min-h-screen bg-background">
        {/* ヘッダー */}
        <div className="bg-background border-b border-border px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack || onBackClick}
              className="p-2 hover:bg-surface-light rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
            <h1 className="text-lg font-semibold text-text-primary">メッセージ</h1>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-text-secondary">読み込み中...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500">{error}</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle size={48} className="mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary">メッセージがありません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setCurrentConversationId(conversation.id)}
                  className="bg-surface border border-border rounded-lg p-4 hover:bg-surface-light transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                         <h3 className="font-medium text-text-primary">
                           {getUserNameById(conversation.participants.find(p => p !== user?.uid) || '')}
                         </h3>
                        {conversation.unreadCount[user?.uid || ''] > 0 && (
                          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {conversation.unreadCount[user?.uid || '']}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary mt-1">
                        {conversation.lastMessage?.content || 'メッセージがありません'}
                      </p>
                    </div>
                    <div className="text-xs text-text-secondary">
                      {formatTime(conversation.lastMessageAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // メッセージ画面表示
  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const otherParticipantId = currentConversation?.participants.find(p => p !== user?.uid);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ヘッダー */}
      <div className="bg-background border-b border-border px-4 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentConversationId(null)}
            className="p-2 hover:bg-surface-light rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <div className="flex-1">
             <h1 className="text-lg font-semibold text-text-primary">
               {getUserNameById(otherParticipantId || '')}
             </h1>
            <p className="text-sm text-text-secondary">オンライン</p>
          </div>
        </div>
      </div>

      {/* メッセージ一覧 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="text-text-secondary">メッセージを読み込み中...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-500">{error}</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={48} className="mx-auto text-text-secondary mb-4" />
            <p className="text-text-secondary">メッセージを送信して会話を始めましょう</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user?.uid
                    ? 'bg-primary text-white'
                    : 'bg-surface border border-border text-text-primary'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === user?.uid ? 'text-blue-100' : 'text-text-secondary'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* メッセージ入力 */}
      <div className="bg-background border-t border-border p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="メッセージを入力..."
            className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-text-primary focus:outline-none focus:border-primary"
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-primary text-white p-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
