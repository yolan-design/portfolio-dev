// WEBPACK 5 CONFIG
// - BASE BUILD
// - production build

const { merge } = require("webpack-merge");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');

const PATHS = require('./paths');
const wpBASE = require('./wp.base');

// CONFIG
module.exports = merge(wpBASE, {
    // Where everything goes at the end
    output: {
        publicPath: '/',
    },

    // Will minimize files
    optimization: {
        minimizer: [
            // JS
            new TerserPlugin({
                parallel: true, // faster
                extractComments: false, // clear "LICENSE.txt" files
                terserOptions: { compress: { passes: 2, } }
            }),

            // CSS
            new CssMinimizerPlugin(),
        ]
    },

    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000,
    },

    // Customize build process
    plugins: [
        // Clean build folder
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ["**/*", "!.git/**", "!dev/**", "!old/**", "!*.md"], // exceptions
            verbose: true, // prints what's cleaned
            dry: false // true to test (no deletion)
        }),

        new HtmlInlineScriptPlugin({
            scriptMatchPattern: [/app.+[.]css$/],
            //htmlMatchPattern: [/index.html$/],
        }),
    ],
})