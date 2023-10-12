const { defineConfig } = require("@vue/cli-service");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false,
  configureWebpack: {
    plugins: [
      new NodePolyfillPlugin(),
      new CopyWebpackPlugin({
        patterns: [{ from: './node_modules/@eversdk/lib-web/eversdk.wasm' }],
      })
    ],
    optimization: {
      splitChunks: {
        chunks: "all",
      },
    },
  },
});
