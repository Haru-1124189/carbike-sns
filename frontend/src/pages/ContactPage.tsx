import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';
import { checkAdminNotifications, checkAdminUsers } from '../debug/adminCheck';
import { db } from '../firebase/init';
import { useAuth } from '../hooks/useAuth';
import { notifyAdmins } from '../lib/adminNotifications';

interface ContactPageProps {
  onBackClick?: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onBackClick }) => {
  const { user, userDoc } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      alert('件名と内容を入力してください');
      return;
    }

    if (!user) {
      alert('ログインが必要です');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // デバッグ: 管理者ユーザーをチェック
      console.log('=== デバッグ: 管理者ユーザーチェック ===');
      await checkAdminUsers();
      
      // お問い合わせデータを作成
      const contactData: any = {
        subject: subject.trim(),
        message: message.trim(),
        userId: user.uid,
        userName: userDoc?.displayName || user.displayName || '名無し',
        userEmail: user.email || '',
        status: 'new', // new, in_progress, resolved
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        priority: 'normal', // low, normal, high, urgent
        type: 'general', // general, bug_report, feature_request, account_issue
        adminNotes: '',
        resolvedAt: null
      };

      // undefinedのフィールドを除外
      Object.keys(contactData).forEach(key => {
        if (contactData[key] === undefined) {
          delete contactData[key];
        }
      });

      console.log('=== お問い合わせデータ作成 ===');
      console.log('Contact data:', contactData);

      // Firestoreに保存
      console.log('=== Firestoreにお問い合わせ保存 ===');
      const contactRef = await addDoc(collection(db, 'contactInquiries'), contactData);
      console.log('Contact inquiry saved with ID:', contactRef.id);

      // 管理者に通知を送信
      console.log('=== 管理者通知送信開始 ===');
      await notifyAdmins({
        type: 'contact_inquiry',
        title: '新しいお問い合わせが届きました',
        content: `件名: ${subject.trim()}`,
        contactData: contactData
      });

      // デバッグ: 管理者通知をチェック
      console.log('=== デバッグ: 管理者通知チェック ===');
      await checkAdminNotifications();

      alert('お問い合わせを送信しました。管理者が確認後、数日以内に返信いたします。');
      
      // フォームをリセット
      setSubject('');
      setMessage('');
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      alert('送信に失敗しました。しばらく時間をおいて再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-surface-light rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-text-primary" />
          </button>
          <h1 className="text-2xl font-bold text-text-primary">お問い合わせ</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <div className="text-sm text-text-secondary mb-3 font-medium">件名</div>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSubmitting}
              className="w-full bg-transparent border border-border rounded-lg p-4 text-base text-text-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
              placeholder="例: バグ報告 / 要望"
            />
          </div>
          
          <div>
            <div className="text-sm text-text-secondary mb-3 font-medium">内容</div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-40 bg-transparent border border-border rounded-lg p-4 text-base text-text-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 resize-none"
              placeholder="できるだけ詳しくご記入ください"
            />
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : '送信'}
          </button>
          
          <div className="text-center text-sm text-text-secondary">
            返信は数日かかる場合があります
          </div>
        </form>
      </div>
    </div>
  );
};


