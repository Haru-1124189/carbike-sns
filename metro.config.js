const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// TypeScriptの新しい構文をサポート
config.resolver.sourceExts.push('ts', 'tsx');

// expo-modules-coreの処理を改善
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
