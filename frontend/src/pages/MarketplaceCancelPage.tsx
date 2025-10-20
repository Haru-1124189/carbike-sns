import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface MarketplaceCancelPageProps {
  onBackClick?: () => void;
}

const MarketplaceCancelPage: React.FC<MarketplaceCancelPageProps> = ({ onBackClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('決済キャンセル処理中...');
  const [status, setStatus] = useState<'cancelled' | 'loading'>('loading');

  useEffect(() => {
    // バックエンドの/cancelエンドポイントを呼び出してキャンセル詳細を取得
    fetch(`http://localhost:3003/cancel`)
      .then(res => res.json())
      .then(data => {
        setMessage(data.message || '決済がキャンセルされました。');
        setStatus('cancelled');
        // 3秒後にマーケットプレイスにリダイレクト
        setTimeout(() => {
          navigate(data.redirectUrl || '/marketplace');
        }, 3000);
      })
      .catch(error => {
        console.error('Error fetching cancel details:', error);
        setMessage('キャンセル詳細の取得中にエラーが発生しました。');
        setStatus('cancelled');
        setTimeout(() => {
          navigate('/marketplace');
        }, 3000);
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-4">
      <div className="bg-surface p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        {status === 'loading' && (
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
        )}
         {status === 'cancelled' && (
           <div className="text-6xl mb-4">❌</div>
         )}
        <h2 className="text-2xl font-bold mb-2">{message}</h2>
        <p className="text-text-secondary">マーケットプレイスにリダイレクトします...</p>
      </div>
    </div>
  );
};

export default MarketplaceCancelPage;
