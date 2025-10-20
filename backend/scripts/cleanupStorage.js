const admin = require('firebase-admin');
const fs = require('fs').promises;
const path = require('path');

// Firebase Admin初期化
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const bucket = admin.storage().bucket();
const db = admin.firestore();

/**
 * Firebase Storageクリーンアップスクリプト
 */
class StorageCleanupService {
  constructor() {
    this.bucket = bucket;
    this.db = db;
    this.stats = {
      totalFiles: 0,
      deletedFiles: 0,
      freedSpace: 0,
      errors: 0
    };
  }

  /**
   * Firestoreから参照されているファイルのリストを取得
   */
  async getReferencedFiles() {
    try {
      console.log('Fetching referenced files from Firestore...');
      
      const referencedFiles = new Set();
      
      // 動画コレクションから参照を取得
      const videosSnapshot = await this.db.collection('videos').get();
      videosSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.videoUrl) {
          referencedFiles.add(this.extractStoragePath(data.videoUrl));
        }
        if (data.thumbnailUrl) {
          referencedFiles.add(this.extractStoragePath(data.thumbnailUrl));
        }
      });

      // 投稿画像から参照を取得
      const postsSnapshot = await this.db.collection('posts').get();
      postsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.imageUrl) {
          referencedFiles.add(this.extractStoragePath(data.imageUrl));
        }
      });

      // プロフィール画像から参照を取得
      const usersSnapshot = await this.db.collection('users').get();
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.profileImageUrl) {
          referencedFiles.add(this.extractStoragePath(data.profileImageUrl));
        }
      });

      console.log(`Found ${referencedFiles.size} referenced files`);
      return referencedFiles;
    } catch (error) {
      console.error('Failed to get referenced files:', error);
      throw error;
    }
  }

  /**
   * URLからStorageパスを抽出
   */
  extractStoragePath(url) {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      
      // Firebase Storage URLからパスを抽出
      if (pathname.includes('/o/')) {
        return decodeURIComponent(pathname.split('/o/')[1].split('?')[0]);
      }
      
      return pathname;
    } catch (error) {
      console.warn('Failed to extract storage path from URL:', url);
      return null;
    }
  }

  /**
   * Firebase Storageのすべてのファイルを取得
   */
  async getAllStorageFiles() {
    try {
      console.log('Fetching all files from Firebase Storage...');
      
      const [files] = await this.bucket.getFiles();
      this.stats.totalFiles = files.length;
      
      console.log(`Found ${files.length} files in storage`);
      return files;
    } catch (error) {
      console.error('Failed to get storage files:', error);
      throw error;
    }
  }

  /**
   * 未参照ファイルを削除
   */
  async deleteUnreferencedFiles() {
    try {
      console.log('Starting cleanup process...');
      
      const [referencedFiles, storageFiles] = await Promise.all([
        this.getReferencedFiles(),
        this.getAllStorageFiles()
      ]);

      const deletionPromises = [];
      const batchSize = 10; // 同時削除数を制限

      for (const file of storageFiles) {
        // 参照されていないファイルを削除対象に追加
        if (!referencedFiles.has(file.name)) {
          deletionPromises.push(this.deleteFile(file));
          
          // バッチサイズに達したら処理を実行
          if (deletionPromises.length >= batchSize) {
            await Promise.allSettled(deletionPromises);
            deletionPromises.length = 0;
          }
        }
      }

      // 残りのファイルを処理
      if (deletionPromises.length > 0) {
        await Promise.allSettled(deletionPromises);
      }

      console.log(`Cleanup completed. Deleted ${this.stats.deletedFiles} files, freed ${(this.stats.freedSpace / 1024 / 1024).toFixed(2)}MB`);
      
    } catch (error) {
      console.error('Failed to delete unreferenced files:', error);
      throw error;
    }
  }

  /**
   * ファイルを削除
   */
  async deleteFile(file) {
    try {
      const [metadata] = await file.getMetadata();
      const fileSize = parseInt(metadata.size) || 0;
      
      await file.delete();
      
      this.stats.deletedFiles++;
      this.stats.freedSpace += fileSize;
      
      console.log(`Deleted: ${file.name} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`);
      
    } catch (error) {
      console.error(`Failed to delete file ${file.name}:`, error);
      this.stats.errors++;
    }
  }

  /**
   * 古いファイルを削除（指定日数より古い）
   */
  async deleteOldFiles(maxAgeDays = 90) {
    try {
      console.log(`Deleting files older than ${maxAgeDays} days...`);
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
      
      const [files] = await this.bucket.getFiles();
      const deletionPromises = [];

      for (const file of files) {
        try {
          const [metadata] = await file.getMetadata();
          const createdDate = new Date(metadata.timeCreated);
          
          if (createdDate < cutoffDate) {
            deletionPromises.push(this.deleteFile(file));
          }
        } catch (error) {
          console.warn(`Failed to get metadata for ${file.name}:`, error);
        }
      }

      await Promise.allSettled(deletionPromises);
      
      console.log(`Deleted ${this.stats.deletedFiles} old files`);
      
    } catch (error) {
      console.error('Failed to delete old files:', error);
      throw error;
    }
  }

  /**
   * ストレージ統計を取得
   */
  async getStorageStats() {
    try {
      console.log('Getting storage statistics...');
      
      const [files] = await this.bucket.getFiles();
      let totalSize = 0;
      let fileCount = 0;
      const fileTypes = {};

      for (const file of files) {
        try {
          const [metadata] = await file.getMetadata();
          const size = parseInt(metadata.size) || 0;
          const contentType = metadata.contentType || 'unknown';
          
          totalSize += size;
          fileCount++;
          
          if (!fileTypes[contentType]) {
            fileTypes[contentType] = { count: 0, size: 0 };
          }
          fileTypes[contentType].count++;
          fileTypes[contentType].size += size;
          
        } catch (error) {
          console.warn(`Failed to get metadata for ${file.name}:`, error);
        }
      }

      const stats = {
        totalFiles: fileCount,
        totalSize: totalSize,
        totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
        totalSizeGB: (totalSize / 1024 / 1024 / 1024).toFixed(2),
        fileTypes: fileTypes
      };

      console.log('Storage Statistics:');
      console.log(`Total Files: ${stats.totalFiles}`);
      console.log(`Total Size: ${stats.totalSizeGB}GB (${stats.totalSizeMB}MB)`);
      console.log('File Types:', fileTypes);

      return stats;
    } catch (error) {
      console.error('Failed to get storage stats:', error);
      throw error;
    }
  }

  /**
   * メインクリーンアップ処理
   */
  async runCleanup(options = {}) {
    const {
      deleteUnreferenced = true,
      deleteOldFiles = false,
      maxAgeDays = 90,
      showStats = true
    } = options;

    try {
      console.log('Starting Firebase Storage cleanup...');
      
      if (showStats) {
        await this.getStorageStats();
      }

      if (deleteUnreferenced) {
        await this.deleteUnreferencedFiles();
      }

      if (deleteOldFiles) {
        await this.deleteOldFiles(maxAgeDays);
      }

      console.log('Cleanup completed successfully!');
      console.log(`Stats: ${this.stats.deletedFiles} deleted, ${this.stats.errors} errors, ${(this.stats.freedSpace / 1024 / 1024).toFixed(2)}MB freed`);
      
      return this.stats;
    } catch (error) {
      console.error('Cleanup failed:', error);
      throw error;
    }
  }
}

// コマンドライン実行
if (require.main === module) {
  const cleanupService = new StorageCleanupService();
  
  const args = process.argv.slice(2);
  const options = {};

  // コマンドライン引数を解析
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--delete-old':
        options.deleteOldFiles = true;
        if (args[i + 1] && !isNaN(args[i + 1])) {
          options.maxAgeDays = parseInt(args[i + 1]);
          i++;
        }
        break;
      case '--stats-only':
        options.deleteUnreferenced = false;
        options.deleteOldFiles = false;
        break;
      case '--no-unreferenced':
        options.deleteUnreferenced = false;
        break;
    }
  }

  // クリーンアップ実行
  cleanupService.runCleanup(options)
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = StorageCleanupService;
