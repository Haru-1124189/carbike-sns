import { loadStripe } from '@stripe/stripe-js';
import Head from 'next/head';
import { useState } from 'react';
import { createCheckoutSession } from '../lib/api';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState({
    productName: 'サンプル商品',
    productPrice: 1000,
    productDescription: 'これはテスト用のサンプル商品です。',
  });

  // 購入ボタンクリック時の処理
  const handlePurchase = async () => {
    try {
      setLoading(true);
      
      // Stripeインスタンスを取得
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      
      if (!stripe) {
        throw new Error('Stripeの初期化に失敗しました');
      }

      // バックエンドでCheckoutセッションを作成
      const sessionData = await createCheckoutSession({
        ...productData,
        successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/cancel`,
      });

      console.log('✅ Checkoutセッション作成成功:', sessionData.sessionId);

      // Stripe Checkoutページにリダイレクト
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionData.sessionId,
      });

      if (error) {
        console.error('❌ Stripe Checkoutエラー:', error);
        alert(`決済ページへの遷移に失敗しました: ${error.message}`);
      }

    } catch (error: any) {
      console.error('❌ 決済処理エラー:', error);
      alert(`決済処理でエラーが発生しました: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Stripe決済デモ</title>
        <meta name="description" content="Stripe Checkoutを使った決済システムのデモ" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          {/* ヘッダー */}
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-xl font-bold text-white">
              Stripe決済デモ
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Stripe Checkoutを使用した決済システム
            </p>
          </div>

          {/* 商品情報 */}
          <div className="px-6 py-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品名
              </label>
              <input
                type="text"
                value={productData.productName}
                onChange={(e) => setProductData({
                  ...productData,
                  productName: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="商品名を入力"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                価格（円）
              </label>
              <input
                type="number"
                value={productData.productPrice}
                onChange={(e) => setProductData({
                  ...productData,
                  productPrice: parseInt(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="価格を入力"
                min="0"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                商品説明
              </label>
              <textarea
                value={productData.productDescription}
                onChange={(e) => setProductData({
                  ...productData,
                  productDescription: e.target.value
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="商品の説明を入力"
              />
            </div>

            {/* 商品プレビュー */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">商品プレビュー</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">商品名:</span> {productData.productName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">価格:</span> ¥{productData.productPrice.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">説明:</span> {productData.productDescription}
                </p>
              </div>
            </div>

            {/* 購入ボタン */}
            <button
              onClick={handlePurchase}
              disabled={loading || !productData.productName || productData.productPrice <= 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  処理中...
                </div>
              ) : (
                'Stripeで決済する'
              )}
            </button>

            {/* 注意事項 */}
            <div className="mt-4 text-xs text-gray-500">
              <p>※ これはテスト環境です。実際の決済は行われません。</p>
              <p>※ テスト用のカード番号: 4242 4242 4242 4242</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
