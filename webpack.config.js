const nodeExternals = require('webpack-node-externals');
const { join } = require('path');

const mode = process.env.NODE_ENV || 'production';

module.exports = {
  output: {
    filename: `worker.${mode}.js`,
    path: join(__dirname, 'dist'),
  },
  mode,
  resolve: {
    extensions: ['.ts', '.js'],
    plugins: [],
  },
  externals: [ nodeExternals() ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
};
