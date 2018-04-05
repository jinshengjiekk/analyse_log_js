var webpack = require('webpack');
var AssetsPlugin = require('assets-webpack-plugin');
var libPath = __dirname + '/lib/';
require("babel-polyfill");

module.exports = {
    entry: {
        libs: ['babel-polyfill', 'react', 'react-dom', 'lodash', 'immutable']
    },
    output: {
        path: libPath,
        filename: '[name].dll.[chunkhash:8].js',
        /**
         * output.library
         * 将会定义为 window.${output.library}
         * 在这次的例子中，将会定义为`window.vendor_library`
         */
        library: '[name]_library'
    },
    module: {
        loaders: [
            {
                test: /\.js.*$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        ["transform-runtime"],
                        ["import",
                            {"libraryName": "antd", "libraryDirectory": "es", "style": true}
                        ]
                    ],
                    presets: ['react', ['env', {modules: false}], 'stage-1']
                }
            }, {
                test: /\.css$/,
                exclude: /node_modules/,
                loader: 'style-loader!css-loader?modules&importLoaders=1&localIdentName=[name]__[local]___[hash:base64:5]'
            },
            {
                test: /\.(gif|png)$/,
                exclude: /node_modules/,
                loader: "url-loader?limit=1000"
            },
            {
                test: /\.json$/,
                exclude: /node_modules/,
                loader: "json-loader"
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                screw_ie8: true,
                conditionals: true,
                unused: true,
                comparisons: true,
                sequences: true,
                dead_code: true,
                evaluate: true,
                if_return: true,
                join_vars: true
            },
            output: {
                comments: false
            }
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.DllPlugin({
            context: '.',
            /**
             * path
             * 定义 manifest 文件生成的位置
             * [name]的部分由entry的名字替换
             */
            path: libPath + '[name]-manifest.json',
            /**
             * name
             * dll bundle 输出到那个全局变量上
             * 和 output.library 一样即可。
             */
            name: '[name]_library'
        }),
        new AssetsPlugin({
            filename: 'bundle-config.json',
            path: libPath
        })
    ]
};