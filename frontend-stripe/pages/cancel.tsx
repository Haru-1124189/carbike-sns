import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Cancel() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleRetryPurchase = () => {
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>決済キャンセル - Stripe決済デモ</title>
        <meta name="description" content="決済がキャンセルされました" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* キャンセルヘッダー */}
          <div className="bg-yellow-600 px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">
                  決済キャンセル
                </h1>
                <p className="text-yellow-100 text-sm mt-1">
                  決済がキャンセルされました
                </p>
              </div>
            </div>
          </div>

          {/* キャンセルメッセージ */}
          <div className="px-6 py-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                決済がキャンセルされました
              </h2>
              
              <p className="text-gray-600 mb-6">
                決済処理がキャンセルされました。<br />
                お支払いは行われておりません。
              </p>

              {/* 理由の説明 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  キャンセルされた理由
                </h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• お客様が決済ページで「戻る」ボタンをクリック</li>
                  <li>• 決済情報の入力中にページを閉じた</li>
                  <li>• ネットワークエラーが発生した</li>
                  <li>• その他の技術的な問題</li>
                </ul>
              </div>

              {/* アクションボタン */}
              <div className="space-y-3">
                <button
                  onClick={handleRetryPurchase}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  再度決済する
                </button>
                
                <button
                  onClick={handleBackToHome}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  ホームに戻る
                </button>
              </div>

              {/* サポート情報 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  サポートが必要な場合
                </h3>
                <p className="text-sm text-gray-600">
                  決済でお困りの場合は、お客様サポートまでご連絡ください。<br />
                  お手伝いさせていただきます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
