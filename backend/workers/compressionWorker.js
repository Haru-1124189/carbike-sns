const { parentPort, workerData } = require('worker_threads');
const { optimizeVideo, getVideoMetadata, calculateFileHash } = require('../utils/videoCompression');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs').promises;

// Firebase Admin初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const bucket = admin.storage().bucket();

/**
 * Firebase Storageにファイルをアップロード
 */
const uploadToFirebaseStorage = async (filePath, storagePath, metadata = {}) => {
  try {
    const options = {
      destination: storagePath,
      metadata: {
        metadata: {
          originalName: metadata.originalName || path.basename(filePath),
          contentType: 'video/mp4',
          ...metadata
        }
      }
    };

    await bucket.upload(filePath, options);
    
    // 公開URLを取得
    const file = bucket.file(storagePath);
    await file.makePublic();
    
    return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
  } catch (error) {
    console.error('Firebase Storage upload failed:', error);
    throw error;
  }
};

/**
 * 一時ファイルを削除
 */
const cleanupTempFiles = async (filePaths) => {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
      console.log(`Cleaned up temp file: ${filePath}`);
    } catch (error) {
      console.warn(`Failed to cleanup temp file ${filePath}:`, error);
    }
  }
};

/**
 * メイン処理
 */
const processVideoCompression = async (jobData) => {
  const {
    inputFilePath,
    userId,
    fileName,
    originalHash,
    options = {}
  } = jobData;

  const tempFiles = [inputFilePath];
  
  try {
    console.log(`Starting compression job for user ${userId}, file: ${fileName}`);
    
    // 出力パスを生成
    const timestamp = Date.now();
    const outputFileName = `compressed_${timestamp}_${fileName}`;
    const outputFilePath = path.join(__dirname, '../temp', outputFileName);
    
    // 一時ディレクトリを作成
    await fs.mkdir(path.dirname(outputFilePath), { recursive: true });
    tempFiles.push(outputFilePath);
    
    // 動画を最適化
    const result = await optimizeVideo(inputFilePath, outputFilePath, {
      ...options,
      onProgress: (progress) => {
        // 進捗をメインスレッドに送信
        parentPort.postMessage({
          type: 'progress',
          progress: progress,
          jobId: jobData.jobId
        });
      }
    });
    
    // ハッシュを計算して重複チェック
    const compressedHash = await calculateFileHash(outputFilePath);
    
    // Firebase Storageのパスを生成
    const storagePath = `videos/${userId}/${timestamp}_${fileName}`;
    
    // Firebase Storageにアップロード
    const downloadUrl = await uploadToFirebaseStorage(outputFilePath, storagePath, {
      originalName: fileName,
      originalHash: originalHash,
      compressedHash: compressedHash,
      compressed: result.compressed,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      compressionRatio: result.compressionRatio
    });
    
    // 結果を返す
    const finalResult = {
      success: true,
      downloadUrl,
      storagePath,
      metadata: result.metadata,
      compressionInfo: {
        compressed: result.compressed,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio
      },
      hashes: {
        original: originalHash,
        compressed: compressedHash
      }
    };
    
    console.log('Compression job completed successfully');
    return finalResult;
    
  } catch (error) {
    console.error('Compression job failed:', error);
    throw error;
  } finally {
    // 一時ファイルをクリーンアップ
    await cleanupTempFiles(tempFiles);
  }
};

// ワーカーのメッセージハンドリング
parentPort.on('message', async (message) => {
  try {
    const result = await processVideoCompression(message);
    parentPort.postMessage({
      type: 'success',
      result: result,
      jobId: message.jobId
    });
  } catch (error) {
    parentPort.postMessage({
      type: 'error',
      error: error.message,
      jobId: message.jobId
    });
  }
});

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  parentPort.postMessage({
    type: 'error',
    error: 'Unhandled rejection in worker',
    jobId: workerData?.jobId
  });
});
