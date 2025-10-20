const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const compressionQueue = require('../services/compressionQueue');
const fileDeduplication = require('../services/fileDeduplication');
const { calculateFileHash } = require('../utils/videoCompression');

const router = express.Router();

// 一時ディレクトリの設定
const tempDir = path.join(__dirname, '../temp');
const uploadDir = path.join(tempDir, 'uploads');

// 一時ディレクトリを作成
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

// Multer設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${timestamp}_${name}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB制限
  },
  fileFilter: (req, file, cb) => {
    // 動画ファイルのみ許可
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('動画ファイルのみアップロード可能です'), false);
    }
  }
});

/**
 * 動画アップロードエンドポイント
 */
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '動画ファイルが選択されていません' });
    }

    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'ユーザーIDが必要です' });
    }

    console.log(`Starting upload for user ${userId}, file: ${req.file.originalname}`);

    // ファイルハッシュを計算
    const fileHash = await calculateFileHash(req.file.path);
    
    // 重複チェック
    const duplicateCheck = await fileDeduplication.checkForDuplicate(req.file.path, userId);
    
    if (duplicateCheck.isDuplicate) {
      // 重複ファイルの場合は既存のURLを返す
      console.log('Duplicate file detected, returning existing URL');
      
      // 一時ファイルを削除
      await fs.unlink(req.file.path);
      
      return res.json({
        success: true,
        downloadUrl: duplicateCheck.existingFile.downloadUrl,
        isDuplicate: true,
        message: '同じファイルが既にアップロードされています'
      });
    }

    // 圧縮ジョブをキューに追加
    const jobId = await compressionQueue.addJob({
      inputFilePath: req.file.path,
      userId: userId,
      fileName: req.file.originalname,
      originalHash: fileHash,
      options: {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 0.8
      }
    });

    console.log(`Compression job ${jobId} added to queue`);

    res.json({
      success: true,
      jobId: jobId,
      message: '動画のアップロードが開始されました。圧縮完了後にURLが利用可能になります。'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // 一時ファイルをクリーンアップ
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }

    res.status(500).json({
      error: 'アップロードに失敗しました',
      message: error.message
    });
  }
});

/**
 * 圧縮ジョブの状態を取得
 */
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const jobStatus = compressionQueue.getJobStatus(jobId);
    
    if (!jobStatus) {
      return res.status(404).json({ error: 'ジョブが見つかりません' });
    }

    res.json({
      jobId: jobStatus.id,
      status: jobStatus.status,
      progress: jobStatus.progress,
      result: jobStatus.result,
      error: jobStatus.error,
      createdAt: jobStatus.createdAt,
      startedAt: jobStatus.startedAt,
      completedAt: jobStatus.completedAt
    });

  } catch (error) {
    console.error('Job status error:', error);
    res.status(500).json({
      error: 'ジョブ状態の取得に失敗しました',
      message: error.message
    });
  }
});

/**
 * 圧縮キュー統計を取得
 */
router.get('/queue/stats', async (req, res) => {
  try {
    const stats = compressionQueue.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Queue stats error:', error);
    res.status(500).json({
      error: 'キュー統計の取得に失敗しました',
      message: error.message
    });
  }
});

/**
 * ファイル統計を取得
 */
router.get('/files/stats', async (req, res) => {
  try {
    const stats = await fileDeduplication.getFileStats();
    res.json(stats);
  } catch (error) {
    console.error('File stats error:', error);
    res.status(500).json({
      error: 'ファイル統計の取得に失敗しました',
      message: error.message
    });
  }
});

/**
 * 重複ファイルを統合
 */
router.post('/files/merge-duplicates', async (req, res) => {
  try {
    const mergedCount = await fileDeduplication.mergeDuplicateFiles();
    res.json({
      success: true,
      mergedCount: mergedCount,
      message: `${mergedCount}個の重複ファイルを統合しました`
    });
  } catch (error) {
    console.error('Merge duplicates error:', error);
    res.status(500).json({
      error: '重複ファイルの統合に失敗しました',
      message: error.message
    });
  }
});

module.exports = router;
