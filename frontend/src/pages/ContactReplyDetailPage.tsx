import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { ArrowLeft, Clock, MessageSquare, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/init';

interface ContactReplyDetailPageProps {
  inquiryId: string;
  onBack: () => void;
}

interface ContactInquiry {
  id: string;
  subject: string;
  message: string;
  userEmail?: string;
  userName?: string;
  createdAt: any;
  isRead: boolean;
  replies?: ContactReply[];
}

interface ContactReply {
  id: string;
  inquiryId: string;
  message: string;
  adminId: string;
  adminName: string;
  createdAt: any;
}

const ContactReplyDetailPage: React.FC<ContactReplyDetailPageProps> = ({
  inquiryId,
  onBack
}) => {
  const [inquiry, setInquiry] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        setLoading(true);
        
        // お問い合わせ詳細を取得
        const inquiryRef = doc(db, 'contactInquiries', inquiryId);
        const inquirySnap = await getDoc(inquiryRef);
        
        if (!inquirySnap.exists()) {
          setError('お問い合わせが見つかりません');
          return;
        }
        
        const inquiryData = inquirySnap.data();
        
        // 返信一覧を取得（contactRepliesコレクションから該当するinquiryIdの返信を検索）
        console.log('Fetching replies for inquiryId:', inquiryId);
        const repliesQuery = query(
          collection(db, 'contactReplies'),
          where('inquiryId', '==', inquiryId)
        );
        const repliesSnapshot = await getDocs(repliesQuery);
        
        console.log('Replies snapshot size:', repliesSnapshot.size);
        
        let replies: ContactReply[] = [];
        repliesSnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Reply data:', data);
          replies.push({
            id: doc.id,
            inquiryId: data.inquiryId,
            message: data.adminReply || data.message || '',
            adminId: data.adminId || 'admin',
            adminName: data.adminName || '管理者',
            createdAt: data.createdAt
          });
        });
        
        console.log('Processed replies:', replies);
        
        // 作成日時順でソート
        replies.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
          return dateA.getTime() - dateB.getTime();
        });
        
        setInquiry({
          id: inquirySnap.id,
          ...inquiryData,
          replies
        } as ContactInquiry);
        
      } catch (error) {
        console.error('Error fetching inquiry:', error);
        setError('お問い合わせの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [inquiryId]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '不明';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 hover:bg-surface-light rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">お問い合わせ返信</h1>
          </div>
          
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-surface-light border-t-primary"></div>
            <span className="ml-4 text-text-secondary text-lg">読み込み中...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 hover:bg-surface-light rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">お問い合わせ返信</h1>
          </div>
          
          <div className="text-center py-16">
            <MessageSquare size={64} className="mx-auto mb-6 text-red-400" />
            <h3 className="text-xl font-semibold text-text-primary mb-3">エラーが発生しました</h3>
            <p className="text-text-secondary mb-8 text-lg">{error}</p>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4 mb-8">
            <button
              onClick={onBack}
              className="p-2 hover:bg-surface-light rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-text-primary" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary">お問い合わせ返信</h1>
          </div>
          
          <div className="text-center py-16">
            <MessageSquare size={64} className="mx-auto mb-6 text-text-secondary opacity-40" />
            <p className="text-xl font-semibold text-text-primary">お問い合わせが見つかりません</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-surface-light rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">お問い合わせ返信</h1>
        </div>

        <div className="space-y-12">
          {/* お問い合わせ内容セクション */}
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-6">お問い合わせ内容</h2>
            
            <div className="space-y-6">
              <div>
                <div className="text-sm text-text-secondary mb-3 font-medium">件名</div>
                <p className="text-text-primary text-lg">{inquiry.subject}</p>
              </div>
              
              <div>
                <div className="text-sm text-text-secondary mb-4 font-medium">内容</div>
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed text-base">{inquiry.message}</p>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-text-secondary pt-4">
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>{formatDate(inquiry.createdAt)}</span>
                </div>
                {inquiry.userName && (
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span>{inquiry.userName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 管理者からの返信セクション */}
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-6">管理者からの返信</h2>
            
            {inquiry.replies && inquiry.replies.length > 0 ? (
              <div className="space-y-8">
                {inquiry.replies.map((reply, index) => (
                  <div key={reply.id || index}>
                    <p className="text-text-primary whitespace-pre-wrap leading-relaxed text-base">{reply.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageSquare size={64} className="mx-auto mb-6 text-text-secondary opacity-40" />
                <p className="text-text-primary text-lg font-medium mb-2">返信はまだありません</p>
                <p className="text-text-secondary">
                  管理者からの返信をお待ちください
                </p>
              </div>
            )}
          </div>

          {/* 新しいお問い合わせボタン */}
          <div className="pt-8">
            <button
              onClick={() => {
                window.location.href = '/contact';
              }}
              className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors"
            >
              新しいお問い合わせを送る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactReplyDetailPage;
