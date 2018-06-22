
const path = require('path');
const webpack = require('webpack');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const vueLoaderRule = {
  test: /\.vue$/,
  loader: 'vue-loader',
  options: {
    loaders: {
      // Since sass-loader (weirdly) has SCSS as its default parse mode, we map
      // the "scss" and "sass" values for the lang attribute to the right configs here.
      // other preprocessors should work out of the box, no loader config like this necessary.
      scss: 'vue-style-loader!css-loader!sass-loader',
      sass: 'vue-style-loader!css-loader!sass-loader?indentedSyntax',
    },
    // other vue-loader options go here
  },
};

const typeScriptLoaderRule = {
  test: /\.tsx?$/,
  loader: 'ts-loader',
  exclude: /node_modules/,
  options: {
    appendTsSuffixTo: [/\.vue$/],
  },
};

const fileLoaderRule = {
  test: /\.(png|jpg|gif|svg)$/,
  loader: 'file-loader',
  options: {
    name: '[name].[ext]?[hash]',
  },
};

const cssLoaderRule = {
  test: /\.css$/,
  use: [
    'vue-style-loader',
    'css-loader',
  ],
};

const vueLoaderPlugin = new VueLoaderPlugin();
const productionEnvPlugin = new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: '"production"',
  },
});
const uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
  sourceMap: true,
  compress: {
    warnings: false,
  },
});
const loaderOptionsPlugin = new webpack.LoaderOptionsPlugin({
  minimize: true,
});

module.exports = {
  entry: './src/index.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'build.js',
  },
  module: {
    rules: [
      vueLoaderRule,
      typeScriptLoaderRule,
      fileLoaderRule,
      cssLoaderRule,
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.vue', '.json'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
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
    vueLoaderPlugin,
  ],
};

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    productionEnvPlugin,
    uglifyPlugin,
    loaderOptionsPlugin,
  ]);
}
