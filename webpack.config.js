const webpack = require('webpack');
const { join } = require('path');

const mode = process.env.NODE_ENV || 'production';

module.exports = {
  output: {
    filename: `worker.${mode}.js`,
    path: join(__dirname, 'dist'),
  },
  mode,
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    plugins: [],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
};
