// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add TypeScript extensions to the resolver
config.resolver.sourceExts = [...config.resolver.sourceExts, 'ts', 'tsx'];
config.resolver.useWatchman = false;

module.exports = withNativeWind(config, { input: './global.css' });
