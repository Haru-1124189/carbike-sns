const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// FFmpegのパスを設定
ffmpeg.setFfmpegPath('C:\\ffmpeg\\ffmpeg-8.0-essentials_build\\bin\\ffmpeg.exe');
ffmpeg.setFfprobePath('C:\\ffmpeg\\ffmpeg-8.0-essentials_build\\bin\\ffprobe.exe');

// 圧縮設定
const COMPRESSION_CONFIG = {
  video: {
    codec: 'libx264',
    preset: 'fast', // 高速エンコーディング
    crf: 23, // 品質 (18-28, 低いほど高品質)
    maxrate: '1500k',
    bufsize: '3000k',
    profile: 'high',
    level: '4.0'
  },
  audio: {
    codec: 'aac',
    bitrate: '128k',
    sampleRate: 44100,
    channels: 2
  },
  output: {
    format: 'mp4',
    movflags: '+faststart' // プログレッシブダウンロード対応
  }
};

/**
 * 動画メタデータを取得
 */
const getVideoMetadata = (filePath) => {
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
        size: metadata.format.size
      });
    });
  });
};

/**
 * ファイルハッシュを計算
 */
const calculateFileHash = async (filePath) => {
  const buffer = await fs.readFile(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

/**
 * 動画を圧縮
 */
const compressVideo = (inputPath, outputPath, options = {}) => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = 1280,
      maxHeight = 720,
      quality = 0.8,
      onProgress = () => {}
    } = options;

    const command = ffmpeg(inputPath)
      .videoCodec(COMPRESSION_CONFIG.video.codec)
      .addOption(`-preset ${COMPRESSION_CONFIG.video.preset}`)
      .addOption(`-crf ${Math.round(28 - (quality * 10))}`)
      .addOption(`-maxrate ${COMPRESSION_CONFIG.video.maxrate}`)
      .addOption(`-bufsize ${COMPRESSION_CONFIG.video.bufsize}`)
      .addOption(`-profile:v ${COMPRESSION_CONFIG.video.profile}`)
      .addOption(`-level ${COMPRESSION_CONFIG.video.level}`)
      .videoFilter(`scale='min(${maxWidth},iw)':'min(${maxHeight},ih)':force_original_aspect_ratio=decrease`)
      .audioCodec(COMPRESSION_CONFIG.audio.codec)
      .audioBitrate(COMPRESSION_CONFIG.audio.bitrate)
      .audioFrequency(COMPRESSION_CONFIG.audio.sampleRate)
      .audioChannels(COMPRESSION_CONFIG.audio.channels)
      .format(COMPRESSION_CONFIG.output.format)
      .addOption(COMPRESSION_CONFIG.output.movflags)
      .output(outputPath);

    // 進捗監視
    command.on('progress', (progress) => {
      if (progress.percent) {
        onProgress(Math.round(progress.percent));
      }
    });

    command.on('end', () => {
      console.log('Video compression completed');
      resolve(outputPath);
    });

    command.on('error', (err) => {
      console.error('Video compression failed:', err);
      reject(err);
    });

    command.run();
  });
};

/**
 * 圧縮の必要性を判定
 */
const shouldCompress = (metadata, fileSize) => {
  // ファイルサイズが50MB以上
  if (fileSize > 50 * 1024 * 1024) return true;
  
  // 解像度が720p以上
  if (metadata.width > 1280 || metadata.height > 720) return true;
  
  // ビットレートが2Mbps以上
  if (metadata.bitrate > 2000000) return true;
  
  // 長さが10分以上
  if (metadata.duration > 600) return true;
  
  return false;
};

/**
 * 動画の最適化処理（メイン関数）
 */
const optimizeVideo = async (inputPath, outputPath, options = {}) => {
  try {
    console.log('Starting video optimization...');
    
    // メタデータ取得
    const metadata = await getVideoMetadata(inputPath);
    console.log('Video metadata:', metadata);
    
    // 圧縮の必要性を判定
    const needsCompression = shouldCompress(metadata, metadata.size);
    
    if (!needsCompression) {
      console.log('Video does not need compression, copying original...');
      await fs.copyFile(inputPath, outputPath);
      return {
        originalPath: inputPath,
        outputPath: outputPath,
        compressed: false,
        metadata,
        originalSize: metadata.size,
        compressedSize: metadata.size,
        compressionRatio: 0
      };
    }
    
    // 圧縮実行
    console.log('Compressing video...');
    const compressedPath = await compressVideo(inputPath, outputPath, options);
    
    // 圧縮後のファイルサイズを取得
    const compressedStats = await fs.stat(compressedPath);
    const compressionRatio = (1 - compressedStats.size / metadata.size) * 100;
    
    console.log(`Compression completed: ${(metadata.size / 1024 / 1024).toFixed(2)}MB → ${(compressedStats.size / 1024 / 1024).toFixed(2)}MB (${compressionRatio.toFixed(1)}% reduction)`);
    
    return {
      originalPath: inputPath,
      outputPath: compressedPath,
      compressed: true,
      metadata,
      originalSize: metadata.size,
      compressedSize: compressedStats.size,
      compressionRatio
    };
    
  } catch (error) {
    console.error('Video optimization failed:', error);
    throw error;
  }
};

module.exports = {
  optimizeVideo,
  getVideoMetadata,
  calculateFileHash,
  shouldCompress,
  COMPRESSION_CONFIG
};
