import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MarketplaceSuccessPageProps {
  onBackClick?: () => void;
}

const MarketplaceSuccessPage: React.FC<MarketplaceSuccessPageProps> = ({ onBackClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('決済処理中...');
  const [status, setStatus] = useState<'success' | 'failed' | 'loading'>('loading');

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get('session_id');

    if (sessionId) {
      // バックエンドの/successエンドポイントを呼び出して決済詳細を取得
      fetch(`http://localhost:3003/success?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            setMessage(data.message || '決済が完了しました！');
            setStatus('success');
            // 必要に応じて、注文データをFirestoreに保存するなどの処理をここに追加
            // 例: saveOrderToFirestore(sessionId, data.orderData);
          } else {
            setMessage(data.message || '決済に失敗しました。');
            setStatus('failed');
          }
          // 3秒後にマーケットプレイスにリダイレクト
          setTimeout(() => {
            navigate(data.redirectUrl || '/marketplace');
          }, 3000);
        })
        .catch(error => {
          console.error('Error fetching success details:', error);
          setMessage('決済詳細の取得中にエラーが発生しました。');
          setStatus('failed');
          setTimeout(() => {
            navigate('/marketplace');
          }, 3000);
        });
    } else {
      setMessage('無効な決済セッションです。');
      setStatus('failed');
      setTimeout(() => {
        navigate('/marketplace');
      }, 3000);
    }
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4">
      <div className="bg-surface p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        )}
         {status === 'success' && (
           <div className="text-6xl mb-4">✅</div>
         )}
         {status === 'failed' && (
           <div className="text-6xl mb-4">❌</div>
         )}
        <h2 className="text-2xl font-bold mb-2">{message}</h2>
        <p className="text-text-secondary">マーケットプレイスにリダイレクトします...</p>
      </div>
    </div>
  );
};

export default MarketplaceSuccessPage;
