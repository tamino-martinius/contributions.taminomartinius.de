const path = require('path');
const webpack = require('webpack');
const vueLoaderPlugin = require('vue-loader/lib/plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');
const uglifyJsPlugin = require('uglifyjs-webpack-plugin');
const htmlWebpackPlugin = require('html-webpack-plugin');
const cleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].[hash].js',
  },
  module: {
    rules: [{
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.tsx?$/,
        use: [{
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
            options: {
              appendTsSuffixTo: [/\.vue$/],
            },
          }
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]?[hash]',
        },
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.sass$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              indentedSyntax: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
      '@': path.resolve(__dirname, './src'),
    },
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
  },
  performance: {
    hints: false,
  },
  devtool: '#eval-source-map',
  plugins: [
    new webpack.ProvidePlugin({
      'regeneratorRuntime': 'regenerator-runtime/runtime'
    }),
    new cleanWebpackPlugin('./dist'),
    new vueLoaderPlugin(),
    new copyWebpackPlugin([{
      from: 'public',
      to: '',
    }]),
    new htmlWebpackPlugin({
      template: './src/index.html',
      minify: process.env.NODE_ENV === 'production' ? {
        minifyJS: true,
        minifyCSS: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
      } : false,
    }),
  ],
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new uglifyJsPlugin({
      uglifyOptions: {
        sourceMap: true,
        compress: {
          warnings: false,
        },
      },
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  ]);
} else {
  module.exports.mode = 'development';
  module.exports.devServer = {
    port: 3000,
    hot: true,
    host: 'localhost',
    historyApiFallback: true,
    noInfo: false,
    contentBase: './dist',
  };
}

module.exports.plugins = (module.exports.plugins || []).concat([
  new webpack.DefinePlugin({
    DEBUG_MODE: JSON.stringify(process.env.NODE_ENV !== 'production'),
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),
]);
