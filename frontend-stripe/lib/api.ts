import axios from 'axios';

// バックエンドAPIのベースURL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

// Axiosインスタンスを作成
const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('APIエラー:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Stripe Checkoutセッション作成
export interface CreateCheckoutSessionData {
  productName: string;
  productPrice: number;
  productDescription: string;
  successUrl?: string;
  cancelUrl?: string;
}

export const createCheckoutSession = async (data: CreateCheckoutSessionData) => {
  try {
    const response = await api.post('/create-checkout-session', data);
    return response.data;
  } catch (error) {
    console.error('Checkoutセッション作成エラー:', error);
    throw error;
  }
};

// Stripe公開キー取得
export const getStripePublishableKey = async () => {
  try {
    const response = await api.get('/stripe-publishable-key');
    return response.data.publishableKey;
  } catch (error) {
    console.error('Stripe公開キー取得エラー:', error);
    throw error;
  }
};

// ヘルスチェック
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('ヘルスチェックエラー:', error);
    throw error;
  }
};
