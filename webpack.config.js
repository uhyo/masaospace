'use strict';
const path = require('path');
const webpack = require('webpack');

const plugins = 
    process.env.NODE_ENV === 'production' ?
    [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
        }),
    ] :
    [];

module.exports={
    devtool: 'source-map',
    entry: './dist-client/entrypoint.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'components.js',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'source-map-loader',
                enforce: 'pre',
            },
            {
                test: /\.css$/,
                loaders: ['style-loader', 'css-loader?modules&camelCase', 'postcss-loader'],
            },
            {
                test: /\.json$/,
                loaders: ['json-loader'],
            },
        ]
    },
    plugins,
    resolve: {
        extensions: ['.js'],
        // こうしないとなぜかReactがこわれる
        // modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
    },
    externals: {
        fs: {},
    },
    performance: {
        //bye bye, FIXME...
        hints: false,
    },
    
    devServer: {
        contentBase: './dist',
        port: 8080,
    }
};
