const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 新しい動画アップロード機能
const videoUploadRoutes = require('./routes/videoUpload');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004'
  ],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'application/json' })); // Stripe Webhook用

// リクエストの最大サイズを制限（50MB）
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// パフォーマンス監視ミドルウェア
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// メモリ使用量を監視
setInterval(() => {
  const usage = process.memoryUsage();
  const mbUsage = {
    rss: Math.round(usage.rss / 1024 / 1024),
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024)
  };
  
  // メモリ使用量が500MBを超えたら警告
  if (mbUsage.heapUsed > 500) {
    console.warn(`⚠️ 高メモリ使用量: ${JSON.stringify(mbUsage)}`);
    
    // ガベージコレクションを強制実行（開発環境のみ）
    if (global.gc) {
      global.gc();
    }
  }
}, 60000); // 1分ごと

// Stripe Checkoutセッション作成エンドポイント
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const startTime = Date.now();
    const { 
      productName, 
      productPrice, 
      productDescription,
      successUrl,
      cancelUrl 
    } = req.body;

    // 入力値のバリデーション
    if (!productName || !productPrice || !productDescription) {
      return res.status(400).json({
        error: '商品名、価格、説明は必須です'
      });
    }

    // Stripeの金額上限チェック（¥9,999,999,999）
    const maxAmount = 9999999999;
    if (productPrice > maxAmount) {
      return res.status(400).json({
        error: `金額が大きすぎます。上限は¥${maxAmount.toLocaleString()}です。現在の金額: ¥${productPrice.toLocaleString()}`
      });
    }

    // Stripe Checkoutセッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: productName,
              description: productDescription,
            },
            unit_amount: productPrice * 100, // Stripeは最小通貨単位（円の場合は銭）
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        productName: productName,
        productPrice: productPrice.toString(),
      }
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Stripe Checkoutセッション作成成功: ${session.id} (${duration}ms)`);

    res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('❌ Stripe Checkoutセッション作成エラー:', error);
    res.status(500).json({
      error: '決済セッションの作成に失敗しました',
      details: error.message
    });
  }
});

// Stripe Webhookエンドポイント
app.post('/api/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Stripe Webhookの署名を検証
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook署名検証エラー:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // イベントタイプに応じて処理を分岐
  switch (event.type) {
    case 'checkout.session.completed':
      handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'payment_intent.succeeded':
      handlePaymentIntentSucceeded(event.data.object);
      break;
    default:
      console.log(`未処理のイベントタイプ: ${event.type}`);
  }

  res.json({ received: true });
});

// 決済完了時の処理
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('🎉 決済完了イベントを受信:', session.id);
    
    // セッション情報を取得
    const sessionDetails = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'payment_intent']
    });

    console.log('📋 決済詳細:', {
      sessionId: session.id,
      customerEmail: sessionDetails.customer_email,
      amountTotal: sessionDetails.amount_total,
      currency: sessionDetails.currency,
      paymentStatus: sessionDetails.payment_status,
      metadata: sessionDetails.metadata
    });

    // ここでデータベースへの保存や在庫管理などの処理を行う
    // 例: 注文データの保存、在庫の減算、メール送信など
    
    // 実際のアプリケーションでは、ここで以下のような処理を行います：
    // 1. 注文データをデータベースに保存
    // 2. 在庫を減算
    // 3. 顧客に確認メールを送信
    // 4. 管理者に通知を送信
    
    console.log('✅ 決済完了処理が正常に完了しました');

  } catch (error) {
    console.error('❌ 決済完了処理エラー:', error);
  }
}

// 支払い成功時の処理
async function handlePaymentIntentSucceeded(paymentIntent) {
  try {
    console.log('💳 支払い成功イベントを受信:', paymentIntent.id);
    
    console.log('📋 支払い詳細:', {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status
    });

    // 追加の支払い完了処理があればここに記述

  } catch (error) {
    console.error('❌ 支払い成功処理エラー:', error);
  }
}

// ヘルスチェックエンドポイント（拡張版）
app.get('/api/health', (req, res) => {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: Math.round(uptime),
    memory: {
      rss: Math.round(memory.rss / 1024 / 1024),
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
      external: Math.round(memory.external / 1024 / 1024)
    }
  });
});

// Stripe公開キー取得エンドポイント
app.get('/api/stripe-publishable-key', (req, res) => {
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

// 動画アップロードルート
app.use('/api/video', videoUploadRoutes);

// 決済キャンセルページ
app.get('/cancel', (req, res) => {
  res.json({
    message: '決済がキャンセルされました',
    status: 'cancelled',
    redirectUrl: '/marketplace'
  });
});

// 決済成功ページ
app.get('/success', (req, res) => {
  res.json({
    message: '決済が完了しました',
    status: 'success',
    sessionId: req.query.session_id,
    redirectUrl: '/marketplace'
  });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('❌ サーバーエラー:', err);
  res.status(500).json({
    error: '内部サーバーエラーが発生しました',
    message: process.env.NODE_ENV === 'development' ? err.message : 'エラーが発生しました'
  });
});

// 404ハンドリング
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'エンドポイントが見つかりません',
    path: req.originalUrl
  });
});

// グレースフルシャットダウン
process.on('SIGTERM', () => {
  console.log('SIGTERMシグナルを受信しました。グレースフルにシャットダウンします...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINTシグナルを受信しました。グレースフルにシャットダウンします...');
  process.exit(0);
});

// 未処理のPromise拒否を監視
process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromise拒否:', reason);
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
  console.log(`📊 環境: ${process.env.NODE_ENV}`);
  console.log(`🔑 Stripe公開キー: ${process.env.STRIPE_PUBLISHABLE_KEY ? '設定済み' : '未設定'}`);
  console.log(`🔐 Stripe秘密キー: ${process.env.STRIPE_SECRET_KEY ? '設定済み' : '未設定'}`);
  console.log(`💾 メモリ使用量: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
});

module.exports = app;
