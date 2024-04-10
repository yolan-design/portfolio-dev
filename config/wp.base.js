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
        assetModuleFilename: (pathData) => { return (pathData.filename).replace("dev/", ""); }
    },

    // How modules are treated
    module: {
        rules: [
            {
                test: /\.((c|sa|sc)ss)$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [
                                    require('postcss-easing-gradients'), // https://github.com/larsenwork/postcss-easing-gradients // https://larsenwork.com/easing-gradients/#editor
                                    require('postcss-inline-svg')({ // https://github.com/TrySound/postcss-inline-svg
                                        removeFill: true,
                                        removeStroke: true,
                                    }),
                                    require('postcss-svgo')({ // https://github.com/cssnano/cssnano/tree/master/packages/postcss-svgo
                                        params: {
                                            overrides: {
                                                removeViewBox: false,
                                                removeComments: true,
                                                cleanupNumericValues: {
                                                    floatPrecision: 3
                                                }
                                            }
                                        }
                                    }),
                                    require('postcss-nested')({ // https://github.com/postcss/postcss-nested
                                        preserveEmpty: false
                                    }),
                                    require('postcss-short')({ // https://github.com/csstools/postcss-short
                                        skip: '_'
                                    }),
                                    require('postcss-viewport-height-correction'), // https://github.com/Faisal-Manzer/postcss-viewport-height-correction
                                    require('postcss-preset-env'), // https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env
                                    require('autoprefixer'), // https://github.com/postcss/autoprefixer
                                ],
                            },
                        },
                    },
                    'sass-loader'],
            },

            // JS : use babel to transpile
            {
                test: /\.js$/i,
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
                filename: pagePath[3], // output file
                publicPath: pagePath[2],

                inject: "body",
                scriptLoading: "module",
                minify: false,

                head_settings:`
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="google" content="notranslate" />

<link rel="icon" type="image/svg+xml" href="${pagePath[2]}assets/favicons/favicon-y.svg">
<link rel="alternate icon" type="image/png" sizes="64x64" href="${pagePath[2]}assets/favicons/favicon-y-64.png">
<link rel="alternate icon" type="image/png" sizes="32x32" href="${pagePath[2]}assets/favicons/favicon-y-32.png">
<link rel="alternate icon" type="image/png" sizes="16x16" href="${pagePath[2]}assets/favicons/favicon-y-16.png">
`,
                ...require('../dev/import/parts.js')
            })
        ),
    ],
}
