var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var pkg = require('./package');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);
var APP_PATH = path.resolve(__dirname, './src/main.js');
var BUILD_PATH = path.resolve(__dirname, `./build`);

var config = {
  entry: [
    APP_PATH,
  ],
  resolve: {
    root: path.resolve(__dirname, './src')
  },
  output: {
    path: BUILD_PATH,
    filename: 'app.min.js'
  },
  module: {
    loaders: [{
      test: /\.js?$/,
      loaders: ['babel-loader?presets[]=es2015'],
      include: [
        path.resolve(__dirname, './src')
      ]
    }, {
      test: /\.(scss|css)$/,
      //loaders: ['style', 'css', 'sass']
      loader: ExtractTextPlugin.extract('css!sass')
    }, {
      test: /\.html$/,
      loader: 'html'
    },
    {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: "url-loader?limit=10000&mimetype=application/font-woff"
    },
    {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: "file-loader"
    }, {
      test   : /\.(png|jpg)$/,
      loader : 'url-loader?limit=8192'
    }]
  },
  node: {
    fs: "empty"
  }
}

config.plugins = [
  new ExtractTextPlugin('[name].css'),
];

if (process.env.NODE_ENV === 'production') {
  config.module.loaders.push({
    test: /\.js$/,
    loader: 'webpack-replace',
    query: {
      search: 'usingnet.net',
      replace: 'usingnet.com'
    }
  });

  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  }));
  config.plugins.push(new HtmlWebpackPlugin({
    filename: 'index.html',
    template: './index_tpl.ejs',
    inject: true,
    minify: {collapseWhitespace: false}
  }));
} else {
  config.entry.push('webpack/hot/dev-server');
  config.entry.push('webpack-dev-server/client?http://localhost:8080');
}

module.exports = config;
