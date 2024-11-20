const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [new HtmlWebpackPlugin({
    title: 'Piehouse Coop',
   
  })],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.fbx$/,
        loader: 'three-fbx-loader',
      },
      {
        test: /\.fbx$/,
        loader: 'file-loader',
        options: {
          name: 'assets/Pie_Goblin_1110143250.fbx',
        },
        },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
};