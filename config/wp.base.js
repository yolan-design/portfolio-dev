// WEBPACK 5 CONFIG
// - BASE
// - general config

const path = require("path");
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");

const PATHS = require('./paths');


// CONFIG
module.exports = {
    // From where it all starts
    entry: {
        app: PATHS.dev + "/main.js"
    },

    // Where everything goes at the end
    output: {
        path: PATHS.build,
        filename: "app.[contenthash].js",

        // asset type modules url
        assetModuleFilename: (pathData) => { return pathData.filename; }
    },

    // How modules are treated
    module: {
        rules: [
            {
                test: /\.((c|sa|sc)ss)$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader', 'sass-loader'],
            },

            // JS : use babel to transpile
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                      presets: [
                        ['@babel/preset-env']
                      ]
                    }
                  }
            },

            // Images
            //{ test: /\.(ico|gif|png|jpe?g|svg)$/i, type: 'asset/resource' },

            // Fonts
            {
                test: /\.(woff(2)?|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator: {
                    emit: false // no copy
                }
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

        // Generate HTML file for each page
        ...PATHS.PAGES.map(pagePath =>
            new HtmlWebpackPlugin({
                template: pagePath[0], // input file
                filename: pagePath[0], // output file
                publicPath: pagePath[2],

                inject: "body",
                scriptLoading: "module",
                minify: false,

                noscript_error: `<noscript><div class="ERROR" translate="yes"><div><span class="t">Something feels wrong...</span><span>Please try,</span><a class="l" href="https://www.enablejavascript.io/" target="_blank"><span>Enabling JavaScript</span></a><a class="l" href="https://browsehappy.com/" target="_blank"><span>Using an up-to-date Internet browser</span></a><span>to continue browsing here.</span></div></div></noscript>`,

                head_settings:`
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="icon" type="image/svg+xml" href="${pagePath[2]}assets/favicons/favicon-y.svg">
    <link rel="alternate icon" type="image/png" sizes="64x64" href="${pagePath[2]}assets/favicons/favicon-y-64.png">
    <link rel="alternate icon" type="image/png" sizes="32x32" href="${pagePath[2]}assets/favicons/favicon-y-32.png">
    <link rel="alternate icon" type="image/png" sizes="16x16" href="${pagePath[2]}assets/favicons/favicon-y-16.png">
`,
            })
        ),
    ],
}
