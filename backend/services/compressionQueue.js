const { Worker } = require('worker_threads');
const path = require('path');
const crypto = require('crypto');

/**
 * 圧縮ジョブ管理クラス
 */
class CompressionQueue {
  constructor() {
    this.jobs = new Map();
    this.activeWorkers = new Set();
    this.maxConcurrentJobs = 3; // 同時実行ジョブ数
    this.pendingJobs = [];
  }

  /**
   * 新しい圧縮ジョブを追加
   */
  async addJob(jobData) {
    const jobId = crypto.randomUUID();
    
    const job = {
      id: jobId,
      status: 'pending',
      progress: 0,
      result: null,
      error: null,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      ...jobData
    };

    this.jobs.set(jobId, job);
    this.pendingJobs.push(jobId);

    console.log(`Added compression job ${jobId} to queue`);
    
    // ジョブを実行
    this.processNextJob();
    
    return jobId;
  }

  /**
   * 次のジョブを処理
   */
  async processNextJob() {
    // 同時実行数が上限に達している場合は待機
    if (this.activeWorkers.size >= this.maxConcurrentJobs) {
      return;
    }

    // 待機中のジョブがない場合は終了
    if (this.pendingJobs.length === 0) {
      return;
    }

    const jobId = this.pendingJobs.shift();
    const job = this.jobs.get(jobId);
    
    if (!job) {
      return;
    }

    // ジョブを実行中に変更
    job.status = 'running';
    job.startedAt = new Date();
    
    await this.executeJob(job);
  }

  /**
   * ジョブを実行
   */
  async executeJob(job) {
    return new Promise((resolve) => {
      const workerPath = path.join(__dirname, '../workers/compressionWorker.js');
      const worker = new Worker(workerPath, {
        workerData: { jobId: job.id }
      });

      this.activeWorkers.add(worker);

      // ワーカーからのメッセージを処理
      worker.on('message', (message) => {
        switch (message.type) {
          case 'progress':
            job.progress = message.progress;
            console.log(`Job ${job.id} progress: ${message.progress}%`);
            break;
            
          case 'success':
            job.status = 'completed';
            job.result = message.result;
            job.completedAt = new Date();
            job.progress = 100;
            console.log(`Job ${job.id} completed successfully`);
            this.cleanupWorker(worker, job.id);
            resolve();
            break;
            
          case 'error':
            job.status = 'failed';
            job.error = message.error;
            job.completedAt = new Date();
            console.error(`Job ${job.id} failed:`, message.error);
            this.cleanupWorker(worker, job.id);
            resolve();
            break;
        }
      });

      // ワーカーのエラーハンドリング
      worker.on('error', (error) => {
        job.status = 'failed';
        job.error = error.message;
        job.completedAt = new Date();
        console.error(`Worker error for job ${job.id}:`, error);
        this.cleanupWorker(worker, job.id);
        resolve();
      });

      // ジョブデータをワーカーに送信
      worker.postMessage(job);
    });
  }

  /**
   * ワーカーをクリーンアップ
   */
  cleanupWorker(worker, jobId) {
    this.activeWorkers.delete(worker);
    worker.terminate();
    
    // 次のジョブを処理
    this.processNextJob();
  }

  /**
   * ジョブの状態を取得
   */
  getJobStatus(jobId) {
    return this.jobs.get(jobId);
  }

  /**
   * すべてのジョブの状態を取得
   */
  getAllJobs() {
    return Array.from(this.jobs.values());
  }

  /**
   * 古いジョブをクリーンアップ
   */
  cleanupOldJobs(maxAge = 24 * 60 * 60 * 1000) { // 24時間
    const cutoffTime = new Date(Date.now() - maxAge);
    
    for (const [jobId, job] of this.jobs) {
      if (job.createdAt < cutoffTime && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(jobId);
        console.log(`Cleaned up old job ${jobId}`);
      }
    }
  }

  /**
   * キュー統計を取得
   */
  getStats() {
    const stats = {
      total: this.jobs.size,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      activeWorkers: this.activeWorkers.size
    };

    for (const job of this.jobs.values()) {
      stats[job.status]++;
    }

    stats.pending = this.pendingJobs.length;
    
    return stats;
  }
}

// シングルトンインスタンス
const compressionQueue = new CompressionQueue();

// 定期クリーンアップ
setInterval(() => {
  compressionQueue.cleanupOldJobs();
}, 60 * 60 * 1000); // 1時間ごと

module.exports = compressionQueue;
