import { loadStripe } from '@stripe/stripe-js';

// Stripe公開キーを取得
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Stripe公開キーが設定されていません。環境変数NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEYを確認してください。');
}

// Stripeインスタンスを作成
export const stripePromise = loadStripe(stripePublishableKey);

// Stripe公開キーを取得するヘルパー関数
export const getStripePublishableKey = () => {
  return stripePublishableKey;
};
