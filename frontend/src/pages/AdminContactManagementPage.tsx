import { addDoc, collection, getDocs, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { db } from '../firebase/init';

interface ContactInquiry {
  id: string;
  subject: string;
  message: string;
  userName: string;
  userEmail: string;
  userId: string;
  createdAt: Timestamp;
  isRead?: boolean;
}

interface AdminContactManagementPageProps {
  onBackClick: () => void;
}

const AdminContactManagementPage: React.FC<AdminContactManagementPageProps> = ({ onBackClick }) => {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const q = query(collection(db, 'contactInquiries'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const inquiryList: ContactInquiry[] = [];
        snapshot.forEach((doc) => {
          inquiryList.push({
            id: doc.id,
            ...doc.data()
          } as ContactInquiry);
        });
        setInquiries(inquiryList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching inquiries:', error);
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSendReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) {
      alert('返信内容を入力してください');
      return;
    }

    setIsSendingReply(true);
    try {
      // 返信をcontactRepliesコレクションに保存
      await addDoc(collection(db, 'contactReplies'), {
        inquiryId: selectedInquiry.id,
        adminReply: replyMessage,
        createdAt: serverTimestamp(),
        adminId: 'admin', // 管理者ID
        adminName: '管理者'
      });

      // ユーザーに通知を送信
      await addDoc(collection(db, 'notifications'), {
        userId: selectedInquiry.userId,
        type: 'contact_reply',
        title: 'お問い合わせへの返信',
        content: `お問い合わせ「${selectedInquiry.subject}」への返信が届きました`,
        isRead: false,
        createdAt: serverTimestamp(),
        data: {
          inquiryId: selectedInquiry.id,
          subject: selectedInquiry.subject,
          replyMessage: replyMessage
        }
      });

      alert('返信を送信しました');
      setReplyMessage('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('返信の送信に失敗しました');
    } finally {
      setIsSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <header className="flex items-center p-4 border-b border-border">
          <button onClick={onBackClick} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">お問い合わせ管理</h1>
        </header>
        <main className="flex-1 p-4 flex items-center justify-center">
          <div className="text-gray-400">読み込み中...</div>
        </main>
      </div>
    );
  }

  if (selectedInquiry) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <header className="flex items-center p-4 border-b border-border">
          <button onClick={() => setSelectedInquiry(null)} className="mr-4">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">お問い合わせ詳細</h1>
        </header>
        <main className="flex-1 p-4 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-surface rounded-xl p-6 border border-surface-light">
              <div className="flex items-center space-x-3 mb-4">
                <Mail className="text-orange-500" size={24} />
                <div>
                  <h2 className="text-lg font-bold">{selectedInquiry.subject}</h2>
                  <div className="text-sm text-gray-400">
                    {selectedInquiry.userName} ({selectedInquiry.userEmail})
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(selectedInquiry.createdAt)}
                  </div>
                </div>
              </div>
              <div className="bg-surface-light rounded-lg p-4">
                <h3 className="font-semibold mb-2">メッセージ内容</h3>
                <p className="text-sm whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>

              {/* 返信フォーム */}
              <div className="bg-surface-light rounded-lg p-4 mt-4">
                <h3 className="font-semibold mb-3">返信</h3>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="返信内容を入力してください..."
                  className="w-full h-24 p-3 bg-surface border border-surface-light rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isSendingReply}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSendReply}
                    disabled={isSendingReply || !replyMessage.trim()}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-dark transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Send size={16} />
                    <span>{isSendingReply ? '送信中...' : '返信を送信'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <header className="flex items-center p-4 border-b border-border">
        <button onClick={onBackClick} className="mr-4">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold">お問い合わせ管理</h1>
        <div className="ml-auto text-sm text-gray-400">
          全{inquiries.length}件
        </div>
      </header>
      <main className="flex-1 p-4 overflow-y-auto">
        {inquiries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="mx-auto text-gray-400 mb-4" size={48} />
              <div className="text-gray-400">お問い合わせはありません</div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                onClick={() => setSelectedInquiry(inquiry)}
                className="bg-surface rounded-xl p-4 border border-surface-light cursor-pointer hover:bg-surface-light transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <Mail className="text-orange-500 mt-1" size={20} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{inquiry.subject}</h3>
                    <p className="text-sm text-gray-400 truncate mt-1">
                      {inquiry.userName} ({inquiry.userEmail})
                    </p>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDate(inquiry.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminContactManagementPage;
