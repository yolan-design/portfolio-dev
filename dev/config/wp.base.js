// WEBPACK 5 CONFIG
// - BASE
// - general config

const path = require("path");
const fg = require("fast-glob");
const webpack = require('webpack');
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

        // asset type modules name
        assetModuleFilename: (pathData) => {
            const filepath = path.dirname(pathData.filename).split("/").slice(1).join("/");
            return filepath + "/[name][ext]";
        }
    },

    // How modules are treated
    module: {
        rules: [
            // JS : use babel to transpile
            { test: /\.js$/i, use: 'babel-loader' },

            // Images
            //{ test: /\.(ico|gif|png|jpe?g|svg)$/i, type: 'asset/resource' },

            // Fonts
            //{ test: /\.(woff(2)?|eot|ttf|otf)$/i, type: 'asset/resource' },
        ],
    },

    // Will replace aliases with paths
    resolve: {
        modules: [PATHS.dev, 'node_modules'],
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            "@dev": PATHS.dev,
            "@assets": PATHS.assets,
        },
    },

    // Customize build process
    plugins: [
        // Print build progress
        new webpack.ProgressPlugin(),

        // Generate HTML file for each page
        ...fg.sync(["*/index.html"]).map(pagePath =>
            new HtmlWebpackPlugin({
                template: pagePath, // input file
                filename: pagePath, // output file
                minify: false,

                // head
                meta: {viewport: 'width=device-width, initial-scale=1.0'},
                favicon: PATHS.assets + '/favicons/favicon-y.svg',
                inject : "body",
            })
          ),
    ],
}
