const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// global.css ko yahan connect karna zaroori hai NativeWind v4 ke liye
module.exports = withNativeWind(config, { input: "./global.css" });