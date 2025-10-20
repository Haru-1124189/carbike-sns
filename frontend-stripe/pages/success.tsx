import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Success() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // URLパラメータからsession_idを取得
    const { session_id } = router.query;
    
    if (session_id && typeof session_id === 'string') {
      setSessionId(session_id);
      console.log('✅ 決済成功 - セッションID:', session_id);
    }
    
    setLoading(false);
  }, [router.query]);

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>決済完了 - Stripe決済デモ</title>
        <meta name="description" content="決済が正常に完了しました" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* 成功ヘッダー */}
          <div className="bg-green-600 px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">
                  決済完了
                </h1>
                <p className="text-green-100 text-sm mt-1">
                  お支払いが正常に完了しました
                </p>
              </div>
            </div>
          </div>

          {/* 成功メッセージ */}
          <div className="px-6 py-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                ご購入ありがとうございました！
              </h2>
              
              <p className="text-gray-600 mb-6">
                決済が正常に完了いたしました。<br />
                商品の準備ができ次第、ご連絡いたします。
              </p>

              {/* セッションID表示 */}
              {sessionId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    決済セッションID
                  </h3>
                  <p className="text-xs text-gray-500 font-mono break-all">
                    {sessionId}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    ※ お客様サポートが必要な場合は、このIDをお知らせください
                  </p>
                </div>
              )}

              {/* アクションボタン */}
              <div className="space-y-3">
                <button
                  onClick={handleBackToHome}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  ホームに戻る
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  このページを印刷
                </button>
              </div>

              {/* 追加情報 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  次のステップ
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• 確認メールが送信されます</li>
                  <li>• 商品の発送準備を開始します</li>
                  <li>• 配送状況をお知らせします</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
