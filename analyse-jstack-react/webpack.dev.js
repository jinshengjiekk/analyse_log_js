let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        bundle: ['webpack-dev-server/client?http://localhost:8080/', 'webpack/hot/dev-server', './index.js'],
        libs: ['react', 'react-dom', 'lodash', 'immutable']
    },
    output: {
        path: __dirname,
        filename: '[name].js'
    },
    // devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.js.*$/, exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        ["import", {"libraryName": "antd", "libraryDirectory": "es", "style": true}]
                    ],
                    presets: ['react', ['env', {modules: false}], 'stage-1', 'react-hmre']
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
            {test: /\.(gif|png)$/, exclude: /node_modules/, loader: "url-loader?limit=8192"},
            {test: /\.json$/, exclude: /node_modules/, loader: "json-loader"},
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
        new webpack.HotModuleReplacementPlugin(),
        new webpack.optimize.CommonsChunkPlugin('libs'),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('development')
            }
        }),
        new HtmlWebpackPlugin({
            title: 'JAVA_jstack_analyse',
            filename: __dirname + '/index.html',
            template: './template.index.html',
            inject: 'body'
        }),

    ],
    devServer: {
        historyApiFallback: true,
        host: "0.0.0.0",
    }
};