const path = require("path");
// const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = function (env = '') {
  return {
    entry: "./client/index.js",
    mode: env === 'prod' ? 'production' : 'development',
    watch: env === 'watch',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /(node_modules|bower_components)/,
          loader: "babel-loader",
          options: { presets: ["@babel/env"] }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
          loader: 'url-loader',
        }
      ]
    },
    resolve: { extensions: ["*", ".js", ".jsx"] },
    output: {
      path: path.resolve(__dirname, "dist/"),
      publicPath: "/",
      filename: "bundle.js"
    },
    devServer: {
      contentBase: path.join(__dirname, "client/"),
      host: '0.0.0.0',
      port: 2048,
    },
    plugins: [
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, 'dist', '*')],
      }),
      new CopyWebpackPlugin([
        {
          from: path.resolve(__dirname, 'client', 'resources'),
          to: path.join(__dirname, 'dist', 'resources'),
          cache: true,
        },
      ]),
      // new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'client', 'index.html'),
        filename: path.resolve(__dirname, 'dist', 'index.html'),
        inject: 'head',
      }),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'assets',
            chunks: 'all',
          },
        },
      },
      minimizer: env === 'prod' ? [
        new UglifyJsPlugin({
          parallel: true,
        }),
        new OptimizeCSSAssetsPlugin({}),
      ] : undefined,
    },
};
}