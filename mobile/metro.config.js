const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Cho phép Metro xử lý các thư viện hiện đại dùng "exports" (Zustand 5, v.v.)
config.resolver.unstable_enablePackageExports = true;

// 2. Hỗ trợ các định dạng file module hiện đại
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

module.exports = config;
