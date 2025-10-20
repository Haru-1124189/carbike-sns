const admin = require('firebase-admin');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

/**
 * ファイル重複管理クラス
 */
class FileDeduplicationService {
  constructor() {
    this.db = admin.firestore();
    this.collection = 'file_hashes';
  }

  /**
   * ファイルハッシュを計算
   */
  async calculateFileHash(filePath) {
    try {
      const buffer = await fs.readFile(filePath);
      return crypto.createHash('sha256').update(buffer).digest('hex');
    } catch (error) {
      console.error('Failed to calculate file hash:', error);
      throw error;
    }
  }

  /**
   * ファイルハッシュをデータベースに保存
   */
  async saveFileHash(hash, fileInfo) {
    try {
      const docRef = this.db.collection(this.collection).doc(hash);
      
      const hashData = {
        hash: hash,
        originalFileName: fileInfo.originalFileName,
        fileSize: fileInfo.fileSize,
        mimeType: fileInfo.mimeType,
        downloadUrl: fileInfo.downloadUrl,
        storagePath: fileInfo.storagePath,
        userId: fileInfo.userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastAccessed: admin.firestore.FieldValue.serverTimestamp(),
        accessCount: 1,
        metadata: fileInfo.metadata || {}
      };

      // 既存のドキュメントがあるかチェック
      const existingDoc = await docRef.get();
      
      if (existingDoc.exists) {
        // アクセス回数を増やし、最終アクセス時間を更新
        await docRef.update({
          lastAccessed: admin.firestore.FieldValue.serverTimestamp(),
          accessCount: admin.firestore.FieldValue.increment(1)
        });
        
        console.log(`File hash ${hash} already exists, updated access info`);
        return existingDoc.data();
      } else {
        // 新しいハッシュを保存
        await docRef.set(hashData);
        console.log(`Saved new file hash: ${hash}`);
        return hashData;
      }
    } catch (error) {
      console.error('Failed to save file hash:', error);
      throw error;
    }
  }

  /**
   * ハッシュでファイルを検索
   */
  async findFileByHash(hash) {
    try {
      const docRef = this.db.collection(this.collection).doc(hash);
      const doc = await docRef.get();
      
      if (doc.exists) {
        // アクセス情報を更新
        await docRef.update({
          lastAccessed: admin.firestore.FieldValue.serverTimestamp(),
          accessCount: admin.firestore.FieldValue.increment(1)
        });
        
        return doc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Failed to find file by hash:', error);
      throw error;
    }
  }

  /**
   * 重複ファイルをチェック
   */
  async checkForDuplicate(filePath, userId) {
    try {
      console.log(`Checking for duplicate file: ${filePath}`);
      
      const hash = await this.calculateFileHash(filePath);
      const existingFile = await this.findFileByHash(hash);
      
      if (existingFile) {
        console.log(`Duplicate file found: ${existingFile.downloadUrl}`);
        
        // 重複ファイルの情報を返す
        return {
          isDuplicate: true,
          existingFile: existingFile,
          hash: hash
        };
      }
      
      return {
        isDuplicate: false,
        hash: hash
      };
    } catch (error) {
      console.error('Failed to check for duplicate:', error);
      throw error;
    }
  }

  /**
   * ファイル情報を保存（重複チェック後）
   */
  async saveFileInfo(filePath, fileInfo, hash) {
    try {
      const stats = await fs.stat(filePath);
      
      const fileData = {
        originalFileName: fileInfo.originalFileName || path.basename(filePath),
        fileSize: stats.size,
        mimeType: fileInfo.mimeType || 'video/mp4',
        downloadUrl: fileInfo.downloadUrl,
        storagePath: fileInfo.storagePath,
        userId: fileInfo.userId,
        metadata: {
          ...fileInfo.metadata,
          compressed: fileInfo.compressed || false,
          originalSize: fileInfo.originalSize,
          compressedSize: fileInfo.compressedSize,
          compressionRatio: fileInfo.compressionRatio
        }
      };

      return await this.saveFileHash(hash, fileData);
    } catch (error) {
      console.error('Failed to save file info:', error);
      throw error;
    }
  }

  /**
   * 未使用ファイルを検索
   */
  async findUnusedFiles(maxAge = 30 * 24 * 60 * 60 * 1000) { // 30日
    try {
      const cutoffDate = new Date(Date.now() - maxAge);
      
      const query = this.db.collection(this.collection)
        .where('lastAccessed', '<', cutoffDate)
        .where('accessCount', '==', 1) // 一度もアクセスされていない
        .limit(100);

      const snapshot = await query.get();
      const unusedFiles = [];

      snapshot.forEach(doc => {
        unusedFiles.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`Found ${unusedFiles.length} unused files`);
      return unusedFiles;
    } catch (error) {
      console.error('Failed to find unused files:', error);
      throw error;
    }
  }

  /**
   * ファイルハッシュを削除
   */
  async deleteFileHash(hash) {
    try {
      await this.db.collection(this.collection).doc(hash).delete();
      console.log(`Deleted file hash: ${hash}`);
    } catch (error) {
      console.error('Failed to delete file hash:', error);
      throw error;
    }
  }

  /**
   * ファイル統計を取得
   */
  async getFileStats() {
    try {
      const snapshot = await this.db.collection(this.collection).get();
      
      let totalFiles = 0;
      let totalSize = 0;
      let compressedFiles = 0;
      let totalCompressionSavings = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        totalFiles++;
        totalSize += data.fileSize;
        
        if (data.metadata?.compressed) {
          compressedFiles++;
          totalCompressionSavings += (data.metadata.originalSize - data.fileSize);
        }
      });

      return {
        totalFiles,
        totalSize,
        compressedFiles,
        totalCompressionSavings,
        compressionRatio: compressedFiles / totalFiles,
        averageFileSize: totalSize / totalFiles
      };
    } catch (error) {
      console.error('Failed to get file stats:', error);
      throw error;
    }
  }

  /**
   * 重複ファイルを統合
   */
  async mergeDuplicateFiles() {
    try {
      console.log('Starting duplicate file merge process...');
      
      const snapshot = await this.db.collection(this.collection).get();
      const hashGroups = new Map();

      // ハッシュでグループ化
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!hashGroups.has(data.hash)) {
          hashGroups.set(data.hash, []);
        }
        hashGroups.get(data.hash).push({ id: doc.id, ...data });
      });

      let mergedCount = 0;
      
      // 重複グループを処理
      for (const [hash, files] of hashGroups) {
        if (files.length > 1) {
          console.log(`Found ${files.length} duplicate files for hash ${hash}`);
          
          // 最もアクセス回数が多いファイルを保持
          const keepFile = files.reduce((prev, current) => 
            current.accessCount > prev.accessCount ? current : prev
          );
          
          // 他のファイルのハッシュを削除
          for (const file of files) {
            if (file.id !== keepFile.id) {
              await this.deleteFileHash(file.id);
              mergedCount++;
            }
          }
        }
      }

      console.log(`Merged ${mergedCount} duplicate files`);
      return mergedCount;
    } catch (error) {
      console.error('Failed to merge duplicate files:', error);
      throw error;
    }
  }
}

module.exports = new FileDeduplicationService();
