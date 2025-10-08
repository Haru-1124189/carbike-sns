import { ArrowLeft, Send } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { AppHeader } from '../components/ui/AppHeader';
import { useAuth } from '../hooks/useAuth';
import { useTouringChatMessages } from '../hooks/useTouringChatMessages';
import { sendTouringChatMessage } from '../lib/touring';
import { TouringThread } from '../types';

interface TouringChatRoomPageProps {
  thread: TouringThread;
  onBackClick: () => void;
}

export const TouringChatRoomPage: React.FC<TouringChatRoomPageProps> = ({
  thread,
  onBackClick
}) => {
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, userDoc } = useAuth();
  
  // チャットメッセージを取得
  const { messages, loading, error } = useTouringChatMessages(thread.chatRoomId || null);

  // メッセージが更新されたら自動でスクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim() || !user?.uid || !thread.chatRoomId) {
      return;
    }

    setIsSending(true);
    try {
      const displayName = userDoc?.displayName || user.displayName || 'ユーザー';
      const photoURL = userDoc?.photoURL || user.photoURL || null;

      await sendTouringChatMessage(
        thread.chatRoomId,
        user.uid,
        displayName,
        photoURL,
        messageContent.trim()
      );

      setMessageContent('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('メッセージの送信に失敗しました');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '今';
    if (diffInMinutes < 60) return `${diffInMinutes}分前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}時間前`;
    
    return date.toLocaleDateString('ja-JP');
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <main className="flex flex-col h-screen pt-16">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-surface-light">
          <button
            onClick={onBackClick}
            className="flex items-center space-x-2 text-white hover:text-primary transition-colors"
          >
            <ArrowLeft size={20} />
            <span>戻る</span>
          </button>
          
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-white">{thread.description}</h1>
            <p className="text-sm text-gray-400">{thread.prefecture} {thread.location}</p>
          </div>
        </div>

        {/* メッセージ一覧 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-400">メッセージを読み込み中...</div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-sm text-red-400">エラー: {error}</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-400">まだメッセージがありません</div>
              <div className="text-xs text-gray-500 mt-1">最初のメッセージを送信してみましょう！</div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-end ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'} space-x-2`}
              >
                {message.senderId === user?.uid && (
                  <div className="text-[0.65rem] text-gray-500 mb-1">
                    {formatTime(message.createdAt)}
                  </div>
                )}
                <div
                  className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === user?.uid
                      ? 'bg-primary text-white'
                      : 'bg-surface-light text-white'
                  }`}
                >
                  {message.senderId !== user?.uid && (
                    <div className="text-xs text-gray-400 mb-1">
                      {message.senderName}
                    </div>
                  )}
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
                {message.senderId !== user?.uid && (
                  <div className="text-[0.65rem] text-gray-500 mb-1">
                    {formatTime(message.createdAt)}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* メッセージ入力 */}
        <div className="border-t border-surface-light p-4 pb-24">
          <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1 bg-surface-light text-white placeholder-gray-400 border-none outline-none px-4 py-2 rounded-lg"
              disabled={isSending}
            />
            <button
              type="submit"
              disabled={!messageContent.trim() || isSending}
              className="bg-primary text-white p-2 rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};
