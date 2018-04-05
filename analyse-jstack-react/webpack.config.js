var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var lib = __dirname + '/../resources/public/lib';
var bundleConfig = require(lib + "/bundle-config.json");
var target = __dirname + '/../resources/public';
require("babel-polyfill");

module.exports = {
    entry: {
        hermes: ['babel-polyfill', './index']
    },
    output: {
        path: target,
        filename: '[name].[chunkhash:8].js'
    },
    module: {
        rules: [
            {
                test: /\.js.*$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        ["transform-runtime"],
                        ["import", {"libraryName": "antd", "libraryDirectory": "es", "style": true}]
                    ],
                    presets: ['react', ['env', {modules: false}], 'stage-1']
                }
            }, {
                test: /antd.*\.css$/,
                include: /antd.*/,
                loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[local]'
            },
            {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]_[local]_[hash:base64:5]'
            },
            {
                test: /\.(gif|png)$/,
                exclude: /node_modules/,
                loader: "url-loader?limit=8192"
            },
            {
                test: /\.json$/,
                exclude: /node_modules/,
                loader: "json-loader"
            },
            {
                test: /\.(woff|svg|eot|ttf)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name]__[hash].[ext]'
                        }
                    }
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            javascriptEnabled: true,
                            modifyVars: {
                                'primary-color': '#169BD5'
                            }
                        }
                    }]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json', 'txt'],
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.DllReferencePlugin({
            context: '.',
            /**
             * 在这里引入 manifest 文件
             */
            manifest: require(lib + '/libs-manifest.json')
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true,
                drop_console: true,
                collapse_vars: true,
                reduce_vars: true
            },
            output: {
                comments: false
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new HtmlWebpackPlugin({
            title: 'JAVA-jstack-分析',
            filename: target + '/index.html',
            template: './template.index.html',
            chunks: ['main'],
            bundleName: '/lib/' + bundleConfig.libs.js
        })
    ]
};