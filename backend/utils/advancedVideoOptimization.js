const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const sharp = require('sharp');

// FFmpegのパスを設定
ffmpeg.setFfmpegPath('C:\\ffmpeg\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\ffmpeg\\ffmpeg-8.0-essentials_build\\bin\\ffprobe.exe');

// 高度な圧縮設定
const ADVANCED_COMPRESSION_CONFIG = {
  // 高品質設定
  high: {
    video: {
      codec: 'libx264',
      preset: 'slow',
      crf: 18,
      maxrate: '2000k',
      bufsize: '4000k',
      profile: 'high',
      level: '4.1',
      pix_fmt: 'yuv420p'
    },
    audio: {
      codec: 'aac',
      bitrate: '192k',
      sampleRate: 48000,
      channels: 2
    }
  },
  // 標準設定
  standard: {
    video: {
      codec: 'libx264',
      preset: 'medium',
      crf: 23,
      maxrate: '1500k',
      bufsize: '3000k',
      profile: 'high',
      level: '4.0',
      pix_fmt: 'yuv420p'
    },
    audio: {
      codec: 'aac',
      bitrate: '128k',
      sampleRate: 44100,
      channels: 2
    }
  },
  // 高速設定
  fast: {
    video: {
      codec: 'libx264',
      preset: 'fast',
      crf: 28,
      maxrate: '1000k',
      bufsize: '2000k',
      profile: 'main',
      level: '3.1',
      pix_fmt: 'yuv420p'
    },
    audio: {
      codec: 'aac',
      bitrate: '96k',
      sampleRate: 44100,
      channels: 2
    }
  }
};

/**
 * 動画の詳細メタデータを取得
 */
const getDetailedVideoMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }
      
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      
      resolve({
        duration: metadata.format.duration,
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        bitrate: parseInt(metadata.format.bit_rate) || 0,
        framerate: videoStream?.r_frame_rate || '0/1',
        audioCodec: audioStream?.codec_name || 'unknown',
        videoCodec: videoStream?.codec_name || 'unknown',
        size: metadata.format.size,
        format: metadata.format.format_name,
        streams: metadata.streams.length,
        hasAudio: !!audioStream,
        hasVideo: !!videoStream,
        pixelFormat: videoStream?.pix_fmt || 'unknown',
        colorSpace: videoStream?.color_space || 'unknown',
        colorRange: videoStream?.color_range || 'unknown'
      });
    });
  });
};

/**
 * 動画の品質を分析
 */
const analyzeVideoQuality = (metadata) => {
  const quality = {
    score: 0,
    issues: [],
    recommendations: []
  };

  // 解像度スコア
  if (metadata.width >= 1920 && metadata.height >= 1080) {
    quality.score += 30;
  } else if (metadata.width >= 1280 && metadata.height >= 720) {
    quality.score += 20;
  } else if (metadata.width >= 854 && metadata.height >= 480) {
    quality.score += 10;
  } else {
    quality.issues.push('低解像度');
    quality.recommendations.push('解像度を720p以上に上げることを推奨');
  }

  // ビットレートスコア
  if (metadata.bitrate > 5000000) {
    quality.score += 25;
  } else if (metadata.bitrate > 2000000) {
    quality.score += 15;
  } else if (metadata.bitrate > 1000000) {
    quality.score += 10;
  } else {
    quality.issues.push('低ビットレート');
    quality.recommendations.push('ビットレートを1Mbps以上に上げることを推奨');
  }

  // フレームレートスコア
  const framerate = parseFloat(metadata.framerate.split('/')[0]) / parseFloat(metadata.framerate.split('/')[1]);
  if (framerate >= 30) {
    quality.score += 20;
  } else if (framerate >= 24) {
    quality.score += 15;
  } else {
    quality.issues.push('低フレームレート');
    quality.recommendations.push('フレームレートを24fps以上に上げることを推奨');
  }

  // 音声スコア
  if (metadata.hasAudio) {
    quality.score += 15;
  } else {
    quality.issues.push('音声なし');
    quality.recommendations.push('音声トラックの追加を推奨');
  }

  // コーデックスコア
  if (metadata.videoCodec === 'h264' || metadata.videoCodec === 'libx264') {
    quality.score += 10;
  } else {
    quality.issues.push('非推奨コーデック');
    quality.recommendations.push('H.264コーデックの使用を推奨');
  }

  return quality;
};

/**
 * 適応的圧縮設定を決定
 */
const determineCompressionSettings = (metadata, targetQuality = 'standard') => {
  const config = ADVANCED_COMPRESSION_CONFIG[targetQuality];
  
  // 解像度に基づく調整
  if (metadata.width > 1920 || metadata.height > 1080) {
    config.video.maxrate = '3000k';
    config.video.bufsize = '6000k';
  } else if (metadata.width < 1280 && metadata.height < 720) {
    config.video.maxrate = '800k';
    config.video.bufsize = '1600k';
  }

  // ビットレートに基づく調整
  if (metadata.bitrate > 10000000) {
    config.video.crf = Math.max(18, config.video.crf - 3);
  } else if (metadata.bitrate < 1000000) {
    config.video.crf = Math.min(28, config.video.crf + 3);
  }

  return config;
};

/**
 * 動画サムネイル生成
 */
