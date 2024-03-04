// WEBPACK 5 CONFIG
// - BASE BUILD
// - production build

const { merge } = require("webpack-merge");
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

const PATHS = require('./paths');
const wpBASE = require('./wp.base');

// CONFIG
module.exports = merge(wpBASE, {
    // Where everything goes at the end
    output: {
        publicPath: '/',
        filename: 'js/[name].[contenthash].bundle.js',
    },

    // How modules are treated
    module: {
        rules: [
            {
                test: /\.(sa|sc)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 2,
                            sourceMap: false,
                            modules: false,
                        },
                    },
                    'postcss-loader',
                    'sass-loader',
                ],
            },
        ],
    },

    // Customize build process
    plugins: [
        // Print build progress
        new webpack.ProgressPlugin(),

        // Extract styles as CSS
        new MiniCssExtractPlugin({
            filename: "[name].[contenthash].css"
        }),

        // Clean build folder
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ["**/*", "!.git/**", "!dev/**", "!old/**"], // exceptions
            verbose: true, // prints what's cleaned
            dry: true // true to test (no deletion)
        }),
    ],

    // Will minimize files
    optimization: {
        minimizer: [
            // CSS
            new CssMinimizerPlugin(),

            // JS
            new TerserPlugin({
                extractComments: false, // clear "LICENSE.txt" files
                terserOptions: { compress: { passes: 2, } }
            })
        ]
    },

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },
})