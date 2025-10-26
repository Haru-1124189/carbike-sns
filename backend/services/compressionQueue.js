const { Worker } = require('worker_threads');
const path = require('path');
const crypto = require('crypto');

/**
 * 圧縮ジョブ管理クラス（最適化版）
 */
class CompressionQueue {
  constructor() {
    this.jobs = new Map();
    this.activeWorkers = new Set();
    this.maxConcurrentJobs = 4; // 同時実行ジョブ数を増加（3 → 4）
    this.pendingJobs = [];
    this.maxRetries = 2; // 最大リトライ回数
    this.retryDelays = [5000, 10000]; // リトライ遅延時間（ms）
    this.processStats = {
      total: 0,
      success: 0,
      failed: 0,
      averageTime: 0
    };
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
      retryCount: 0,
      priority: jobData.priority || 'normal', // 優先度追加
      ...jobData
    };

    this.jobs.set(jobId, job);
    
    // 優先度に基づいてジョブを挿入
    this.insertJobByPriority(jobId);
    
    this.processStats.total++;
    console.log(`Added compression job ${jobId} to queue (priority: ${job.priority})`);
    
    // ジョブを実行
    this.processNextJob();
    
    return jobId;
  }

  /**
   * 優先度に基づいてジョブを挿入
   */
  insertJobByPriority(jobId) {
    const job = this.jobs.get(jobId);
    
    if (this.pendingJobs.length === 0) {
      this.pendingJobs.push(jobId);
      return;
    }

    const priorities = { high: 0, normal: 1, low: 2 };
    const jobPriority = priorities[job.priority] || 1;

    let insertIndex = 0;
    for (let i = 0; i < this.pendingJobs.length; i++) {
      const existingJob = this.jobs.get(this.pendingJobs[i]);
      const existingPriority = priorities[existingJob.priority] || 1;
      
      if (jobPriority < existingPriority) {
        insertIndex = i;
        break;
      }
      insertIndex = i + 1;
    }

    this.pendingJobs.splice(insertIndex, 0, jobId);
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
      return this.processNextJob(); // 次のジョブを処理
    }

    // ジョブを実行中に変更
    job.status = 'running';
    job.startedAt = new Date();
    
    await this.executeJob(job);
  }

  /**
   * ジョブを実行（リトライ機能付き）
   */
  async executeJob(job) {
    return new Promise((resolve) => {
      const workerPath = path.join(__dirname, '../workers/compressionWorker.js');
      const worker = new Worker(workerPath, {
        workerData: { jobId: job.id }
      });

      this.activeWorkers.add(worker);
      const startTime = Date.now();

      // タイムアウト設定（10分）
      const timeout = setTimeout(() => {
        console.error(`Job ${job.id} timed out`);
        worker.terminate();
        this.activeWorkers.delete(worker);
        this.handleJobFailure(job, new Error('Job timeout'));
        resolve();
      }, 600000);

      // ワーカーからのメッセージを処理
      worker.on('message', (message) => {
        switch (message.type) {
          case 'progress':
            job.progress = message.progress;
            console.log(`Job ${job.id} progress: ${message.progress}%`);
            break;
            
          case 'success':
            clearTimeout(timeout);
            const duration = Date.now() - startTime;
            job.status = 'completed';
            job.result = message.result;
            job.completedAt = new Date();
            job.progress = 100;
            
            this.updateStats(duration, true);
            console.log(`Job ${job.id} completed successfully (${duration}ms)`);
            
            this.cleanupWorker(worker, job.id);
            resolve();
            break;
            
          case 'error':
            clearTimeout(timeout);
            console.error(`Job ${job.id} failed:`, message.error);
            this.cleanupWorker(worker, job.id);
            this.handleJobFailure(job, message.error, startTime);
            resolve();
            break;
        }
      });

      // ワーカーのエラーハンドリング
      worker.on('error', (error) => {
        clearTimeout(timeout);
        console.error(`Worker error for job ${job.id}:`, error);
        this.activeWorkers.delete(worker);
        worker.terminate();
        this.handleJobFailure(job, error, startTime);
        resolve();
      });

      // ジョブデータをワーカーに送信
      worker.postMessage(job);
    });
  }

  /**
   * ジョブ失敗時の処理
   */
  handleJobFailure(job, error, startTime = Date.now()) {
    const duration = Date.now() - startTime;
    
    if (job.retryCount < this.maxRetries) {
      // リトライ
      job.retryCount++;
      job.status = 'pending';
      job.startedAt = null;
      job.error = null;
      job.progress = 0;
      
      const delay = this.retryDelays[job.retryCount - 1] || 5000;
      console.log(`Retrying job ${job.id} (attempt ${job.retryCount}/${this.maxRetries}) after ${delay}ms`);
      
      setTimeout(() => {
        this.insertJobByPriority(job.id);
        this.processNextJob();
      }, delay);
    } else {
      // リトライ回数超過
      job.status = 'failed';
      job.error = error.message || error;
      job.completedAt = new Date();
      
      this.updateStats(duration, false);
      console.error(`Job ${job.id} failed after ${this.maxRetries} retries`);
      
      this.processNextJob();
    }
  }

  /**
   * 統計を更新
   */
  updateStats(duration, success) {
    if (success) {
      this.processStats.success++;
    } else {
      this.processStats.failed++;
    }
    
    // 平均時間を更新（移動平均）
    const total = this.processStats.success + this.processStats.failed;
    this.processStats.averageTime = 
      (this.processStats.averageTime * (total - 1) + duration) / total;
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
    let cleanedCount = 0;
    
    for (const [jobId, job] of this.jobs) {
      if (job.createdAt < cutoffTime && (job.status === 'completed' || job.status === 'failed')) {
        this.jobs.delete(jobId);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`Cleaned up ${cleanedCount} old job(s)`);
    }
  }

  /**
   * キュー統計を取得（拡張版）
   */
  getStats() {
    const stats = {
      total: this.jobs.size,
      pending: 0,
      running: 0,
      completed: 0,
      failed: 0,
      activeWorkers: this.activeWorkers.size,
      maxConcurrentJobs: this.maxConcurrentJobs,
      processStats: this.processStats
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

// 定期クリーンアップ（30分ごと）
setInterval(() => {
  compressionQueue.cleanupOldJobs();
}, 30 * 60 * 1000);

module.exports = compressionQueue;
