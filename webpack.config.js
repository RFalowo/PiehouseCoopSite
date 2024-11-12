const path = require('path');

module.exports = {
mode: 'production',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
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
};