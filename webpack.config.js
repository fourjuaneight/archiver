const { join } = require('path');

const mode = process.env.NODE_ENV || 'production';
const name = mode === 'development' ? `index.${mode}.js` : 'index.js';

module.exports = {
  entry: join(__dirname, 'src/index.ts'),
  context: __dirname,
  output: {
    filename: name,
    path: join(__dirname, 'dist'),
  },
  mode,
  resolve: {
    extensions: ['.ts', '.js'],
    modules: [__dirname, 'node_modules'],
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts/,
        use: {
          loader: 'ts-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    canvas: 'commonjs canvas',
  },
};