const generateVideoThumbnails = (inputPath, outputDir, count = 5) => {
  return new Promise((resolve, reject) => {
    const thumbnails = [];
    let completed = 0;

    // 動画の長さを取得
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const duration = metadata.format.duration;
      const interval = duration / (count + 1);

      for (let i = 1; i <= count; i++) {
        const timestamp = interval * i;
        const outputPath = path.join(outputDir, `thumb_${i}.jpg`);

        ffmpeg(inputPath)
          .seekInput(timestamp)
          .frames(1)
          .size('320x180')
          .output(outputPath)
          .on('end', () => {
            thumbnails.push(outputPath);
            completed++;
            if (completed === count) {
              resolve(thumbnails);
            }
          })
          .on('error', (err) => {
            console.error(`Thumbnail generation failed for ${i}:`, err);
            completed++;
            if (completed === count) {
              resolve(thumbnails);
            }
          })
          .run();
      }
    });
  });
};

/**
 * 動画の最適化（高度版）
 */
const optimizeVideoAdvanced = async (inputPath, outputPath, options = {}) => {
  try {
    console.log('🎬 高度な動画最適化開始...');
    
    const {
      targetQuality = 'standard',
      generateThumbnails = true,
      thumbnailCount = 5,
      onProgress = () => {}
    } = options;

    // 詳細メタデータ取得
    const metadata = await getDetailedVideoMetadata(inputPath);
    console.log('📊 詳細メタデータ:', metadata);
    
    // 品質分析
    const quality = analyzeVideoQuality(metadata);
    console.log('🔍 品質分析:', quality);
    
    // 圧縮設定決定
    const compressionConfig = determineCompressionSettings(metadata, targetQuality);
    console.log('⚙️ 圧縮設定:', compressionConfig);
    
    // 圧縮実行
    const compressedPath = await compressVideoAdvanced(inputPath, outputPath, compressionConfig, onProgress);
    
    // サムネイル生成
    let thumbnails = [];
    if (generateThumbnails) {
      const thumbnailDir = path.dirname(outputPath);
      thumbnails = await generateVideoThumbnails(compressedPath, thumbnailDir, thumbnailCount);
      console.log('🖼️ サムネイル生成完了:', thumbnails.length, '枚');
    }
    
    // 圧縮後のファイルサイズを取得
    const compressedStats = await fs.stat(compressedPath);
    const compressionRatio = (1 - compressedStats.size / metadata.size) * 100;
    
    console.log(`✅ 高度な最適化完了: ${(metadata.size / 1024 / 1024).toFixed(2)}MB → ${(compressedStats.size / 1024 / 1024).toFixed(2)}MB (${compressionRatio.toFixed(1)}%削減)`);
    
    return {
      originalPath: inputPath,
      outputPath: compressedPath,
      metadata,
      quality,
      compressionConfig,
      thumbnails,
      originalSize: metadata.size,
      compressedSize: compressedStats.size,
      compressionRatio,
      optimized: true
    };
    
  } catch (error) {
    console.error('❌ 高度な動画最適化エラー:', error);
    throw error;
  }
};

/**
 * 高度な動画圧縮
 */
const compressVideoAdvanced = (inputPath, outputPath, config, onProgress) => {
  return new Promise((resolve, reject) => {
    const command = ffmpeg(inputPath)
      .videoCodec(config.video.codec)
      .addOption(`-preset ${config.video.preset}`)
      .addOption(`-crf ${config.video.crf}`)
      .addOption(`-maxrate ${config.video.maxrate}`)
      .addOption(`-bufsize ${config.video.bufsize}`)
      .addOption(`-profile:v ${config.video.profile}`)
      .addOption(`-level ${config.video.level}`)
      .addOption(`-pix_fmt ${config.video.pix_fmt}`)
      .videoFilter('scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2')
      .audioCodec(config.audio.codec)
      .audioBitrate(config.audio.bitrate)
      .audioFrequency(config.audio.sampleRate)
      .audioChannels(config.audio.channels)
      .format('mp4')
      .addOption('+faststart')
      .output(outputPath);

    // 進捗監視
    command.on('progress', (progress) => {
      if (progress.percent) {
        onProgress(Math.round(progress.percent));
      }
    });

    command.on('end', () => {
      console.log('✅ 高度な動画圧縮完了');
      resolve(outputPath);
    });

    command.on('error', (err) => {
      console.error('❌ 高度な動画圧縮エラー:', err);
      reject(err);
    });

    command.run();
  });
};

/**
 * 動画の並列処理
 */
const processVideosInParallel = async (videoJobs, maxConcurrent = 3) => {
  const results = [];
  const executing = [];

  for (const job of videoJobs) {
    const promise = optimizeVideoAdvanced(job.inputPath, job.outputPath, job.options)
      .then(result => ({ success: true, result, jobId: job.id }))
      .catch(error => ({ success: false, error, jobId: job.id }));

    results.push(promise);

    if (videoJobs.length >= maxConcurrent) {
      executing.push(promise);
      if (executing.length >= maxConcurrent) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }
  }

  return Promise.all(results);
};

/**
 * 動画キャッシュ管理
 */
class VideoCacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // 最大キャッシュ数
  }

  generateCacheKey(inputPath, options) {
    const hash = crypto.createHash('md5');
    hash.update(inputPath);
    hash.update(JSON.stringify(options));
    return hash.digest('hex');
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

module.exports = {
  optimizeVideoAdvanced,
  getDetailedVideoMetadata,
  analyzeVideoQuality,
  determineCompressionSettings,
  generateVideoThumbnails,
  processVideosInParallel,
  VideoCacheManager,
  ADVANCED_COMPRESSION_CONFIG
};
